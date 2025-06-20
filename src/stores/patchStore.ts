// src/stores/patchStore.ts
import { create } from 'zustand';
import { initialAdsr, type AdsrState } from '../types/adsr';

// Types pour une meilleure maintenabilité
type OperatorNumber = 1 | 2 | 3 | 4 | 5 | 6;
type OperatorKey = `op${OperatorNumber}`;

interface Operator {
  volume: number;
  pan: number;
  freq: number; // 0-127
  fineTune: number; // 0-127
  waveform: number;
  keyboardTracking: number;
  env: AdsrState;
  enabled?: boolean; // Nouveau champ optionnel
}

interface Patch {
  name: string;
  operators: Record<OperatorKey, Operator>;
  algorithm: number;
  // Ajoutez d'autres champs de patch au besoin
}

interface PatchState {
  currentPatch: Patch;
  operators: Record<OperatorKey, Operator>;
  selectedOperator: OperatorNumber;

  // Actions
  pushPatch: () => void;
  pullPatch: (patch: Partial<Patch>) => void;
  updateOperator: (opNumber: OperatorNumber, updates: Partial<Operator>) => void;
  updateAdsr: (opNumber: OperatorNumber, adsr: Partial<AdsrState>) => void;
  selectOperator: (opNumber: OperatorNumber) => void;
  resetOperator: (opNumber: OperatorNumber) => void;
}

const defaultPatch: Patch = {
  name: 'Init Patch',
  operators: {
    op1: { volume: 100, pan: 0, freq: 64, fineTune: 0, waveform: 0, keyboardTracking: 0, env: initialAdsr, enabled: true },
    op2: { volume: 100, pan: 0, freq: 64, fineTune: 0, waveform: 0, keyboardTracking: 0, env: initialAdsr, enabled: true },
    op3: { volume: 100, pan: 0, freq: 64, fineTune: 0, waveform: 0, keyboardTracking: 0, env: initialAdsr, enabled: true },
    op4: { volume: 100, pan: 0, freq: 64, fineTune: 0, waveform: 0, keyboardTracking: 0, env: initialAdsr, enabled: true },
    op5: { volume: 100, pan: 0, freq: 64, fineTune: 0, waveform: 0, keyboardTracking: 0, env: initialAdsr, enabled: true },
    op6: { volume: 100, pan: 0, freq: 64, fineTune: 0, waveform: 0, keyboardTracking: 0, env: initialAdsr, enabled: true }
  },
  algorithm: 1
};

export const usePatchStore = create<PatchState>((set, get) => ({
  currentPatch: defaultPatch,
  operators: defaultPatch.operators,
  selectedOperator: 1,

  pushPatch: () => {
    const { currentPatch } = get();
    // Validation supplémentaire avant envoi
    if (!currentPatch.name) {
      console.warn('Le patch doit avoir un nom');
      return;
    }
    console.log('Envoi du patch:', JSON.stringify(currentPatch, null, 2));
    // Ici vous pourriez ajouter la logique MIDI réelle
  },

  pullPatch: (patch) => {
    set({
      currentPatch: {
        ...defaultPatch, // Conserve les valeurs par défaut pour les champs manquants
        ...patch
      },
      operators: patch.operators || defaultPatch.operators
    });
  },

  updateOperator: (opNumber, updates) => set(state => {
    const opKey: OperatorKey = `op${opNumber}`;
    const updatedOperators = {
      ...state.operators,
      [opKey]: {
        ...state.operators[opKey],
        ...updates
      }
    };

    return {
      operators: updatedOperators,
      currentPatch: {
        ...state.currentPatch,
        operators: updatedOperators
      }
    };
  }),

  updateAdsr: (opNumber, adsr) => set(state => {
    const opKey: OperatorKey = `op${opNumber}`;
    const updatedEnv = {
      ...state.operators[opKey].env,
      ...adsr
    };

    const updatedOperators = {
      ...state.operators,
      [opKey]: {
        ...state.operators[opKey],
        env: updatedEnv
      }
    };

    return {
      operators: updatedOperators,
      currentPatch: {
        ...state.currentPatch,
        operators: updatedOperators
      }
    };
  }),

  selectOperator: (opNumber) => {
    set({ selectedOperator: opNumber });
  },

  resetOperator: (opNumber) => {
    const opKey: OperatorKey = `op${opNumber}`;
    set(state => ({
      operators: {
        ...state.operators,
        [opKey]: {
          ...defaultPatch.operators[opKey],
          freq: state.operators[opKey].freq // Garde la fréquence actuelle
        }
      }
    }));
  },

}));