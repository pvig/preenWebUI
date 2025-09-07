import React from "react";

import AdsrControl from './operator/AdsrControl';
import { WaveformSelector } from './operator/WaveformSelector';
import { FineTuneKnob } from './operator/FineTuneKnob';
import { FrequencyKnob } from './operator/FrequencyKnob';
import { KeyboardTrackingSelect } from './operator/KeyboardTrackingSelect';
import { useOperator, updateOperator } from '../../stores/patchStore';

interface OperatorPanelProps {
  opNumber: number;
}

export const OperatorPanel = ({ opNumber }: OperatorPanelProps) => {
  const selectedOperator = useOperator(opNumber);
  const opId = opNumber;

  return (
    <div className={`operator-panel ${opNumber === selectedOperator?.id ? 'active' : ''}`}>
      <h3>Operator {opNumber + 1}</h3>

      <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
        <FrequencyKnob 
        label="Frequency" 
        value={selectedOperator?.frequency ?? 0}
        initial={selectedOperator?.frequency} 
        min={0} max={16} 
        onChange={val => updateOperator(opId, { frequency: val })}
        />
        <FineTuneKnob 
        label="Finetuning" 
        value={selectedOperator?.detune ?? 0}
        initial={selectedOperator?.detune ?? 0} 
        min={-9} max={9} 
        onChange={val => updateOperator(opId, { detune: val })}
        />
      </div>

      <AdsrControl operatorId={opId} />

      <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
        <WaveformSelector
          value={selectedOperator?.waveform}
          onChange={(waveform) => updateOperator(opId, { waveform })}
        />
        <KeyboardTrackingSelect
          value={selectedOperator?.keyboardTracking}
          onChange={(keyboardTracking) => updateOperator(opId, { keyboardTracking })}
        />
      </div>

    </div>
  );
};

export default React.memo(OperatorPanel)