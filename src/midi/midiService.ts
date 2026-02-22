/**
 * MIDI Service for PreenFM3 Communication
 * Handles Web MIDI API for sending/receiving CC, NRPN, and SysEx messages
 */

import { WebMidi, Input, Output } from 'webmidi';
import { PREENFM3_CC, NRPNMessage, NRPN_COMMANDS } from './preenFM3MidiMap';

let midiInput: Input | null = null;
let midiOutput: Output | null = null;
let currentChannel = 1; // MIDI channel 1-16

/**
 * Initialize Web MIDI and get available devices
 */
export async function initializeMidi(): Promise<{ inputs: Input[]; outputs: Output[] }> {
  try {
    await WebMidi.enable();
    console.log('Web MIDI enabled');
    console.log('Inputs:', WebMidi.inputs.map(i => i.name));
    console.log('Outputs:', WebMidi.outputs.map(o => o.name));
    
    return {
      inputs: WebMidi.inputs,
      outputs: WebMidi.outputs,
    };
  } catch (err) {
    console.error('Failed to enable Web MIDI:', err);
    throw err;
  }
}

/**
 * Set the active MIDI input device
 */
export function setMidiInput(input: Input | null) {
  if (midiInput) {
    midiInput.removeListener();
  }
  midiInput = input;
}

/**
 * Set the active MIDI output device
 */
export function setMidiOutput(output: Output | null) {
  midiOutput = output;
}

/**
 * Set the MIDI channel (1-16)
 */
export function setMidiChannel(channel: number) {
  if (channel >= 1 && channel <= 16) {
    currentChannel = channel;
  }
}

/**
 * Send a Control Change message
 */
export function sendCC(controller: number, value: number, channel: number = currentChannel) {
  if (!midiOutput) {
    console.warn('No MIDI output selected');
    return;
  }
  
  try {
    midiOutput.sendControlChange(controller, value, { channels: channel });
    console.log(`Sent CC ${controller} = ${value} on channel ${channel}`);
  } catch (err) {
    console.error('Failed to send CC:', err);
  }
}

/**
 * Send an NRPN message (4 CC messages)
 */
export function sendNRPN(nrpn: NRPNMessage, channel: number = currentChannel) {
  if (!midiOutput) {
    console.warn('No MIDI output selected');
    return;
  }
  
  try {
    const opts = { channels: channel };
    // NRPN MSB and LSB
    midiOutput.sendControlChange(99, nrpn.paramMSB, opts);
    midiOutput.sendControlChange(98, nrpn.paramLSB, opts);
    
    // Data MSB and LSB
    midiOutput.sendControlChange(6, nrpn.valueMSB, opts);
    midiOutput.sendControlChange(38, nrpn.valueLSB, opts);
    
    console.log(`Sent NRPN [${nrpn.paramMSB},${nrpn.paramLSB}] = [${nrpn.valueMSB},${nrpn.valueLSB}] on channel ${channel}`);
  } catch (err) {
    console.error('Failed to send NRPN:', err);
  }
}

/**
 * Request full patch dump via NRPN
 */
export function requestPatchDump(timbre: number = 0, channel: number = currentChannel) {
  const nrpn = {
    ...NRPN_COMMANDS.REQUEST_PATCH_DUMP,
    valueMSB: 0,
    valueLSB: timbre,
  };
  sendNRPN(nrpn, channel);
}

/**
 * Send algorithm change (CC 20)
 */
export function sendAlgorithmChange(algoId: number | string, channel: number = currentChannel) {
  // Algorithm IDs are 0-31 for 32 algorithms
  const algoIndex = typeof algoId === 'string' ? parseInt(algoId.replace('alg', '')) - 1 : algoId;
  sendCC(PREENFM3_CC.ALGO, algoIndex, channel);
}

/**
 * Send modulation index change (IM1-IM5, IM_FEEDBACK)
 */
export function sendIMChange(imNumber: number, value: number, channel: number = currentChannel) {
  // IM values are 0-100 in UI, sent as 0-100 in CC
  // PreenFM3 scales: value * 0.1
  let ccNumber: number;
  
  if (imNumber === 6) {
    ccNumber = PREENFM3_CC.IM_FEEDBACK;
  } else if (imNumber >= 1 && imNumber <= 5) {
    ccNumber = PREENFM3_CC.IM1 + (imNumber - 1);
  } else {
    console.error('Invalid IM number:', imNumber);
    return;
  }
  
  const scaledValue = Math.min(127, Math.round(value));
  sendCC(ccNumber, scaledValue, channel);
}

/**
 * Send envelope attack for an operator (1-6)
 */
export function sendEnvelopeAttack(opNumber: number, value: number, channel: number = currentChannel) {
  if (opNumber < 1 || opNumber > 6) {
    console.error('Invalid operator number:', opNumber);
    return;
  }
  
  // Scale 0-16 (seconds) to 0-127
  const ccValue = Math.round(value * 8); // value * 64 / 8 for 0-16 range
  
  if (opNumber === 1) {
    sendCC(PREENFM3_CC.ENV_ATK_OP1, ccValue, channel);
  } else {
    sendCC(PREENFM3_CC.ENV_ATK_OP2 + (opNumber - 2), ccValue, channel);
  }
}

/**
 * Send envelope release for an operator (1-6)
 */
export function sendEnvelopeRelease(opNumber: number, value: number, channel: number = currentChannel) {
  if (opNumber < 1 || opNumber > 6) {
    console.error('Invalid operator number:', opNumber);
    return;
  }
  
  // Scale 0-32 (seconds) to 0-127
  const ccValue = Math.round(value * 4); // value * 127 / 32
  sendCC(PREENFM3_CC.ENV_REL_OP1 + (opNumber - 1), ccValue, channel);
}

/**
 * Listen to incoming CC messages
 */
export function onControlChange(callback: (controller: number, value: number, channel: number) => void) {
  if (!midiInput) {
    console.warn('No MIDI input selected');
    return;
  }
  
  midiInput.addListener('controlchange', (e) => {
    const controller = e.controller.number;
    const value = typeof e.value === 'number' ? e.value : 0;
    const channel = e.message.channel || 1;
    callback(controller, value, channel);
  });
}

/**
 * Listen to incoming NRPN messages
 */
export function onNRPN(callback: (nrpn: NRPNMessage, channel: number) => void) {
  if (!midiInput) {
    console.warn('No MIDI input selected');
    return;
  }
  
  const nrpnBuffer: Map<number, Partial<NRPNMessage>> = new Map();
  
  midiInput.addListener('controlchange', (e) => {
    const channel = e.message.channel || 1;
    const controller = e.controller.number;
    // Utiliser rawValue pour avoir 0-127 au lieu de 0-1
    const value = typeof e.rawValue === 'number' ? e.rawValue : (typeof e.value === 'number' ? Math.round(e.value * 127) : 0);
    
    if (!nrpnBuffer.has(channel)) {
      nrpnBuffer.set(channel, {});
    }
    
    const buffer = nrpnBuffer.get(channel)!;
    
    switch (controller) {
      case 99: // NRPN MSB
        buffer.paramMSB = value;
        break;
      case 98: // NRPN LSB
        buffer.paramLSB = value;
        break;
      case 6: // Data Entry MSB
        buffer.valueMSB = value;
        break;
      case 38: // Data Entry LSB
        buffer.valueLSB = value;
        
        // Complete NRPN message
        if (buffer.paramMSB !== undefined && buffer.paramLSB !== undefined &&
            buffer.valueMSB !== undefined && buffer.valueLSB !== undefined) {
          callback(buffer as NRPNMessage, channel);
          nrpnBuffer.set(channel, {}); // Reset buffer
        }
        break;
    }
  });
}

/**
 * Listen to SysEx messages
 */
export function onSysEx(callback: (data: Uint8Array) => void) {
  if (!midiInput) {
    console.warn('No MIDI input selected');
    return;
  }
  
  midiInput.addListener('sysex', (e) => {
    callback(e.data);
  });
}

/**
 * Legacy function for compatibility
 */
export const startMidiListener = (onPatchUpdate: (patchData: any) => void) => {
  onSysEx((data) => {
    const patchData = parseIncomingSysex(data);
    onPatchUpdate(patchData);
  });
};

/**
 * Parse incoming SysEx data (placeholder - to be implemented)
 */
function parseIncomingSysex(data: Uint8Array): any {
  console.log('Received SysEx:', data);
  // TODO: Implement SysEx parsing based on PreenFM3 format
  return null;
}

/**
 * Get MIDI status
 */
export function getMidiStatus() {
  return {
    enabled: WebMidi.enabled,
    input: midiInput?.name || null,
    output: midiOutput?.name || null,
    channel: currentChannel,
  };
}
