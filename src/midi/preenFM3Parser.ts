/**
 * Parser for PreenFM3 NRPN messages
 * Converts NRPN stream into Patch object
 */

import type { Patch } from '../types/patch';
import type { NRPNMessage } from './preenFM3MidiMap';
import { DEFAULT_ALGORITHMS, DEFAULT_LFO, DEFAULT_LFO_ENVELOPE, DEFAULT_STEP_SEQUENCER } from '../types/patch';
import { WaveformType } from '../types/waveform';
import { 
  nrpnToLfoFrequency, 
  parseLfoShape,
  parseLfoBias,
  parseLfoKeysync,
  LFO_BIAS_CENTER,
  type LfoType 
} from '../types/lfo';
import type { LFO } from '../types/patch';

/**
 * NRPN Parser pour PreenFM3
 * Accumule les NRPN et reconstruit un patch
 */
export class PreenFM3Parser {
  private nrpnData: Map<number, number> = new Map();
  private presetName: string[] = [];
  
  /**
   * Ajouter un message NRPN reçu
   */
  addNRPN(nrpn: NRPNMessage): void {
    // Calculer l'index NRPN (paramMSB << 7 | paramLSB)
    const paramIndex = (nrpn.paramMSB << 7) | nrpn.paramLSB;
    
    // Calculer la valeur (valueMSB << 7 | valueLSB)
    const value = (nrpn.valueMSB << 7) | nrpn.valueLSB;
    
    // Nom du preset (NRPN MSB=1, LSB=100-111)
    if (nrpn.paramMSB === 1 && nrpn.paramLSB >= 100 && nrpn.paramLSB <= 111) {
      const charIndex = nrpn.paramLSB - 100;
      const char = String.fromCharCode(value);
      this.presetName[charIndex] = char;
    } else {
      // Stocker le paramètre  
      this.nrpnData.set(paramIndex, value);
    }
  }
  
  /**
   * Obtenir le nom du preset
   */
  getPresetName(): string {
    const name = this.presetName.join('');
    // Arrêter au premier caractère nul (fin de chaîne C)
    const nullIndex = name.indexOf('\x00');
    return (nullIndex >= 0 ? name.substring(0, nullIndex) : name).trim();
  }
  
  /**
   * Obtenir une valeur NRPN brute
   */
  getValue(paramMSB: number, paramLSB: number): number | undefined {
    const index = (paramMSB << 7) | paramLSB;
    return this.nrpnData.get(index);
  }
  
  /**
   * Obtenir une valeur NRPN avec scaling
   */
  getScaledValue(paramMSB: number, paramLSB: number, min: number, max: number): number {
    const raw = this.getValue(paramMSB, paramLSB);
    if (raw === undefined) return min;
    
    // NRPN 14-bit: 0-16383
    return (raw / 16383) * (max - min) + min;
  }
  
  /**
   * Réinitialiser le parser
   */
  reset(): void {
    this.nrpnData.clear();
    this.presetName = [];
  }
  
  /**
   * Obtenir statistiques de réception
   */
  getStats(): { count: number; name: string } {
    return {
      count: this.nrpnData.size,
      name: this.getPresetName(),
    };
  }
  
  /**
   * Logger tous les NRPN reçus (debug)
   */
  logAll(): void {
    console.log('=== NRPN Data ===');
    console.log('Preset Name:', this.getPresetName());
    console.log('Total parameters:', this.nrpnData.size);
    
    // Grouper par MSB
    const byMSB = new Map<number, Array<{ lsb: number; value: number }>>();
    
    this.nrpnData.forEach((value, index) => {
      const msb = index >> 7;
      const lsb = index & 0x7F;
      
      if (!byMSB.has(msb)) {
        byMSB.set(msb, []);
      }
      byMSB.get(msb)!.push({ lsb, value });
    });
    
    // Afficher groupé
    byMSB.forEach((params, msb) => {
      console.log(`\nMSB ${msb}:`);
      params.slice(0, 10).forEach(p => {
        console.log(`  LSB ${p.lsb}: ${p.value} (0x${p.value.toString(16)})`);
      });
      if (params.length > 10) {
        console.log(`  ... et ${params.length - 10} autres`);
      }
    });
  }
  
  /**
   * Convertir les données NRPN en objet Patch
   */
  toPatch(): Patch {
    // Récupérer l'algorithme (index 0, valeur 0-31)
    const algoIndex = this.getValue(0, 0) ?? 0;
    const algorithm = DEFAULT_ALGORITHMS[algoIndex] || DEFAULT_ALGORITHMS[0];
    
    // Nom du preset
    const name = this.getPresetName() || 'MIDI Patch';
    
    // Créer les opérateurs depuis l'algorithme avec les valeurs NRPN
    const operators = algorithm.ops.map((op, i) => {
      // Base index pour ROW_OSCx (ROW_OSC1=44, ROW_OSC2=48, etc.)
      // Chaque ROW_OSC a 4 encoders: shape, frequencyType, frequencyMul, detune
      const oscRowBase = 44 + i * 4;
      
      // Waveform (encoder 0: shape)
      const waveformValue = this.getValue(0, oscRowBase) ?? 0;
      const waveforms: WaveformType[] = ['SINE', 'SAW', 'SQUARE', 'TRIANGLE', 'NOISE', 'USER1'];
      const waveform = waveforms[Math.min(waveformValue, 5)] || 'SINE';
      
      // Fréquence (encoder 2: frequencyMul)
      const freqValue = this.getValue(0, oscRowBase + 2) ?? 1600;
      const frequency = freqValue / 100; // PreenFM3 stocke freq * 100
      
      // Détune (encoder 3: detune)
      const detuneValue = this.getValue(0, oscRowBase + 3) ?? 1600;
      const detune = (detuneValue - 1600) / 100; // Centré sur 1600 pour 0
      
      // ADSR: Les données sont interleaved (Time/Level alternés)
      // ROW_ENV1: indices 68-75 (Attack T/L, Decay T/L, Sustain T/L, Release T/L)
      // ROW_ENV2: indices 76-83, etc.
      const envRowBase = 68 + i * 8; // 8 valeurs par envelope (4 temps + 4 niveaux entrelacés)
      
      // Les temps sont RELATIFS et en centièmes, les niveaux sont déjà en pourcentage (0-100)
      // Il faut les cumuler pour obtenir les positions absolues pour l'UI
      const attackTimeRel = (this.getValue(0, envRowBase + 0) ?? 0) / 100;
      const attackLevel = this.getValue(0, envRowBase + 1) ?? 100;
      const decayTimeRel = (this.getValue(0, envRowBase + 2) ?? 9000) / 100;
      const decayLevel = this.getValue(0, envRowBase + 3) ?? 100;
      const sustainTimeRel = (this.getValue(0, envRowBase + 4) ?? 10000) / 100;
      const sustainLevel = this.getValue(0, envRowBase + 5) ?? 100;
      const releaseTimeRel = (this.getValue(0, envRowBase + 6) ?? 0) / 100;
      const releaseLevel = this.getValue(0, envRowBase + 7) ?? 0;
      
      // Conversion en positions absolues (cumulatives)
      const attackTime = attackTimeRel;
      const decayTime = attackTime + decayTimeRel;
      const sustainTime = decayTime + sustainTimeRel;
      const releaseTime = sustainTime + releaseTimeRel;
      
      // Note: Les courbes ADSR (ROW_ENV1_CURVE) ne sont pas transmises via NRPN par le firmware
      // On utilise donc les valeurs par défaut de l'algorithme
      
      return {
        ...op,
        waveform,
        frequency,
        detune,
        // Créer une copie profonde des targets pour éviter les erreurs de lecture seule
        target: op.target.map(t => ({ ...t })),
        adsr: {
          attack: { time: attackTime, level: attackLevel },
          decay: { time: decayTime, level: decayLevel },
          sustain: { time: sustainTime, level: sustainLevel },
          release: { time: releaseTime, level: releaseLevel },
          // Les courbes restent celles définies dans l'algorithme par défaut
          curves: op.adsr.curves,
        },
      };
    });
    
    // Modulation Indexes (IM1-IM6): indices 4, 6, 8, 10, 12, 14
    // Modulation Velo (IMVelo1-6): indices 5, 7, 9, 11, 13, 15
    // Based on firmware row structure: ROW_MODULATION1/2/3 with alternating encoders
    const im1 = (this.getValue(0, 4) ?? 0) / 10; // Index 4: IM1 (0-100 -> 0-10)
    const im2 = (this.getValue(0, 6) ?? 0) / 10; // Index 6: IM2
    const im3 = (this.getValue(0, 8) ?? 0) / 10; // Index 8: IM3
    const im4 = (this.getValue(0, 10) ?? 0) / 10; // Index 10: IM4
    const im5 = (this.getValue(0, 12) ?? 0) / 10; // Index 12: IM5
    const im6 = (this.getValue(0, 14) ?? 0) / 10; // Index 14: IM6 (feedback)
    
    const imVelo1 = (this.getValue(0, 5) ?? 0) / 10; // Index 5: IMVelo1
    const imVelo2 = (this.getValue(0, 7) ?? 0) / 10; // Index 7: IMVelo2
    const imVelo3 = (this.getValue(0, 9) ?? 0) / 10; // Index 9: IMVelo3
    const imVelo4 = (this.getValue(0, 11) ?? 0) / 10; // Index 11: IMVelo4
    const imVelo5 = (this.getValue(0, 13) ?? 0) / 10; // Index 13: IMVelo5
    const imVelo6 = (this.getValue(0, 15) ?? 0) / 10; // Index 15: IMVelo6
    
    const ims = [im1, im2, im3, im4, im5, im6];
    const imVelos = [imVelo1, imVelo2, imVelo3, imVelo4, imVelo5, imVelo6];
    
    // Appliquer les IMs aux targets (basé sur la topologie de l'algorithme)
    let imIndex = 0;
    operators.forEach(op => {
      op.target.forEach(target => {
        if (imIndex < ims.length) {
          target.im = ims[imIndex];
          target.modulationIndexVelo = imVelos[imIndex] ?? 0;
          imIndex++;
        }
      });
    });
    
    // Paramètres globaux (NRPN MSB=0)
    const velocity = this.getValue(0, 1) ?? 8; // Index 1: Velocity (0-16)
    const glide = this.getValue(0, 3) ?? 0; // Index 3: Glide (0-10)
    
    // NOTE IMPORTANTE: Le nombre de voix n'est PAS transmis lors du patch dump sur PreenfM3
    // - Sur PreenfM2: NRPN [0,2] = numberOfVoices (1-16)
    // - Sur PreenfM3: Le MÊME NRPN est réutilisé pour Play Mode (Poly/Mono/Unison)
    // - Le patch dump (NRPN [127,127]) N'INCLUT PAS le Mixer State (volume, pan, voices)
    // - L'éditeur officiel ne récupère pas non plus ce paramètre
    // Solution: Valeur par défaut 8 voix (à ajuster manuellement dans l'UI)
    const voices = this.getValue(0, 2) ?? 8;
    
    // Créer le patch complet
    const patch: Patch = {
      name,
      bank: 0,
      program: 0,
      algorithm,
      operators,
      modulationMatrix: this.parseModulationMatrix(),
      
      // LFO parsing from NRPN
      // Based on firmware: ROW_LFOOSC1/2/3 (indices 42-44) and ROW_LFOPHASES (45)
      // After getMidiIndexFromMemory() transformation:
      // - LFO1: MSB=1, LSB 40-43 (shape, freq, bias, keysync)
      // - LFO2: MSB=1, LSB 44-47 (shape, freq, bias, keysync)
      // - LFO3: MSB=1, LSB 48-51 (shape, freq, bias, keysync)
      // - Phases: MSB=1, LSB 68-70 (phase1, phase2, phase3)
      lfos: [0, 1, 2].map(lfoIndex => {
        const lfoBase = 40 + lfoIndex * 4; // 40, 44, 48
        
        // Shape (0-7 → LfoType)
        const shapeRaw = this.getValue(1, lfoBase) ?? 0;
        const shape = parseLfoShape(shapeRaw);
        
        // Frequency: detect sync mode based on NRPN value
        const freqRaw = this.getValue(1, lfoBase + 1) ?? 0;
        const freqParsed = nrpnToLfoFrequency(freqRaw);
        
        let syncMode: 'Int' | 'Ext';
        let frequency: number;
        let midiClockMode: any;
        
        if (typeof freqParsed === 'string') {
          // External MIDI Clock mode
          syncMode = 'Ext';
          frequency = 5.0; // Default frequency (not used in Ext mode)
          midiClockMode = freqParsed;
        } else {
          // Internal frequency mode
          syncMode = 'Int';
          frequency = freqParsed;
          midiClockMode = 'MC'; // Default MIDI clock mode (not used in Int mode)
        }
        
        // Bias (0-200 → -1.0 to +1.0)
        const biasRaw = this.getValue(1, lfoBase + 2) ?? LFO_BIAS_CENTER;
        const bias = parseLfoBias(biasRaw);
        
        // Keysync (0 = 'Off', 1-1601 = 0.0-16.0)
        const keysyncRaw = this.getValue(1, lfoBase + 3) ?? 0;
        const keysync = parseLfoKeysync(keysyncRaw);
        
        // Phase (0-16383 → 0-360) - stored separately at LSB 68-70
        const phase = this.getScaledValue(1, 68 + lfoIndex, 0, 360);
        
        return {
          shape,
          syncMode,
          frequency,
          midiClockMode,
          phase,
          bias,
          keysync
        };
      }) as [LFO, LFO, LFO],
      
      // TODO: LFO Envelopes and Step Sequencers
      // LFO ENV: indices ROW_LFOENV1, ROW_LFOENV2 (ADSR + loop mode)
      // Step Seq: MSB=2-3, LSB=step number (16 steps par séquenceur)
      lfoEnvelopes: [
        { ...DEFAULT_LFO_ENVELOPE },
        { ...DEFAULT_LFO_ENVELOPE }
      ],
      stepSequencers: [
        { ...DEFAULT_STEP_SEQUENCER },
        { ...DEFAULT_STEP_SEQUENCER }
      ],
      
      global: {
        volume: 0.8,
        transpose: 0,
        fineTune: 0,
        polyphony: voices,
        glideTime: glide,
        bendRange: 2,
        velocitySensitivity: velocity,
      },
      effects: {
        reverb: { enabled: false, room: 0.5, damp: 0.5, level: 0.3 },
        delay: { enabled: false, time: 0.5, feedback: 0.3, level: 0.3 },
        chorus: { enabled: false, rate: 0.5, depth: 0.3, level: 0.3 },
      },
      arpeggiator: {
        enabled: false,
        pattern: 'UP',
        rate: 0.25,
        gate: 0.8,
        octaves: 1,
      },
      midi: {
        channel: 1,
        velocityCurve: 'LINEAR',
        pitchBendRange: 2,
        modulationWheelTarget: 'LFO1_AMOUNT',
        sustainPedalBehavior: 'STANDARD',
      },
      editorMetadata: {
        lastModified: new Date(),
        version: '1.0.0',
      },
    };
    
    return patch;
  }

  /**
   * Parser la matrice de modulation depuis les données NRPN
   * Structure documentée: 3 paramètres par ligne (Source, Multiplier, Destination)
   * MAIS le preenfm2Controller montre 2 destinations, donc il y a probablement un 4ème paramètre
   * Lignes 1-3: MSB=0, LSB=116 + (ligne-1)*4
   * Lignes 4-12: MSB=1, LSB=(ligne-4)*4
   */
  private parseModulationMatrix(): Array<{
    source: string;
    destination1: string;
    destination2: string;
    amount: number;
  }> {
    const matrix: Array<{
      source: string;
      destination1: string;
      destination2: string;
      amount: number;
    }> = [];

    // Mapping des sources (SourceEnum du firmware PreenFM3)
    const sourceNames = [
      'None',          // 0 - MATRIX_SOURCE_NONE
      'LFO 1',         // 1 - MATRIX_SOURCE_LFO1
      'LFO 2',         // 2 - MATRIX_SOURCE_LFO2
      'LFO 3',         // 3 - MATRIX_SOURCE_LFO3
      'LFOEnv1',       // 4 - MATRIX_SOURCE_LFOENV1
      'LFOEnv2',       // 5 - MATRIX_SOURCE_LFOENV2
      'LFOSeq1',       // 6 - MATRIX_SOURCE_LFOSEQ1
      'LFOSeq2',       // 7 - MATRIX_SOURCE_LFOSEQ2
      'Modwheel',      // 8 - MATRIX_SOURCE_MODWHEEL
      'Pitchbend',     // 9 - MATRIX_SOURCE_PITCHBEND
      'Aftertouch',    // 10 - MATRIX_SOURCE_AFTERTOUCH
      'Velocity',      // 11 - MATRIX_SOURCE_VELOCITY
      'Note1',         // 12 - MATRIX_SOURCE_NOTE1
      'CC1',           // 13 - MATRIX_SOURCE_CC1
      'CC2',           // 14 - MATRIX_SOURCE_CC2
      'CC3',           // 15 - MATRIX_SOURCE_CC3
      'CC4',           // 16 - MATRIX_SOURCE_CC4
      'Note2',         // 17 - MATRIX_SOURCE_NOTE2
      'Breath',        // 18 - MATRIX_SOURCE_BREATH
      'MPE Slide',     // 19 - MATRIX_SOURCE_MPESLIDE
      'Random',        // 20 - MATRIX_SOURCE_RANDOM
      'Poly AT',       // 21 - MATRIX_SOURCE_POLYPHONIC_AFTERTOUCH
      'User CC1',      // 22 - MATRIX_SOURCE_USER_CC1
      'User CC2',      // 23 - MATRIX_SOURCE_USER_CC2
      'User CC3',      // 24 - MATRIX_SOURCE_USER_CC3
      'User CC4',      // 25 - MATRIX_SOURCE_USER_CC4
      'PB MPE',        // 26 - MATRIX_SOURCE_PITCHBEND_MPE
      'AT MPE',        // 27 - MATRIX_SOURCE_AFTERTOUCH_MPE
    ];

    // Mapping des destinations (DestinationEnum du firmware PreenFM3)
    const destNames = [
      'None',          // 0 - DESTINATION_NONE
      'Gate',          // 1 - MAIN_GATE
      'IM1',           // 2 - INDEX_MODULATION1
      'IM2',           // 3 - INDEX_MODULATION2
      'IM3',           // 4 - INDEX_MODULATION3
      'IM4',           // 5 - INDEX_MODULATION4
      'IM*',           // 6 - INDEX_ALL_MODULATION
      'Mix1',          // 7 - MIX_OSC1
      'Pan1',          // 8 - PAN_OSC1
      'Mix2',          // 9 - MIX_OSC2
      'Pan2',          // 10 - PAN_OSC2
      'Mix3',          // 11 - MIX_OSC3
      'Pan3',          // 12 - PAN_OSC3
      'Mix4',          // 13 - MIX_OSC4
      'Pan4',          // 14 - PAN_OSC4
      'Mix*',          // 15 - ALL_MIX
      'Pan*',          // 16 - ALL_PAN
      'o1 Fq',         // 17 - OSC1_FREQ
      'o2 Fq',         // 18 - OSC2_FREQ
      'o3 Fq',         // 19 - OSC3_FREQ
      'o4 Fq',         // 20 - OSC4_FREQ
      'o5 Fq',         // 21 - OSC5_FREQ
      'o6 Fq',         // 22 - OSC6_FREQ
      'o* Fq',         // 23 - ALL_OSC_FREQ
      'Env1 A',        // 24 - ENV1_ATTACK
      'Env2 A',        // 25 - ENV2_ATTACK
      'Env3 A',        // 26 - ENV3_ATTACK
      'Env4 A',        // 27 - ENV4_ATTACK
      'Env5 A',        // 28 - ENV5_ATTACK
      'Env6 A',        // 29 - ENV6_ATTACK
      'Env* A',        // 30 - ALL_ENV_ATTACK
      'Env* R',        // 31 - ALL_ENV_RELEASE
      'Mtx1 x',        // 32 - MTX1_MUL
      'Mtx2 x',        // 33 - MTX2_MUL
      'Mtx3 x',        // 34 - MTX3_MUL
      'Mtx4 x',        // 35 - MTX4_MUL
      'Lfo1 F',        // 36 - LFO1_FREQ
      'Lfo2 F',        // 37 - LFO2_FREQ
      'Lfo3 F',        // 38 - LFO3_FREQ
      'Env2 S',        // 39 - LFOENV2_SILENCE
      'Seq1 G',        // 40 - LFOSEQ1_GATE
      'Seq2 G',        // 41 - LFOSEQ2_GATE
      'Flt1 P1',       // 42 - FILTER1_PARAM1
      'o* FqH',        // 43 - ALL_OSC_FREQ_HARM
      'Env* D',        // 44 - ALL_ENV_DECAY
      'EnvM A',        // 45 - ALL_ENV_ATTACK_MODULATOR
      'EnvM D',        // 46 - ALL_ENV_DECAY_MODULATOR
      'EnvM R',        // 47 - ALL_ENV_RELEASE_MODULATOR
      'Mtx FB',        // 48 - MTX_DEST_FEEDBACK
      'Flt1 P2',       // 49 - FILTER1_PARAM2
      'Flt1 G',        // 50 - FILTER1_AMP
      'Flt2 P1',       // 51 - FILTER2_PARAM1
      'Flt2 P2',       // 52 - FILTER2_PARAM2
      'Flt2 G',        // 53 - FILTER2_AMP
    ];

    for (let row = 0; row < 12; row++) {
      let msb: number, lsbBase: number;

      if (row < 3) {
        // Lignes 1-3: MSB=0, LSB=116 + row*4
        msb = 0;
        lsbBase = 116 + row * 4;
      } else {
        // Lignes 4-12: MSB=1, LSB=(row-3)*4
        msb = 1;
        lsbBase = (row - 3) * 4;
      }

      // Lire les 4 paramètres possibles de la ligne
      const sourceValue = this.getValue(msb, lsbBase) ?? 0;
      const multiplierValue = this.getValue(msb, lsbBase + 1) ?? 1000; // 1000 = 0.0
      const dest1Value = this.getValue(msb, lsbBase + 2) ?? 0;
      const dest2Value = this.getValue(msb, lsbBase + 3) ?? 0; // Peut-être non transmis

      // Debug
      if (row === 0 && (sourceValue !== 0 || multiplierValue !== 1000 || dest1Value !== 0)) {
        console.log(`Matrix Row 1 NRPN: MSB=${msb}, LSB=${lsbBase}`);
        console.log(`  Source=${sourceValue}, Mult=${multiplierValue}, Dest1=${dest1Value}, Dest2=${dest2Value}`);
      }

      // Convertir les valeurs
      const source = sourceNames[sourceValue] || `Unknown(${sourceValue})`;
      const destination1 = destNames[dest1Value] || `Unknown(${dest1Value})`;
      const destination2 = destNames[dest2Value] || 'None';
      
      // Multiplier: 0=-10.0, 1000=0.0, 2000=10.0
      const amount = (multiplierValue - 1000) / 100;

      matrix.push({
        source,
        destination1,
        destination2,
        amount,
      });
    }

    return matrix;
  }
}

/**
 * Helper pour décoder un paramètre depuis l'index mémoire PreenFM3
 * Basé sur getMidiIndexFromMemory() du firmware
 */
export function getMemoryIndexFromMidi(midiIndex: number): number {
  const paramRow = (midiIndex >> 2) & 0xFF;
  const encoder = midiIndex & 0x03;
  
  // Appliquer les transformations inverses du firmware
  // Ces valeurs correspondent aux ROW_ constants du firmware
  let adjustedRow = paramRow;
  
  // Ajustements basés sur MidiDecoder.cpp
  if (paramRow >= 24) { // Après ROW_LFOPHASES
    adjustedRow -= 4;
  } else if (paramRow >= 20 && paramRow < 24) { // ROW_LFOENV1, LFOENV2, LFOSEQ1, LFOSEQ2
    adjustedRow += 1;
  }
  
  return (adjustedRow << 2) | encoder;
}

/**
 * Noms des paramètres pour debug (partiel)
 */
export const PARAM_NAMES: Record<number, string> = {
  // Engine (MSB 0, LSB 0-15)
  0: 'Algorithm',
  1: 'Velocity',
  2: 'Voices',
  3: 'Glide',
  
  // Modulation (MSB 0, LSB 16-31)
  16: 'IM1',
  17: 'IM2',
  18: 'IM3',
  19: 'IM4',
  20: 'IM5',
  21: 'IM6 (FB)',
  
  // Mix (MSB 0, LSB 32-47)
  32: 'Mix1',
  33: 'Mix2',
  34: 'Mix3',
  35: 'Mix4',
  36: 'Pan1',
  37: 'Pan2',
  38: 'Pan3',
  39: 'Pan4',
  
  // Etc...
};
