// Types LFO correspondant au firmware PreenFM3
// Basé sur preenfm3/firmware/Src/synth/SynthState.h

export type LfoType = 
  | 'LFO_SIN'
  | 'LFO_SAW'
  | 'LFO_TRIANGLE'
  | 'LFO_SQUARE'
  | 'LFO_RANDOM'
  | 'LFO_BROWNIAN'
  | 'LFO_WANDERING'
  | 'LFO_FLOW';

export const LFO_TYPE_LABELS: Record<LfoType, string> = {
  LFO_SIN: 'Sine',
  LFO_SAW: 'Saw',
  LFO_TRIANGLE: 'Triangle',
  LFO_SQUARE: 'Square',
  LFO_RANDOM: 'Random',
  LFO_BROWNIAN: 'Brownian',
  LFO_WANDERING: 'Wandering',
  LFO_FLOW: 'Flow'
};

export const LFO_TYPES: LfoType[] = [
  'LFO_SIN',
  'LFO_SAW',
  'LFO_TRIANGLE',
  'LFO_SQUARE',
  'LFO_RANDOM',
  'LFO_BROWNIAN',
  'LFO_WANDERING',
  'LFO_FLOW'
];

// ============================================================================
// NRPN Constants
// ============================================================================

// Frequency encoding
export const LFO_FREQ_MAX_INTERNAL = 9990;        // Max NRPN for internal freq (99.9 Hz)
export const LFO_FREQ_MIDI_CLOCK_BASE = 10000;   // NRPN threshold for MIDI Clock modes
export const LFO_FREQ_SCALE_FACTOR = 100;         // Freq stored as (Hz × 100)

// Bias encoding (0-200 range, centered on 100)
export const LFO_BIAS_CENTER = 100;               // NRPN value for 0.0 bias
export const LFO_BIAS_MIN = 0;                    // NRPN value for -1.0 bias
export const LFO_BIAS_MAX = 200;                  // NRPN value for +1.0 bias
export const LFO_BIAS_RANGE = 100;                // Division factor for bias

// KeySync encoding
export const LFO_KEYSYNC_OFF_VALUE = 0;           // NRPN value for "Off" state
export const LFO_KEYSYNC_MIN_NRPN = 1;            // First valid NRPN for numeric keysync
export const LFO_KEYSYNC_MAX_NRPN = 1601;         // Max NRPN (16.0 delay)
export const LFO_KEYSYNC_SCALE_FACTOR = 0.01;     // Scale factor
export const LFO_KEYSYNC_OFFSET = 0.01;           // Offset to apply

// Phase encoding (full 14-bit NRPN range)
export const LFO_PHASE_MAX_NRPN = 16383;          // Max 14-bit value
export const LFO_PHASE_MAX_DEGREES = 360;         // Max degrees

// Shape range
export const LFO_SHAPE_MIN = 0;
export const LFO_SHAPE_MAX = 7;

// MIDI Clock sync modes (when frequency > 99.9)
export type MidiClockMode = 
  | 'MC/16'  // Clock / 16
  | 'MC/8'   // Clock / 8
  | 'MC/4'   // Clock / 4
  | 'MC/2'   // Clock / 2
  | 'MC'     // Clock
  | 'MC*2'   // Clock * 2
  | 'MC*3'   // Clock * 3
  | 'MC*4'   // Clock * 4
  | 'MC*8';  // Clock * 8

export const MIDI_CLOCK_MODES: MidiClockMode[] = [
  'MC/16', 'MC/8', 'MC/4', 'MC/2', 'MC', 'MC*2', 'MC*3', 'MC*4', 'MC*8'
];

export const MIDI_CLOCK_LABELS: Record<MidiClockMode, string> = {
  'MC/16': 'Clock ÷ 16',
  'MC/8': 'Clock ÷ 8',
  'MC/4': 'Clock ÷ 4',
  'MC/2': 'Clock ÷ 2',
  'MC': 'Clock',
  'MC*2': 'Clock × 2',
  'MC*3': 'Clock × 3',
  'MC*4': 'Clock × 4',
  'MC*8': 'Clock × 8'
};

// NRPN values for MIDI Clock modes
export const MIDI_CLOCK_NRPN: Record<MidiClockMode, number> = {
  'MC/16': 10000,
  'MC/8': 10010,
  'MC/4': 10020,
  'MC/2': 10030,
  'MC': 10040,
  'MC*2': 10050,
  'MC*3': 10060,
  'MC*4': 10070,
  'MC*8': 10080
};

// ============================================================================
// NRPN Conversion Functions
// ============================================================================

/**
 * Convert NRPN value to LFO frequency or MIDI Clock mode
 * @param nrpnValue Raw NRPN value (0-10080)
 * @returns Frequency in Hz (0-99.9) or MidiClockMode string
 */
export function nrpnToLfoFrequency(nrpnValue: number): number | MidiClockMode {
  if (nrpnValue >= LFO_FREQ_MIDI_CLOCK_BASE) {
    // MIDI Clock mode
    for (const [mode, value] of Object.entries(MIDI_CLOCK_NRPN)) {
      if (value === nrpnValue) {
        return mode as MidiClockMode;
      }
    }
    return 5.0; // Fallback to default frequency
  }
  // Normal frequency: NRPN value = frequency × 100
  return nrpnValue / LFO_FREQ_SCALE_FACTOR;
}

/**
 * Convert LFO frequency or MIDI Clock mode to NRPN value
 * @param value Frequency in Hz or MidiClockMode string
 * @returns NRPN value (0-10080)
 */
export function lfoFrequencyToNrpn(value: number | MidiClockMode): number {
  if (typeof value === 'string') {
    // MIDI Clock mode
    return MIDI_CLOCK_NRPN[value] || LFO_FREQ_MIDI_CLOCK_BASE;
  }
  // Normal frequency: NRPN value = frequency × 100
  return Math.round(value * LFO_FREQ_SCALE_FACTOR);
}

/**
 * Parse NRPN value to LFO bias
 * @param nrpnValue Raw NRPN value (0-200, centered on 100)
 * @returns Bias value (-1.0 to +1.0)
 */
export function parseLfoBias(nrpnValue: number): number {
  // Center on 100, divide by range
  return (nrpnValue - LFO_BIAS_CENTER) / LFO_BIAS_RANGE;
}

/**
 * Encode LFO bias to NRPN value
 * @param bias Bias value (-1.0 to +1.0)
 * @returns NRPN value (0-200)
 */
export function encodeLfoBias(bias: number): number {
  // Clamp to valid range
  const clamped = Math.max(-1, Math.min(1, bias));
  return Math.round(clamped * LFO_BIAS_RANGE + LFO_BIAS_CENTER);
}

/**
 * Parse NRPN value to LFO keysync
 * @param nrpnValue Raw NRPN value (0 = Off, 1-1601 = 0.0-16.0)
 * @returns 'Off' or numeric delay value (0.0-16.0)
 */
export function parseLfoKeysync(nrpnValue: number): 'Off' | number {
  if (nrpnValue === LFO_KEYSYNC_OFF_VALUE) {
    return 'Off';
  }
  // Formula from firmware: floatValue = (nrpnValue × 0.01) - 0.01
  const keysyncFloat = (nrpnValue * LFO_KEYSYNC_SCALE_FACTOR) - LFO_KEYSYNC_OFFSET;
  // Clamp to valid range and round to 2 decimals
  return Math.max(0, Math.min(16, Math.round(keysyncFloat * 100) / 100));
}

/**
 * Encode LFO keysync to NRPN value
 * @param value 'Off' or numeric delay value (0.0-16.0)
 * @returns NRPN value (0-1601)
 */
export function encodeLfoKeysync(value: 'Off' | number): number {
  if (value === 'Off') {
    return LFO_KEYSYNC_OFF_VALUE;
  }
  // Inverse formula: nrpnValue = (floatValue + 0.01) / 0.01
  const clamped = Math.max(0, Math.min(16, value));
  return Math.round((clamped + LFO_KEYSYNC_OFFSET) / LFO_KEYSYNC_SCALE_FACTOR);
}

/**
 * Parse NRPN value to LFO shape
 * @param nrpnValue Raw NRPN value (0-7)
 * @returns LfoType enum value
 */
export function parseLfoShape(nrpnValue: number): LfoType {
  const index = Math.max(LFO_SHAPE_MIN, Math.min(LFO_SHAPE_MAX, nrpnValue));
  return LFO_TYPES[index] || 'LFO_SIN';
}

/**
 * Encode LFO shape to NRPN value
 * @param shape LfoType enum value
 * @returns NRPN value (0-7)
 */
export function encodeLfoShape(shape: LfoType): number {
  const index = LFO_TYPES.indexOf(shape);
  return index >= 0 ? index : 0;
}
