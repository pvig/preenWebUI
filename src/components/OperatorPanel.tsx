import React from "react";
import { usePatchStore } from '../stores/patchStore';
import AdsrControl from '../operator/AdsrControl';
import { WaveformSelector } from '../operator/WaveformSelector';
import { FineTuneKnob } from '../operator/FineTuneKnob';
import { FrequencyKnob } from '../operator/FrequencyKnob';
import { KeyboardTrackingSelect } from '../operator/KeyboardTrackingSelect';

interface OperatorPanelProps {
  opNumber: number;
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
  const keyboardTrackingChange = (newMode: number) => {
    console.log("newMode", newMode);
    updateOperator(opNumber, { keyboardTracking: newMode });
  };

  return (
    <div className={`operator-panel ${opNumber === selectedOperator ? 'active' : ''}`}>
      <h3>Operator {opNumber}</h3>

      <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
        <FrequencyKnob label="Frequency" initial={operator.freq} min={0} max={16} onChange={handleFrequencyChange} />
        <FineTuneKnob label="Finetuning" initial={operator.fineTune} min={-9} max={9} onChange={handleFineTuneChange} />
      </div>

      <AdsrControl
        operatorNumber={opNumber}
      />

      <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
        <WaveformSelector
          value={operator.waveform}
          onChange={(waveform) => updateOperator(opNumber, { waveform })}
        />
        <KeyboardTrackingSelect
          value={operator.keyboardTracking}
          onChange={(keyboardTracking) => updateOperator(opNumber, { keyboardTracking })}
        />
      </div>

    </div>
  );
};

export default React.memo(OperatorPanel)