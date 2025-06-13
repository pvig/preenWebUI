// src/midi/midiService.js
export const startMidiListener = (onPatchUpdate) => {
  WebMidi.WebMidi.inputs[0]?.addListener('sysex', (event) => {
    const patchData = parseIncomingSysex(event.data);
    onPatchUpdate(patchData);
  });
};