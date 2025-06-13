// OperatorPanel.tsx
import { usePatchStore } from '../stores/patchStore';
import { Knob } from './Knob';
import EnvelopeGraph from './EnvelopeGraph';

interface OperatorPanelProps {
  opNumber: number
}

function OperatorPanel({opNumber }: OperatorPanelProps) {
  const { patch, updateParam } = usePatchStore();
  const op = patch.operators[`op${opNumber}`];
  const envelope = op.env;
  console.log("envelope", opNumber, envelope);
  return (
    <div>
      <Knob
        label="Fréquence"
        value={op.freq}
        onChange={(v) => updateParam(`patch.operators.op${opNumber}.freq`, v)}
      />
      <br/>
      <EnvelopeGraph
        attack={envelope.attack}
        decay={envelope.decay}
        sustain={envelope.sustain}
        release={envelope.release}
        onChange={(newAdsr) => {
          console.log("newAdsr", newAdsr);
          // Envoyer les nouvelles valeurs au synthé via MIDI
        }}
      />
    </div>
  );
};

export default OperatorPanel;