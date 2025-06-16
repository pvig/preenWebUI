import { useState, useEffect } from 'react';
import { usePatchStore } from '../stores/patchStore';
import './MidiMenu.css';

export const MidiMenu = () => {
  const [midiAccess, setMidiAccess] = useState<WebMidi.MIDIAccess | null>(null);
  const [inputs, setInputs] = useState<WebMidi.MIDIInput[]>([]);
  const [outputs, setOutputs] = useState<WebMidi.MIDIOutput[]>([]);
  const [selectedInput, setSelectedInput] = useState<string>('');
  const [selectedOutput, setSelectedOutput] = useState<string>('');
  const { pushPatch, pullPatch, currentPatch } = usePatchStore();

  // Initialisation MIDI
  useEffect(() => {
    const initMidi = async () => {
      try {
        const access = await navigator.requestMIDIAccess();
        setMidiAccess(access);
        
        // Gestion des ports MIDI
        const updatePorts = () => {
          setInputs(Array.from(access.inputs.values()));
          setOutputs(Array.from(access.outputs.values()));
        };
        
        access.onstatechange = updatePorts;
        updatePorts();
      } catch (err) {
        console.error('Erreur MIDI:', err);
      }
    };

    initMidi();

    return () => {
      if (midiAccess) {
        midiAccess.onstatechange = null;
      }
    };
  }, []);

  // Envoi d'un patch au PreenFM3
  const sendPatch = () => {
    if (!selectedOutput || !midiAccess) return;
    
    const output = outputs.find(out => out.id === selectedOutput);
    if (!output) return;

    pushPatch();

    console.log('Patch envoyé au PreenFM3');
  };

  // Réception d'un patch depuis le PreenFM3
  const receivePatch = () => {
    if (!selectedInput || !midiAccess) return;

    const input = inputs.find(inp => inp.id === selectedInput);
    if (!input) return;

    input.onmidimessage = (message) => {
      if (isSysexPatch(message.data)) {
        const patch = convertSysexToPatch(message.data);
        pullPatch(patch); // Met à jour le store
      }
    };
  };

  return (
    <div className="midi-menu">
      <div className="midi-ports">
        <div className="midi-port-select">
          <label>
            Entrée MIDI:
            <select 
              value={selectedInput}
              onChange={(e) => setSelectedInput(e.target.value)}
            >
              <option value="">-- Sélectionner --</option>
              {inputs.map(input => (
                <option key={input.id} value={input.id}>
                  {input.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="midi-port-select">
          <label>
            Sortie MIDI:
            <select 
              value={selectedOutput}
              onChange={(e) => setSelectedOutput(e.target.value)}
            >
              <option value="">-- Sélectionner --</option>
              {outputs.map(output => (
                <option key={output.id} value={output.id}>
                  {output.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="midi-actions">
        <button 
          onClick={sendPatch}
          disabled={!selectedOutput}
          className="midi-button"
        >
          Push → PreenFM
        </button>
        
        <button 
          onClick={receivePatch}
          disabled={!selectedInput}
          className="midi-button"
        >
          Pull ← PreenFM
        </button>
      </div>
    </div>
  );
};

const convertPatchToSysex = (patch: any): number[] => {
  return [0xF0, /* ... données du patch ... */, 0xF7];
};

const convertSysexToPatch = (data: Uint8Array): any => {
  // Implémentez la conversion de SysEx vers votre format de patch
  return {};
};

const isSysexPatch = (data: Uint8Array): boolean => {
  // Vérifie si le message est un patch SysEx valide
  return data[0] === 0xF0 && data[data.length - 1] === 0xF7;
};