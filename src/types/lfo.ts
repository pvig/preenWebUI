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

// Helper to convert NRPN value to frequency or MIDI Clock mode
export function nrpnToLfoFrequency(nrpnValue: number): number | MidiClockMode {
  if (nrpnValue >= 10000) {
    // MIDI Clock mode
    for (const [mode, value] of Object.entries(MIDI_CLOCK_NRPN)) {
      if (value === nrpnValue) {
        return mode as MidiClockMode;
      }
    }
    return 5.0; // Fallback
  }
  // Normal frequency (value = freq * 100)
  return nrpnValue / 100;
}

// Helper to convert frequency or MIDI Clock mode to NRPN value
export function lfoFrequencyToNrpn(value: number | MidiClockMode): number {
  if (typeof value === 'string') {
    // MIDI Clock mode
    return MIDI_CLOCK_NRPN[value] || 10000;
  }
  // Normal frequency
  return Math.round(value * 100);
}
