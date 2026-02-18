import { AdsrState, AdsrPoint } from './adsr';
import { WaveformType } from './waveform.ts';

// types/patch.ts

export interface ModulationTarget {
  operatorId: number;
  amount: number; // -1.0 à 1.0
}

export interface LFO {
  shape: WaveformType;
  frequency: number;
  amount: number;
  destination: string; // 'FREQUENCY', 'AMPLITUDE', etc.
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
  frequencyType: 'FIXED' | 'KEYBOARD'; // Suivi du clavier ou fréquence fixe
  waveform: WaveformType;
  amplitude: number;      // 0.0 à 1.0
  pan: number;           // -1.0 (gauche) à 1.0 (droite)
  type: 'CARRIER' | 'MODULATOR'
  target: number[];

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

  // Matrice de modulation globale
  modulationMatrix: {
    source: string;
    destination: string;
    amount: number;
  }[];

  // Paramètres globaux
  global: {
    volume: number;           // Volume général
    transpose: number;        // Transposition en demi-tons
    fineTune: number;         // Accord fin en cents
    polyphony: number;        // Nombre de voix de polyphonie
    glideTime: number;        // Portamento
    bendRange: number;        // Plage de pitch bend
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
  decay: { time: 3, level: 100 },
  sustain: { time: 30, level: 30 },
  release: { time: 100, level: 0 }
};

export const DEFAULT_OPERATOR: Omit<Operator, 'id'> = {
  enabled: true,
  type: 'CARRIER',
  frequency: 440,
  detune: 0,
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

export const DEFAULT_ALGORITHMS: Algorithm[] = [
  {
    id: "alg1",
    name: "1 Carrier, 1 Modulator",
    ops: [
      createOperator(1, "CARRIER"),
      createOperator(2, "MODULATOR", { target: [1] }),
    ],
  },
  {
    id: "alg2",
    name: "2 Carriers indépendants",
    ops: [
      createOperator(1, "CARRIER"),
      createOperator(2, "CARRIER")
    ],
  },
  {
    id: "alg3",
    name: "2 Modulators en série vers 1 Carrier",
    ops: [
      createOperator(1, "CARRIER"),
      createOperator(2, "MODULATOR", { target: [1] }),
      createOperator(3, "MODULATOR", { target: [2] })
    ],
  },
  {
    id: "alg4",
    name: "1 Modulator vers 2 Carriers",
    ops: [
      createOperator(1, "CARRIER"),
      createOperator(2, "MODULATOR", { target: [1, 3] }),
      createOperator(3, "CARRIER")
    ],
  },
];