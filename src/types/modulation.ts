/**
 * Types pour les sources de modulation du PreenFM3
 * - LFO Envelopes (2): Enveloppes ADSR qui modulent les LFOs
 * - Step Sequencers (2): Séquenceurs de pas pour modulation rythmique
 */

import { AdsrState } from './adsr';

/**
 * Mode de boucle pour LFO Envelope
 */
export type LfoEnvLoopMode = 'Off' | 'Loop' | 'Ping Pong';

/**
 * LFO Envelope
 * Enveloppe ADSR qui peut moduler les LFOs et autres paramètres
 */
export interface LFOEnvelope {
  adsr: AdsrState;           // Enveloppe ADSR classique
  loopMode: LfoEnvLoopMode;  // Mode de boucle
  silence: number;           // Paramètre silence (pour Env2) (0-100)
}

/**
 * Mode de gate pour Step Sequencer
 */
export type StepSeqGateMode = 'Gate' | 'Trigger' | 'Hold';

/**
 * Direction de lecture du Step Sequencer
 */
export type StepSeqDirection = 'Forward' | 'Backward' | 'PingPong' | 'Random';

/**
 * Step Sequencer
 * Séquenceur de pas avec 16 étapes
 */
export interface StepSequencer {
  steps: number[];              // 16 valeurs (0-100)
  gate: boolean[];              // 16 états gate (on/off)
  bpm: number;                  // Tempo (0-100)
  length: number;               // Nombre de steps actifs (1-16)
  gateMode: StepSeqGateMode;    // Mode gate
  direction: StepSeqDirection;  // Direction de lecture
}

/**
 * Valeurs par défaut pour LFO Envelope
 */
export const DEFAULT_LFO_ENVELOPE: LFOEnvelope = {
  adsr: {
    attack: { time: 0, level: 0 },
    decay: { time: 1, level: 100 },
    sustain: { time: 5, level: 30 },
    release: { time: 10, level: 0 }
  },
  loopMode: 'Off',
  silence: 0
};

/**
 * Valeurs par défaut pour Step Sequencer
 */
export const DEFAULT_STEP_SEQUENCER: StepSequencer = {
  steps: Array(16).fill(50),      // Toutes les valeurs à 50
  gate: Array(16).fill(true),     // Tous les steps actifs
  bpm: 120,                        // 120 BPM par défaut
  length: 16,                      // 16 steps par défaut
  gateMode: 'Gate',
  direction: 'Forward'
};
