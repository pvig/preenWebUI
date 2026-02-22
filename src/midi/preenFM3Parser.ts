/**
 * Parser for PreenFM3 NRPN messages
 * Converts NRPN stream into Patch object
 */

import type { Patch } from '../types/patch';
import type { NRPNMessage } from './preenFM3MidiMap';
import { DEFAULT_ALGORITHMS } from '../types/patch';
import { WaveformType } from '../types/waveform';

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
    // Based on firmware row structure: ROW_MODULATION1/2/3 with alternating encoders
    const im1 = (this.getValue(0, 4) ?? 0) / 10; // Index 4: IM1 (0-100 -> 0-10)
    const im2 = (this.getValue(0, 6) ?? 0) / 10; // Index 6: IM2
    const im3 = (this.getValue(0, 8) ?? 0) / 10; // Index 8: IM3
    const im4 = (this.getValue(0, 10) ?? 0) / 10; // Index 10: IM4
    const im5 = (this.getValue(0, 12) ?? 0) / 10; // Index 12: IM5
    const im6 = (this.getValue(0, 14) ?? 0) / 10; // Index 14: IM6 (feedback)
    
    const ims = [im1, im2, im3, im4, im5, im6];
    
    // Appliquer les IMs aux targets (basé sur la topologie de l'algorithme)
    let imIndex = 0;
    operators.forEach(op => {
      op.target.forEach(target => {
        if (imIndex < ims.length) {
          target.im = ims[imIndex];
          imIndex++;
        }
      });
    });
    
    // Paramètres globaux
    const glide = this.getValue(0, 3) ?? 0; // Index 3
    const voices = this.getValue(0, 2) ?? 8; // Index 2
    
    // Créer le patch complet
    const patch: Patch = {
      name,
      bank: 0,
      program: 0,
      algorithm,
      operators,
      modulationMatrix: [],
      global: {
        volume: 0.8,
        transpose: 0,
        fineTune: 0,
        polyphony: voices,
        glideTime: glide,
        bendRange: 2,
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
