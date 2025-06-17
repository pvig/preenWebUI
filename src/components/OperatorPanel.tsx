import { usePatchStore } from '../stores/patchStore';
import EnvelopeGraph from './EnvelopeGraph';
import Knob from './Knob';
import { WaveformSelector } from '../operator/WaveformSelector';
import { FineTuneKnob } from '../operator/FineTuneKnob';
import { KeyboardTrackingSelect } from '../operator/KeyboardTrackingSelect';

interface OperatorPanelProps {
  opNumber: number; // 1 à 4
}

export const OperatorPanel = ({ opNumber }: OperatorPanelProps) => {
  const { operators, updateOperator, selectedOperator } = usePatchStore();
  const operator = operators[`op${opNumber}` as keyof typeof operators];

  const handleFrequencyChange = (newFreq: number) => {
    updateOperator(opNumber, { freq: newFreq });
  };
  const handleFineTuneChange = (newTuning: number) => {
    updateOperator(opNumber, { fineTune: newTuning });
  };

  return (
    <div className={`operator-panel ${opNumber === selectedOperator ? 'active' : ''}`}>
      <h3>Operator {opNumber}</h3>
      
      {/* Contrôle de fréquence */}
      <Knob 
        label="Frequency"
        value={operator.freq}
        onChange={handleFrequencyChange}
        min={0}
        max={127}
      />
      <br/>
      {/* Contrôle de fréquence */}
      <Knob 
        label="Fine tune"
        value={operator.fineTune}
        onChange={handleFineTuneChange}
        min={0}
        max={127}
      />
      
      {/* Éditeur d'enveloppe */}
      <EnvelopeGraph
        operatorNumber={opNumber}
      />
      
      <FineTuneKnob
        value={operator.fineTune}
        onChange={(fineTune) => updateOperator(opNumber, { fineTune })}
      />

      <WaveformSelector
        value={operator.waveform}
        onChange={(waveform) => updateOperator(opNumber, { waveform })}
      />

      <KeyboardTrackingSelect
        value={operator.keyboardTracking || 'fixed'}
        onChange={(keyboardTracking) => updateOperator(opNumber, { keyboardTracking })}
      />

      {/* Autres contrôles d'opérateur... */}
    </div>
  );
};

export default OperatorPanel