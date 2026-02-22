// store/patchStore.ts

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { WaveformType } from '../types/waveform';

import {
  Patch,
  EditorState,
  Operator,
  GlobalEffects,
  DEFAULT_OPERATOR,
  DEFAULT_ADSR,
  DEFAULT_ALGORITHMS,
  Algorithm
} from '../types/patch';
import {
  AdsrState,
} from '../types/adsr';

const DEFAULT_ALGO_ID = 1;

// Fonction pour créer un patch par défaut
const createDefaultPatch = (): Patch => ({
  name: 'Init Patch',
  bank: 0,
  program: 0,
  author: '',
  description: '',
  tags: [],
  algorithm: DEFAULT_ALGORITHMS[DEFAULT_ALGO_ID],

  // On utilise les opérateurs de l'algorithme qui ont déjà les targets configurés
  operators: DEFAULT_ALGORITHMS[DEFAULT_ALGO_ID].ops.map((op, i) => ({
    ...op,
    enabled: i === 0, // Seul le premier oscillateur est activé par défaut
    frequency: i === 0 ? 8 : 8 * (i + 1) // Fréquences harmoniques
  })),

  modulationMatrix: [],

  global: {
    volume: 0.8,
    transpose: 0,
    fineTune: 0,
    polyphony: 8,
    glideTime: 0,
    bendRange: 2
  },

  effects: {
    reverb: {
      enabled: false,
      room: 0.5,
      damp: 0.5,
      level: 0.3
    },
    delay: {
      enabled: false,
      time: 0.25,
      feedback: 0.4,
      level: 0.2
    },
    chorus: {
      enabled: false,
      rate: 0.5,
      depth: 0.3,
      level: 0.2
    }
  },

  arpeggiator: {
    enabled: false,
    pattern: 'UP',
    rate: 0.125,
    gate: 0.8,
    octaves: 1
  },

  midi: {
    channel: 1,
    velocityCurve: 'LINEAR',
    pitchBendRange: 2,
    modulationWheelTarget: 'LFO_AMOUNT',
    sustainPedalBehavior: 'STANDARD'
  },

  editorMetadata: {
    lastModified: new Date(),
    version: '1.0.0'
  }
});

// État initial
const initialState: EditorState = {
  currentPatch: createDefaultPatch(),
  selectedOperator: 1,
  selectedParameter: null,
  isModified: false,
  clipboard: null,

  ui: {
    activeTab: 'OPERATORS',
    zoomLevel: 1.0,
    showGrid: true,
    showValues: true
  }
};

// Interface du store
interface PatchStore extends EditorState {
  // algo change
  selectAlgorithm: (algorithm: Algorithm) => void;

  // Actions pour les operateurs
  updateOperator: (id: number, changes: Partial<Operator>) => void;
  setOperatorWaveform: (id: number, waveform: WaveformType) => void;
  toggleOperator: (id: number) => void;

  // Actions pour les enveloppes ADSR
  updateADSR: (operatorId: number, envelope: Partial<AdsrState>) => void;
  resetADSR: (operatorId: number) => void;

  // Actions pour la modulation
  addModulation: (sourceId: number, targetId: number, amount: number) => void;
  removeModulation: (sourceId: number, targetId: number) => void;
  updateModulationAmount: (sourceId: number, targetId: number, amount: number) => void;

  // Actions globales
  updateGlobal: (changes: Partial<Patch['global']>) => void;
  updateEffects: (changes: Partial<GlobalEffects>) => void;

  // Actions de l'éditeur
  selectOperator: (id: number) => void;
  setActiveTab: (tab: EditorState['ui']['activeTab']) => void;
  setSelectedParameter: (param: string | null) => void;

  // Gestion des patches
  loadPatch: (patch: Patch) => void;
  savePatch: (patch: Patch) => void;
  resetPatch: () => void;
  copyOperator: (id: number) => void;
  pasteOperator: (id: number) => void;

  // Utilitaires
  markModified: (modified?: boolean) => void;
  getPatch: () => Patch;
  getOperator: (id: number) => Operator | undefined;

  // Actions UI
  setZoomLevel: (level: number) => void;
  toggleGrid: () => void;
  toggleValues: () => void;
}

// Création du store avec Immer
export const usePatchStore = create<PatchStore>()(
  immer((set, get) => ({
    ...initialState,

    // Changer d'algorithme et réaligner la structure des opérateurs
    selectAlgorithm: (algorithm: Algorithm) =>
      set((state) => {
        const previousOperators = state.currentPatch.operators;

        // Recrée la liste des opérateurs en se basant sur l'algo,
        // tout en conservant les paramètres existants et les IMs.
        const newOperators: Operator[] = algorithm.ops.map((algoOp) => {
          const existing = previousOperators.find(op => op.id === algoOp.id);

          // Fusionner les liaisons : préserver les IMs existants si la liaison existe déjà
          const mergedTarget = algoOp.target.map(newLink => {
            const existingLink = existing?.target.find(link => link.id === newLink.id);
            return existingLink ? { ...newLink, im: existingLink.im } : newLink;
          });

          if (existing) {
            return {
              ...existing,
              id: algoOp.id,
              type: algoOp.type,
              target: mergedTarget,
            };
          }

          return {
            ...DEFAULT_OPERATOR,
            id: algoOp.id,
            type: algoOp.type,
            target: mergedTarget,
          };
        });

        state.currentPatch.algorithm = algorithm;
        state.currentPatch.operators = newOperators;

        // S'assurer que l'opérateur sélectionné existe encore
        const maxId = algorithm.ops.length > 0
          ? Math.max(...algorithm.ops.map(o => o.id))
          : 1;
        if (state.selectedOperator < 1 || state.selectedOperator > maxId) {
          state.selectedOperator = 1;
        }

        state.isModified = true;
        state.currentPatch.editorMetadata!.lastModified = new Date();
      }),

    // Actions pour les oscillateurs
    updateOperator: (id: number, changes: Partial<Operator>) =>
      set((state) => {
        const operator = state.currentPatch.operators.find(osc => osc.id === id);
        if (operator) {
          Object.assign(operator, changes);
          state.isModified = true;
          state.currentPatch.editorMetadata!.lastModified = new Date();
        }
      }),

    setOperatorWaveform: (id: number, waveform: WaveformType) =>
      set((state) => {
        const operator = state.currentPatch.operators.find(osc => osc.id === id);
        if (operator) {
          operator.waveform = waveform;
          state.isModified = true;
          state.currentPatch.editorMetadata!.lastModified = new Date();
        }
      }),

    toggleOperator: (id: number) =>
      set((state) => {
        const operator = state.currentPatch.operators.find(osc => osc.id === id);
        if (operator) {
          operator.enabled = !operator.enabled;
          state.isModified = true;
          state.currentPatch.editorMetadata!.lastModified = new Date();
        }
      }),

    // Actions pour les enveloppes ADSR
    updateADSR: (operatorId: number, envelope: Partial<AdsrState>) =>
      set((state) => {
        const operator = state.currentPatch.operators.find(osc => osc.id === operatorId);
        if (operator) {
          Object.assign(operator.adsr, envelope);
          state.isModified = true;
          state.currentPatch.editorMetadata!.lastModified = new Date();
        }
      }),

    resetADSR: (operatorId: number) =>
      set((state) => {
        const operator = state.currentPatch.operators.find(osc => osc.id === operatorId);
        if (operator) {
          operator.adsr = { ...DEFAULT_ADSR };
          state.isModified = true;
          state.currentPatch.editorMetadata!.lastModified = new Date();
        }
      }),

    // Actions pour la modulation
    addModulation: (sourceId: number, targetId: number, amount: number) =>
      set((state) => {
        const sourceOsc = state.currentPatch.operators.find(osc => osc.id === sourceId);
        if (sourceOsc && sourceId !== targetId) {
          // Vérifier si la modulation existe déjà
          const existingMod = sourceOsc.target.find(mod => mod.id === targetId);
          if (!existingMod) {
            sourceOsc.target.push({ id: targetId, im: amount });
            state.isModified = true;
            state.currentPatch.editorMetadata!.lastModified = new Date();
          }
        }
      }),

    removeModulation: (sourceId: number, targetId: number) =>
      set((state) => {
        const sourceOsc = state.currentPatch.operators.find(osc => osc.id === sourceId);
        if (sourceOsc) {
          sourceOsc.target = sourceOsc.target.filter(
            mod => mod.id !== targetId
          );
          state.isModified = true;
          state.currentPatch.editorMetadata!.lastModified = new Date();
        }
      }),

    updateModulationAmount: (sourceId: number, targetId: number, amount: number) =>
      set((state) => {
        const sourceOsc = state.currentPatch.operators.find(osc => osc.id === sourceId);
        if (sourceOsc) {
          const modulation = sourceOsc.target.find(mod => mod.id === targetId);
          if (modulation) {
            modulation.im = Math.max(0, Math.min(100, amount));
            state.isModified = true;
            state.currentPatch.editorMetadata!.lastModified = new Date();
          }
        }
      }),

    // Actions globales
    updateGlobal: (changes: Partial<Patch['global']>) =>
      set((state) => {
        Object.assign(state.currentPatch.global, changes);
        state.isModified = true;
        state.currentPatch.editorMetadata!.lastModified = new Date();
      }),

    updateEffects: (changes: Partial<GlobalEffects>) =>
      set((state) => {
        Object.assign(state.currentPatch.effects, changes);
        state.isModified = true;
        state.currentPatch.editorMetadata!.lastModified = new Date();
      }),

    // Actions de l'éditeur
    selectOperator: (id: number) =>
      set((state) => {
        // IDs d'opérateur sont 1..N
        if (id >= 1 && id <= state.currentPatch.algorithm.ops.length) {
          state.selectedOperator = id;
        }
      }),

    setActiveTab: (tab: EditorState['ui']['activeTab']) =>
      set((state) => {
        state.ui.activeTab = tab;
      }),

    setSelectedParameter: (param: string | null) =>
      set((state) => {
        state.selectedParameter = param;
      }),

    // Gestion des patches
    loadPatch: (patch: Patch) =>
      set((state) => {
        state.currentPatch = { ...patch };
        state.isModified = false;
        state.selectedOperator = 0;
        state.selectedParameter = null;
      }),
    savePatch: (patch: Patch) =>
      set((state) => {
        state.currentPatch = { ...patch };
        state.isModified = false;
        state.selectedOperator = 0;
        state.selectedParameter = null;
      }),

    resetPatch: () =>
      set((state) => {
        state.currentPatch = createDefaultPatch();
        state.isModified = false;
        state.selectedOperator = 0;
        state.selectedParameter = null;
        state.clipboard = null;
      }),

    copyOperator: (id: number) =>
      set((state) => {
        const operator = state.currentPatch.operators.find(osc => osc.id === id);
        if (operator) {
          state.clipboard = { operators: [{ ...operator }] };
        }
      }),

    pasteOperator: (id: number) =>
      set((state) => {
        const targetOsc = state.currentPatch.operators.find(osc => osc.id === id);
        const clipboardOsc = state.clipboard?.operators?.[0];

        if (targetOsc && clipboardOsc) {
          // Copier tous les paramètres sauf l'ID
          const { id: _, ...params } = clipboardOsc;
          Object.assign(targetOsc, params);
          targetOsc.id = id; // Garder l'ID original
          state.isModified = true;
          state.currentPatch.editorMetadata!.lastModified = new Date();
        }
      }),

    // Utilitaires
    markModified: (modified: boolean = true) =>
      set((state) => {
        state.isModified = modified;
        if (modified) {
          state.currentPatch.editorMetadata!.lastModified = new Date();
        }
      }),

    getPatch: () => get().currentPatch,

    getOperator: (id: number) =>
      get().currentPatch.operators.find(osc => osc.id === id),

    // Actions UI
    setZoomLevel: (level: number) =>
      set((state) => {
        state.ui.zoomLevel = Math.max(0.5, Math.min(3.0, level));
      }),

    toggleGrid: () =>
      set((state) => {
        state.ui.showGrid = !state.ui.showGrid;
      }),

    toggleValues: () =>
      set((state) => {
        state.ui.showValues = !state.ui.showValues;
      })
  }))
);

// Hooks utilitaires
export const useCurrentPatch = () => usePatchStore(state => state.currentPatch);
export const useSelectedOperator = () => usePatchStore(state => {
  const { currentPatch, selectedOperator } = state;
  return currentPatch.operators.find(osc => osc.id === selectedOperator);
});
export const useOperator = (operatorId: number) => usePatchStore(state => {
  const { currentPatch } = state;
  return currentPatch.operators.find(osc => osc.id === operatorId);
});

export const updateOperator = (operatorId: number, changes: Partial<Operator>) =>
  usePatchStore.getState().updateOperator(operatorId, changes);

export const selectAlgorithm = (algorithm: Algorithm) =>
  usePatchStore.getState().selectAlgorithm(algorithm);

export const useOperatorEnvelope = (operatorId: number) => usePatchStore(state => {
  const { currentPatch } = state;
  const operator = currentPatch.operators.find(osc => osc.id === operatorId);
  return operator?.adsr;
});
export const updateADSR = (operatorId: number, envelope: Partial<AdsrState>) =>
  usePatchStore.getState().updateADSR(operatorId, envelope);

export const updateModulationAmount = (sourceId: number, targetId: number, amount: number) =>
  usePatchStore.getState().updateModulationAmount(sourceId, targetId, amount);

export const useIsModified = () => usePatchStore(state => state.isModified);
export const useActiveTab = () => usePatchStore(state => state.ui.activeTab);