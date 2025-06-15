// src/stores/patchStore.mjs
import { create } from 'zustand';
import { initialAdsr } from '../types/adsr';

interface Operator {
  freq: number; // 0-127
  env: AdsrState;
}
interface PatchState {
  operators: {
    op1: Operator;
    op2: Operator;
    op3: Operator;
    op4: Operator;
  };

  selectedOperator: number; // 1-4
  updateOperator: (opNumber: number, updates: Partial<Operator>) => void;
  updateAdsr: (opNumber: number, adsr: Partial<AdsrValues>) => void;
}

// Configuration du filtre par défaut
const defaultFilter = {
  cutoff: 60,
  resonance: 40
};


export const usePatchStore = create<PatchState>((set) => ({
  operators: {
    op1: { freq: 64, env: initialAdsr },
    op2: { freq: 64, env: initialAdsr },
    op3: { freq: 64, env: initialAdsr },
    op4: { freq: 64, env: initialAdsr }
  },
  selectedOperator: 1,

  updateOperator: (opNumber, updates) => set(state => {
    const opKey = `op${opNumber}` as keyof typeof state.operators;
    return {
      operators: {
        ...state.operators,
        [opKey]: {
          ...state.operators[opKey],
          ...updates
        }
      }
    };
  }),

  updateAdsr: (opNumber, adsr) => set(state => {
    console.log("updateAdsr", state);
    const opKey = `op${opNumber}` as keyof typeof state.operators;
    return {
      operators: {
        ...state.operators,
        [opKey]: {
          ...state.operators[opKey],
          env: {
            ...state.operators[opKey].env,
            ...adsr
          }
        }
      }
    };
  })
}));