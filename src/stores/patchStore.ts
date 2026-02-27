// store/patchStore.ts

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { WaveformType } from '../types/waveform';
import { sendOperatorMix, sendOperatorPan } from '../midi/midiService';

import {
  Patch,
  EditorState,
  Operator,
  GlobalEffects,
  DEFAULT_OPERATOR,
  DEFAULT_ADSR,
  DEFAULT_LFO,
  DEFAULT_LFO_ENVELOPE,
  DEFAULT_STEP_SEQUENCER,
  DEFAULT_ALGORITHMS,
  Algorithm,
  ModulationMatrixRow
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

  modulationMatrix: Array(12).fill(null).map(() => ({
    source: 'None',
    destination1: 'None',
    destination2: 'None',
    amount: 0
  })),

  // 3 LFOs par défaut
  lfos: [
    { ...DEFAULT_LFO },
    { ...DEFAULT_LFO },
    { ...DEFAULT_LFO }
  ],

  // 2 LFO Envelopes par défaut
  lfoEnvelopes: [
    { ...DEFAULT_LFO_ENVELOPE },
    { ...DEFAULT_LFO_ENVELOPE }
  ],

  // 2 Step Sequencers par défaut
  stepSequencers: [
    { ...DEFAULT_STEP_SEQUENCER },
    { ...DEFAULT_STEP_SEQUENCER }
  ],

  global: {
    volume: 0.8,
    transpose: 0,
    fineTune: 0,
    polyphony: 8,
    glideTime: 0,
    bendRange: 2,
    velocitySensitivity: 8 // Valeur médiane 0-16
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

  filters: [
    {
      type: 'OFF',
      param1: 0,
      param2: 0,
      gain: 0
    },
    {
      type: 'OFF',
      param1: 0,
      param2: 0,
      gain: 0
    }
  ],

  arpeggiator: {
    clock: 120,
    direction: 'Up',
    octave: 1,
    pattern: 'Pattern1',
    division: '1/8',
    duration: '50%',
    latch: 'Off'
  },

  noteCurves: [
    {
      before: 'Flat',
      breakNote: 60,  // Note C3/C4 (MIDI middle C)
      after: 'Flat'
    },
    {
      before: 'Flat',
      breakNote: 60,
      after: 'Flat'
    }
  ],

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

/**
 * Helper to safely update patch lastModified timestamp
 */
function updateLastModified(patch: Patch): void {
  if (!patch.editorMetadata) {
    patch.editorMetadata = {
      lastModified: new Date(),
      version: '1.0.0',
    };
  } else {
    patch.editorMetadata.lastModified = new Date();
  }
}

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
  updateModulationVelo: (sourceId: number, targetId: number, velo: number) => void;

  // Actions pour la matrice de modulation
  updateModulationMatrixRow: (rowIndex: number, changes: Partial<ModulationMatrixRow>) => void;

  // Actions pour les LFO
  updateLfo: (lfoIndex: 0 | 1 | 2, changes: Partial<import('../types/patch').LFO>) => void;

  // Actions pour les LFO Envelopes
  updateLfoEnvelope: (envIndex: 0 | 1, changes: Partial<import('../types/modulation').LFOEnvelope>) => void;

  // Actions pour les Step Sequencers
  updateStepSequencer: (seqIndex: 0 | 1, changes: Partial<import('../types/modulation').StepSequencer>) => void;

  // Actions globales
  updateGlobal: (changes: Partial<Patch['global']>) => void;
  updateEffects: (changes: Partial<GlobalEffects>) => void;

  // Actions pour les filtres
  updateFilter: (filterIndex: 0 | 1, changes: Partial<import('../types/patch').Filter>) => void;

  // Actions pour l'arpégiateur
  updateArpeggiator: (changes: Partial<import('../types/patch').ArpeggiatorSettings>) => void;

  // Actions pour les note curves
  updateNoteCurve: (curveIndex: 0 | 1, changes: Partial<import('../types/patch').NoteCurve>) => void;

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
        updateLastModified(state.currentPatch);
      }),

    // Actions pour les oscillateurs
    updateOperator: (id: number, changes: Partial<Operator>) =>
      set((state) => {
        const operator = state.currentPatch.operators.find(osc => osc.id === id);
        if (operator) {
          Object.assign(operator, changes);
          state.isModified = true;
          updateLastModified(state.currentPatch);
        }
      }),

    setOperatorWaveform: (id: number, waveform: WaveformType) =>
      set((state) => {
        const operator = state.currentPatch.operators.find(osc => osc.id === id);
        if (operator) {
          operator.waveform = waveform;
          state.isModified = true;
          updateLastModified(state.currentPatch);
        }
      }),

    toggleOperator: (id: number) =>
      set((state) => {
        const operator = state.currentPatch.operators.find(osc => osc.id === id);
        if (operator) {
          operator.enabled = !operator.enabled;
          state.isModified = true;
          updateLastModified(state.currentPatch);
        }
      }),

    // Actions pour les enveloppes ADSR
    updateADSR: (operatorId: number, envelope: Partial<AdsrState>) =>
      set((state) => {
        const operator = state.currentPatch.operators.find(osc => osc.id === operatorId);
        if (operator) {
          Object.assign(operator.adsr, envelope);
          state.isModified = true;
          updateLastModified(state.currentPatch);
        }
      }),

    resetADSR: (operatorId: number) =>
      set((state) => {
        const operator = state.currentPatch.operators.find(osc => osc.id === operatorId);
        if (operator) {
          operator.adsr = { ...DEFAULT_ADSR };
          state.isModified = true;
          updateLastModified(state.currentPatch);
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
            sourceOsc.target.push({ id: targetId, im: amount, modulationIndexVelo: 0 });
            state.isModified = true;
            updateLastModified(state.currentPatch);
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
          updateLastModified(state.currentPatch);
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
            updateLastModified(state.currentPatch);
          }
        }
      }),

    updateModulationVelo: (sourceId: number, targetId: number, velo: number) =>
      set((state) => {
        const sourceOsc = state.currentPatch.operators.find(osc => osc.id === sourceId);
        if (sourceOsc) {
          const modulation = sourceOsc.target.find(mod => mod.id === targetId);
          if (modulation) {
            modulation.modulationIndexVelo = Math.max(0, Math.min(100, velo));
            state.isModified = true;
            updateLastModified(state.currentPatch);
          }
        }
      }),

    // Actions pour la matrice de modulation
    updateModulationMatrixRow: (rowIndex: number, changes: Partial<ModulationMatrixRow>) =>
      set((state) => {
        if (rowIndex >= 0 && rowIndex < state.currentPatch.modulationMatrix.length) {
          Object.assign(state.currentPatch.modulationMatrix[rowIndex], changes);
          state.isModified = true;
          updateLastModified(state.currentPatch);
        }
      }),

    // Actions pour les LFO
    updateLfo: (lfoIndex: 0 | 1 | 2, changes: Partial<import('../types/patch').LFO>) =>
      set((state) => {
        // S'assurer que lfos existe (compatibilité avec les anciens patches)
        if (!state.currentPatch.lfos) {
          state.currentPatch.lfos = [
            { ...DEFAULT_LFO },
            { ...DEFAULT_LFO },
            { ...DEFAULT_LFO }
          ];
        }
        
        if (lfoIndex >= 0 && lfoIndex < 3) {
          Object.assign(state.currentPatch.lfos[lfoIndex], changes);
          state.isModified = true;
          updateLastModified(state.currentPatch);
        }
      }),

    // Actions pour les LFO Envelopes
    updateLfoEnvelope: (envIndex: 0 | 1, changes: Partial<import('../types/modulation').LFOEnvelope>) =>
      set((state) => {
        // S'assurer que lfoEnvelopes existe (compatibilité avec les anciens patches)
        if (!state.currentPatch.lfoEnvelopes) {
          state.currentPatch.lfoEnvelopes = [
            { ...DEFAULT_LFO_ENVELOPE },
            { ...DEFAULT_LFO_ENVELOPE }
          ];
        }
        
        if (envIndex >= 0 && envIndex < 2) {
          Object.assign(state.currentPatch.lfoEnvelopes[envIndex], changes);
          state.isModified = true;
          updateLastModified(state.currentPatch);
        }
      }),

    // Actions pour les Step Sequencers
    updateStepSequencer: (seqIndex: 0 | 1, changes: Partial<import('../types/modulation').StepSequencer>) =>
      set((state) => {
        // S'assurer que stepSequencers existe (compatibilité avec les anciens patches)
        if (!state.currentPatch.stepSequencers) {
          state.currentPatch.stepSequencers = [
            { ...DEFAULT_STEP_SEQUENCER },
            { ...DEFAULT_STEP_SEQUENCER }
          ];
        }
        
        if (seqIndex >= 0 && seqIndex < 2) {
          Object.assign(state.currentPatch.stepSequencers[seqIndex], changes);
          state.isModified = true;
          updateLastModified(state.currentPatch);
        }
      }),

    // Actions globales
    updateGlobal: (changes: Partial<Patch['global']>) =>
      set((state) => {
        Object.assign(state.currentPatch.global, changes);
        state.isModified = true;
        updateLastModified(state.currentPatch);
      }),

    updateEffects: (changes: Partial<GlobalEffects>) =>
      set((state) => {
        Object.assign(state.currentPatch.effects, changes);
        state.isModified = true;
        updateLastModified(state.currentPatch);
      }),

    // Actions pour les filtres
    updateFilter: (filterIndex: 0 | 1, changes: Partial<import('../types/patch').Filter>) =>
      set((state) => {
        if (filterIndex >= 0 && filterIndex < 2) {
          Object.assign(state.currentPatch.filters[filterIndex], changes);
          state.isModified = true;
          updateLastModified(state.currentPatch);
        }
      }),

    // Actions pour l'arpégiateur
    updateArpeggiator: (changes: Partial<import('../types/patch').ArpeggiatorSettings>) =>
      set((state) => {
        Object.assign(state.currentPatch.arpeggiator, changes);
        state.isModified = true;
        updateLastModified(state.currentPatch);
      }),

    // Actions pour les note curves
    updateNoteCurve: (curveIndex: 0 | 1, changes: Partial<import('../types/patch').NoteCurve>) =>
      set((state) => {
        if (curveIndex >= 0 && curveIndex < 2) {
          Object.assign(state.currentPatch.noteCurves[curveIndex], changes);
          state.isModified = true;
          updateLastModified(state.currentPatch);
        }
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
        // Préserver amplitude/pan des opérateurs existants (Mixer State)
        // car le patch dump (NRPN [127,127]) ne contient pas ces valeurs
        const preservedMixPan = new Map<number, { amplitude: number; pan: number }>();
        state.currentPatch.operators.forEach(op => {
          preservedMixPan.set(op.id, { amplitude: op.amplitude, pan: op.pan });
        });
        
        // Charger le nouveau patch
        const newPatch = { ...patch };
        
        // Assurer la compatibilité : initialiser les sources de modulation si non présentes
        if (!newPatch.lfos) {
          newPatch.lfos = [
            { ...DEFAULT_LFO },
            { ...DEFAULT_LFO },
            { ...DEFAULT_LFO }
          ];
        }
        
        if (!newPatch.lfoEnvelopes) {
          newPatch.lfoEnvelopes = [
            { ...DEFAULT_LFO_ENVELOPE },
            { ...DEFAULT_LFO_ENVELOPE }
          ];
        }
        
        if (!newPatch.stepSequencers) {
          newPatch.stepSequencers = [
            { ...DEFAULT_STEP_SEQUENCER },
            { ...DEFAULT_STEP_SEQUENCER }
          ];
        }
        
        // Réappliquer les valeurs MIX/PAN préservées
        newPatch.operators = newPatch.operators.map(op => {
          const preserved = preservedMixPan.get(op.id);
          if (preserved) {
            return { ...op, amplitude: preserved.amplitude, pan: preserved.pan };
          }
          return op;
        });
        
        state.currentPatch = newPatch;
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
          updateLastModified(state.currentPatch);
        }
      }),

    // Utilitaires
    markModified: (modified: boolean = true) =>
      set((state) => {
        state.isModified = modified;
        if (modified) {
          updateLastModified(state.currentPatch);
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

export const updateOperator = (operatorId: number, changes: Partial<Operator>, sendMidi: boolean = true) => {
  console.log('🔧 updateOperator called:', { operatorId, changes, sendMidi });
  
  // Envoyer le MIDI si l'amplitude change (sauf si on reçoit depuis MIDI)
  if (sendMidi && changes.amplitude !== undefined) {
    console.log('🎛️ Amplitude change detected, calling sendOperatorMix...');
    sendOperatorMix(operatorId, changes.amplitude);
  }
  
  // Envoyer le MIDI si le pan change (sauf si on reçoit depuis MIDI)
  if (sendMidi && changes.pan !== undefined) {
    console.log('🎛️ Pan change detected, calling sendOperatorPan...');
    sendOperatorPan(operatorId, changes.pan);
  }
  
  // Mettre à jour le store
  usePatchStore.getState().updateOperator(operatorId, changes);
};

export const selectAlgorithm = (algorithm: Algorithm) =>
  usePatchStore.getState().selectAlgorithm(algorithm);

export const useOperatorEnvelope = (operatorId: number) => usePatchStore(state => {
  const { currentPatch } = state;
  const operator = currentPatch.operators.find(osc => osc.id === operatorId);
  return operator?.adsr;
});
export const updateADSR = (operatorId: number, envelope: Partial<AdsrState>) =>
  usePatchStore.getState().updateADSR(operatorId, envelope);

export const useLfo = (lfoIndex: 0 | 1 | 2) => usePatchStore(state => {
  // S'assurer que lfos existe (compatibilité avec les anciens patches)
  if (!state.currentPatch.lfos) {
    return { ...DEFAULT_LFO };
  }
  return state.currentPatch.lfos[lfoIndex];
});
export const updateLfo = (lfoIndex: 0 | 1 | 2, changes: Partial<import('../types/patch').LFO>) =>
  usePatchStore.getState().updateLfo(lfoIndex, changes);

export const useLfoEnvelope = (envIndex: 0 | 1) => usePatchStore(state => {
  // S'assurer que lfoEnvelopes existe (compatibilité avec les anciens patches)
  if (!state.currentPatch.lfoEnvelopes) {
    return { ...DEFAULT_LFO_ENVELOPE };
  }
  return state.currentPatch.lfoEnvelopes[envIndex];
});
export const updateLfoEnvelope = (envIndex: 0 | 1, changes: Partial<import('../types/modulation').LFOEnvelope>) =>
  usePatchStore.getState().updateLfoEnvelope(envIndex, changes);

export const useStepSequencer = (seqIndex: 0 | 1) => usePatchStore(state => {
  // S'assurer que stepSequencers existe (compatibilité avec les anciens patches)
  if (!state.currentPatch.stepSequencers) {
    return { ...DEFAULT_STEP_SEQUENCER };
  }
  return state.currentPatch.stepSequencers[seqIndex];
});
export const updateStepSequencer = (seqIndex: 0 | 1, changes: Partial<import('../types/modulation').StepSequencer>) =>
  usePatchStore.getState().updateStepSequencer(seqIndex, changes);

export const updateModulationAmount = (sourceId: number, targetId: number, amount: number) =>
  usePatchStore.getState().updateModulationAmount(sourceId, targetId, amount);

export const updateModulationVelo = (sourceId: number, targetId: number, velo: number) =>
  usePatchStore.getState().updateModulationVelo(sourceId, targetId, velo);

export const updateModulationMatrixRow = (rowIndex: number, changes: Partial<ModulationMatrixRow>) =>
  usePatchStore.getState().updateModulationMatrixRow(rowIndex, changes);

export const updateGlobal = (changes: Partial<Patch['global']>) =>
  usePatchStore.getState().updateGlobal(changes);

export const useFilter = (filterIndex: 0 | 1) => usePatchStore(state => {
  return state.currentPatch.filters[filterIndex];
});
export const updateFilter = (filterIndex: 0 | 1, changes: Partial<import('../types/patch').Filter>) =>
  usePatchStore.getState().updateFilter(filterIndex, changes);

export const useArpeggiator = () => usePatchStore(state => {
  return state.currentPatch.arpeggiator;
});
export const updateArpeggiator = (changes: Partial<import('../types/patch').ArpeggiatorSettings>) =>
  usePatchStore.getState().updateArpeggiator(changes);

export const useNoteCurve = (curveIndex: 0 | 1) => usePatchStore(state => {
  return state.currentPatch.noteCurves[curveIndex];
});
export const updateNoteCurve = (curveIndex: 0 | 1, changes: Partial<import('../types/patch').NoteCurve>) =>
  usePatchStore.getState().updateNoteCurve(curveIndex, changes);

export const useIsModified = () => usePatchStore(state => state.isModified);
export const useActiveTab = () => usePatchStore(state => state.ui.activeTab);