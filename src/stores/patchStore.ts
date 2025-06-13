// src/stores/patchStore.mjs
import { create } from 'zustand';

// Configuration des opérateurs par défaut
const defaultOperators = {
  op1: { freq: 64, env: [50, 30, 70, 20] },
  op2: { freq: 64, env: [50, 30, 70, 20] },
  op3: { freq: 64, env: [50, 30, 70, 20] },
  op4: { freq: 64, env: [50, 30, 70, 20] }
};

// Configuration du filtre par défaut
const defaultFilter = {
  cutoff: 60,
  resonance: 40
};

export const usePatchStore = create((set) => ({
  operators: JSON.parse(JSON.stringify(defaultOperators)),
  filter: JSON.parse(JSON.stringify(defaultFilter)),

  updateParam: (path, value) => set(state => {
    const newState = JSON.parse(JSON.stringify(state));
    const keys = path.split('.');
    const lastKey = keys.pop();
    keys.reduce((obj, key) => obj[key], newState)[lastKey] = value;
    console.log("newState", newState);
    return newState;
  })
}));