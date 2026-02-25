import { AdsrState, AdsrPoint } from './adsr';
import { WaveformType } from './waveform.ts';
import { ALGO_DIAGRAMS, type AlgoDiagram } from '../algo/algorithms.static';
import { type LfoType, type MidiClockMode } from './lfo';
import { type LFOEnvelope, type StepSequencer } from './modulation';

// types/patch.ts

export interface ModulationTarget {
  operatorId: number;
  amount: number; // -1.0 à 1.0
}

export interface ModulationLink {
  id: number;      // ID de l'opérateur cible
  im: number;      // Index de Modulation (0-100)
  modulationIndexVelo: number; // Sensibilité à la vélocité (0-100)
}

export interface ModulationMatrixRow {
  source: string;        // Source de modulation (e.g., 'LFO 1', 'Aftertouch', etc.)
  destination1: string;  // Première destination
  destination2: string;  // Deuxième destination
  amount: number;        // Montant/Multiplier (-10.0 to 10.0)
}

export type LfoSyncMode = 'Int' | 'Ext';

export interface LFO {
  shape: LfoType;        // Type de forme d'onde (selon firmware PreenFM3)
  syncMode: LfoSyncMode; // Mode de synchronisation (Int = internal 0-99.9 Hz, Ext = MIDI Clock)
  frequency: number;     // Fréquence en Hz (0-99.9) si syncMode='Int'
  midiClockMode: MidiClockMode; // Mode MIDI Clock si syncMode='Ext'
  phase: number;         // Phase initiale (0-360)
  bias: number;          // Offset/Bias (-1.0 to +1.0)
  keysync: 'Off' | number; // Key sync: 'Off' ou 0.0-16.0 (délai de resync)
}

export interface Filter {
  type: 'LOW_PASS' | 'HIGH_PASS' | 'BAND_PASS' | 'NOTCH';
  frequency: number;
  resonance: number;
  gain: number;
}

export interface Operator {
  id: number;
  enabled: boolean;
  frequency: number;      // Fréquence en Hz ou ratio FM
  detune: number;      // Fréquence en Hz ou ratio FM
  keyboardTracking: number;
  frequencyType: 'FIXED' | 'KEYBOARD'; // Suivi du clavier ou fréquence fixe
  waveform: WaveformType;
  amplitude: number;      // 0.0 à 1.0
  pan: number;           // -1.0 (gauche) à 1.0 (droite)
  type: 'CARRIER' | 'MODULATOR'
  target: ModulationLink[];

  // Enveloppe ADSR
  adsr: AdsrState;

  // Paramètres spécifiques PreenFM
  feedbackAmount: number; // Auto-modulation
  velocitySensitivity: number;
}

export interface Algorithm {
  id: String;
  name: String;
  ops: Operator[]
}

export interface GlobalEffects {
  reverb: {
    enabled: boolean;
    room: number;
    damp: number;
    level: number;
  };
  delay: {
    enabled: boolean;
    time: number;
    feedback: number;
    level: number;
  };
  chorus: {
    enabled: boolean;
    rate: number;
    depth: number;
    level: number;
  };
}

export interface ArpeggiatorSettings {
  enabled: boolean;
  pattern: 'UP' | 'DOWN' | 'UP_DOWN' | 'RANDOM' | 'ORDER';
  rate: number;
  gate: number;
  octaves: number;
}

export interface MIDISettings {
  channel: number;        // 1-16
  velocityCurve: 'LINEAR' | 'LOG' | 'EXP' | 'FIXED';
  pitchBendRange: number; // En demi-tons
  modulationWheelTarget: string;
  sustainPedalBehavior: 'STANDARD' | 'SOSTENUTO';
}

export interface Patch {
  // Métadonnées
  name: string;
  bank: number;
  program: number;
  author?: string;
  description?: string;
  tags?: string[];

  algorithm: Algorithm;

  // Oscillateurs (généralement 4 ou 6 selon le modèle PreenFM)
  operators: Operator[];

  // Matrice de modulation globale (12 lignes)
  modulationMatrix: ModulationMatrixRow[];

  // LFOs (3 LFOs selon le PreenFM3) - optionnel pour compatibilité avec anciens patches
  lfos?: [LFO, LFO, LFO];

  // LFO Envelopes (2 enveloppes libres) - optionnel pour compatibilité
  lfoEnvelopes?: [LFOEnvelope, LFOEnvelope];

  // Step Sequencers (2 séquenceurs de pas) - optionnel pour compatibilité
  stepSequencers?: [StepSequencer, StepSequencer];

  // Paramètres globaux
  global: {
    volume: number;           // Volume général
    transpose: number;        // Transposition en demi-tons
    fineTune: number;         // Accord fin en cents
    polyphony: number;        // Nombre de voix de polyphonie
    glideTime: number;        // Portamento
    bendRange: number;        // Plage de pitch bend
    velocitySensitivity: number; // Sensibilité globale à la vélocité (0-16)
  };

  // Effets globaux
  effects: GlobalEffects;

  // Arpégiateur
  arpeggiator: ArpeggiatorSettings;

  // Paramètres MIDI
  midi: MIDISettings;

  // Données brutes PreenFM (pour compatibilité)
  rawData?: Uint8Array;

  // Métadonnées de l'éditeur
  editorMetadata?: {
    lastModified: Date;
    version: string;
    checksum?: string;
  };
}

// Types pour l'état de l'éditeur
export interface EditorState {
  currentPatch: Patch;
  selectedOperator: number;
  selectedParameter: string | null;
  isModified: boolean;
  clipboard: Partial<Patch> | null;

  // État de l'interface
  ui: {
    activeTab: 'OPERATORS' | 'MATRIX' | 'EFFECTS' | 'ARPEGGIATOR' | 'GLOBAL';
    zoomLevel: number;
    showGrid: boolean;
    showValues: boolean;
  };
}

// Types pour les actions du store
export type PatchAction =
  | { type: 'LOAD_PATCH'; payload: Patch }
  | { type: 'UPDATE_OPERATOR'; payload: { id: number; changes: Partial<Operator> } }
  | { type: 'UPDATE_ADSR'; payload: { operatorId: number; envelope: Partial<AdsrState> } }
  | { type: 'UPDATE_ADSR_POINT'; payload: { operatorId: number; point: keyof AdsrState; values: Partial<AdsrPoint> } }
  | { type: 'SET_OPERATOR_WAVEFORM'; payload: { id: number; waveform: WaveformType } }
  | { type: 'UPDATE_GLOBAL'; payload: Partial<Patch['global']> }
  | { type: 'UPDATE_EFFECTS'; payload: Partial<GlobalEffects> }
  | { type: 'ADD_MODULATION'; payload: { sourceId: number; targetId: number; amount: number } }
  | { type: 'REMOVE_MODULATION'; payload: { sourceId: number; targetId: number } }
  | { type: 'SELECT_OPERATOR'; payload: number }
  | { type: 'SET_ACTIVE_TAB'; payload: EditorState['ui']['activeTab'] }
  | { type: 'COPY_OPERATOR'; payload: number }
  | { type: 'PASTE_OPERATOR'; payload: number }
  | { type: 'RESET_PATCH' }
  | { type: 'MARK_MODIFIED'; payload: boolean };

// Utilitaires de type
export type OperatorParameter = keyof Omit<Operator, 'id' | 'adsr' | 'target'>;
export type ADSRParameter = keyof AdsrState;
export type GlobalParameter = keyof Patch['global'];

// Constantes

export const DEFAULT_ADSR: AdsrState = {
  attack: { time: 0, level: 0 },
  decay: { time: 1, level: 100 },
  sustain: { time: 5, level: 30 },
  release: { time: 10, level: 0 }
};

export const DEFAULT_LFO: LFO = {
  shape: 'LFO_SIN',
  syncMode: 'Int',
  frequency: 5.0,
  midiClockMode: 'MC',
  phase: 0,
  bias: 0,
  keysync: 'Off'
};

// Ré-exporter les constantes de modulation
export { DEFAULT_LFO_ENVELOPE, DEFAULT_STEP_SEQUENCER } from './modulation';

export const DEFAULT_OPERATOR: Omit<Operator, 'id'> = {
  enabled: true,
  type: 'CARRIER',
  frequency: 440,
  detune: 0,
  keyboardTracking: 1,
  frequencyType: 'KEYBOARD',
  waveform: 'SINE',
  amplitude: 100,
  pan: 0,
  adsr: DEFAULT_ADSR,
  target: [],
  feedbackAmount: 0,
  velocitySensitivity: 0.5
};

function createOperator(
  id: number,
  type: "CARRIER" | "MODULATOR",
  overrides: Partial<Operator> = {}
): Operator {
  return {
    ...DEFAULT_OPERATOR,
    ...overrides,
    id,
    type
  };
}

/**
 * Convertit un AlgoDiagram (définition visuelle) en Algorithm (définition fonctionnelle)
 * @param diagram - Diagramme de l'algorithme avec nodes et edges
 * @returns Algorithm complet avec opérateurs configurés
 */
function diagramToAlgorithm(diagram: AlgoDiagram): Algorithm {
  // Construire la structure des edges : source -> targets[]
  const edgeMap = new Map<string, string[]>();
  
  diagram.edges.forEach(edge => {
    if (!edgeMap.has(edge.from)) {
      edgeMap.set(edge.from, []);
    }
    edgeMap.get(edge.from)!.push(edge.to);
  });
  
  // Créer les opérateurs
  const ops = diagram.nodes.map(node => {
    const opId = parseInt(node.id.replace(/\D/g, '')); // "op1" -> 1
    const targets = edgeMap.get(node.id) || [];
    
    // Construire la liste des targets (INCLURE les self-loops pour le feedback)
    // Les self-loops (feedback) sont traités comme des targets normaux avec un IM dédié
    const targetLinks: ModulationLink[] = targets.map(targetId => ({
      id: parseInt(targetId.replace(/\D/g, '')),
      im: 0, // Valeur initiale de modulation (IM)
      modulationIndexVelo: 0 // Sensibilité à la vélocité
    }));
    
    return createOperator(opId, node.type, {
      target: targetLinks,
    });
  });
  
  // Trier les opérateurs par ID
  ops.sort((a, b) => a.id - b.id);
  
  return {
    id: diagram.id,
    name: diagram.name,
    ops
  };
}

// Générer automatiquement les 32 algorithmes PreenFM3 à partir des diagrammes visuels
// Cette approche élimine la redondance et garantit la cohérence entre la visualisation et la logique
export const DEFAULT_ALGORITHMS: Algorithm[] = ALGO_DIAGRAMS.map(diagramToAlgorithm);