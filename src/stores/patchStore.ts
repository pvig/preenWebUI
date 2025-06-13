// src/stores/patchStore.mjs
import { create } from 'zustand';

// Configuration des envelopes par défaut
const defaultEnvelope = {
  attack: { level: 64, time: 0 },
  decay: { level: 0, time: 10 },
  sustain: { level: 64, time: 40 },
  release: { level: 64, time: 100 }
};

// Configuration des opérateurs par défaut
const defaultOperators = {
  op1: { freq: 64, env: defaultEnvelope },
  op2: { freq: 64, env: defaultEnvelope },
  op3: { freq: 64, env: defaultEnvelope },
  op4: { freq: 64, env: defaultEnvelope }
};

// Configuration du filtre par défaut
const defaultFilter = {
  cutoff: 60,
  resonance: 40
};

export const usePatchStore = create((set) => ({
  patch: {
    operators: JSON.parse(JSON.stringify(defaultOperators)),
    filter: JSON.parse(JSON.stringify(defaultFilter)),
  },

  updateParam: (path, value) => set(state => {
    const newState = JSON.parse(JSON.stringify(state));
    const keys = path.split('.');
    const lastKey = keys.pop();
    keys.reduce((obj, key) => obj[key], newState)[lastKey] = value;
    //console.log("newState", newState);
    return newState;
  }),

  setEnv: (path, env) => {
    console.log("setEnv", path, env);
  }
}));