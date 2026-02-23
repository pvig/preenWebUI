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
  console.log('📨 sendCC called:', { controller, value, channel, hasOutput: !!midiOutput, outputName: midiOutput?.name });
  
  if (!midiOutput) {
    console.warn('❌ No MIDI output selected - cannot send CC');
    return;
  }
  
  try {
    // Build MIDI CC message manually: [status, controller, value]
    // Status byte: 0xB0 (CC on channel 1) + (channel - 1)
    // Controller: 0-127
    // Value: 0-127
    const statusByte = 0xB0 + (channel - 1);
    const midiMessage = [statusByte, controller & 0x7F, value & 0x7F];
    
    console.log('🎵 MIDI bytes:', midiMessage.map(b => '0x' + b.toString(16).padStart(2, '0')).join(' '));
    console.log('🔌 Output object:', { id: midiOutput.id, name: midiOutput.name, manufacturer: midiOutput.manufacturer });
    console.log('🔌 Output state:', { state: midiOutput.state, connection: midiOutput.connection, type: midiOutput.type });
    
    // Send raw MIDI message WITHOUT timestamp (send immediately)
    try {
      const result = midiOutput.send(midiMessage);
      console.log('📬 send() returned:', result);
    } catch (sendError) {
      console.error('💥 send() threw error:', sendError);
      throw sendError;
    }
    
    console.log(`✅ Sent CC ${controller} = ${value} on channel ${channel} to ${midiOutput.name}`);
  } catch (err) {
    console.error('❌ Failed to send CC:', err);
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
    // Build status byte for Control Change
    const statusByte = 0xB0 + (channel - 1);
    
    console.log('📤 Sending NRPN via Output:', { id: midiOutput.id, name: midiOutput.name });
    
    // Send 4 CC messages using raw MIDI WITHOUT timestamp
    // CC 99 = NRPN MSB
    midiOutput.send([statusByte, 99, nrpn.paramMSB & 0x7F]);
    // CC 98 = NRPN LSB
    midiOutput.send([statusByte, 98, nrpn.paramLSB & 0x7F]);
    // CC 6 = Data Entry MSB
    midiOutput.send([statusByte, 6, nrpn.valueMSB & 0x7F]);
    // CC 38 = Data Entry LSB
    midiOutput.send([statusByte, 38, nrpn.valueLSB & 0x7F]);
    
    console.log(`Sent NRPN [${nrpn.paramMSB},${nrpn.paramLSB}] = [${nrpn.valueMSB},${nrpn.valueLSB}] on channel ${channel}`);
  } catch (err) {
    console.error('Failed to send NRPN:', err);
  }
}

/**
 * Request full patch dump via NRPN
 */
export function requestPatchDump(timbre: number = 0, channel: number = currentChannel) {
  console.log('📥 requestPatchDump called:', { timbre, channel, hasOutput: !!midiOutput, outputName: midiOutput?.name });
  console.log('🔌 Output object:', { id: midiOutput?.id, name: midiOutput?.name, manufacturer: midiOutput?.manufacturer });
  
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
 * Send operator mix/volume (amplitude) for operators 1-6
 * Note: MIX is controlled via NRPN, not CC
 * NRPN [0, 16+opNumber-1] for MIX1-MIX6
 */
export function sendOperatorMix(opNumber: number, value: number, channel: number = currentChannel) {
  console.log('🎹 sendOperatorMix called:', { opNumber, value, channel, hasOutput: !!midiOutput });
  
  if (opNumber < 1 || opNumber > 6) {
    console.warn('⚠️ Operator mix only available for operators 1-6, got:', opNumber);
    return;
  }
  
  // value is 0-127 in UI (amplitude)
  // PreenfM3 MIX range: 0-100 (from official doc)
  const scaledValue = Math.max(0, Math.min(100, Math.round(value * 100 / 127)));
  
  const nrpn: NRPNMessage = {
    paramMSB: 0,
    paramLSB: 16 + (opNumber - 1) * 2, // MIX1=16, MIX2=18, MIX3=20, etc. (interleaved with PAN)
    valueMSB: 0,
    valueLSB: scaledValue // Value 0-100 in LSB
  };
  
  console.log('📤 Sending MIX via NRPN:', { opNumber, nrpn, scaledValue });
  sendNRPN(nrpn, channel);
}

/**
 * Send operator pan (panoramique) for operators 1-6
 * Note: PAN is controlled via NRPN, not CC
 * NRPN [0, 17+(opNumber-1)*2] for PAN1-PAN6 (interleaved with MIX)
 */
export function sendOperatorPan(opNumber: number, value: number, channel: number = currentChannel) {
  console.log('🎹 sendOperatorPan called:', { opNumber, value, channel, hasOutput: !!midiOutput });
  
  if (opNumber < 1 || opNumber > 6) {
    console.warn('⚠️ Operator pan only available for operators 1-6, got:', opNumber);
    return;
  }
  
  // value is -100 (left) to 100 (right) in UI
  // PreenfM3 PAN range: 0-200 (0=left, 100=center, 200=right from official doc)
  const scaledValue = Math.max(0, Math.min(200, Math.round(value + 100)));
  
  const nrpn: NRPNMessage = {
    paramMSB: 0,
    paramLSB: 17 + (opNumber - 1) * 2, // PAN1=17, PAN2=19, PAN3=21, etc. (interleaved with MIX)
    valueMSB: (scaledValue >> 7) & 0x7F, // Upper 7 bits (for values > 127)
    valueLSB: scaledValue & 0x7F // Lower 7 bits
  };
  
  console.log('📤 Sending PAN via NRPN:', { opNumber, nrpn, scaledValue, originalValue: value });
  sendNRPN(nrpn, channel);
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
    hasOutput: !!midiOutput,
    hasInput: !!midiInput,
  };
}

/**
 * Debug function to log current MIDI state
 */
export function logMidiStatus() {
  const status = getMidiStatus();
  console.log('🔍 MIDI Status:', status);
  console.log('  WebMIDI enabled:', status.enabled);
  console.log('  Input:', status.input);
  console.log('  Output:', status.output);
  console.log('  Channel:', status.channel);
  return status;
}
