import React from 'react';
import useOperator from '../hooks/useOperator';
import FineTuneControl from './operator/FineTuneControl';
import WaveformSelector from './operator/WaveformSelector';
import FollowModeSelector from './operator/FollowModeSelector';
import AdsrControl from './operator/AdsrControl';
import FrequencyControl from './operator/FrequencyControl';

export default function Operator({ id }) {
  const [settings, updateSetting] = useOperator(id);

  return (
    <div className="operator-panel">
      <h3>Opérateur {id + 1}</h3>
      
      <FrequencyControl 
        value={settings.frequency} 
        onChange={(v) => updateSetting('frequency', v)} 
      />
      
      <AdsrControl
        values={settings.adsr}
        onChange={(param, v) => updateSetting(`adsr.${param}`, v)}
      />
      
      <FineTuneControl
        value={settings.fineTune}
        onChange={updateSetting}
      />
      
      <WaveformSelector
        value={settings.waveform}
        onChange={updateSetting}
      />
      
      <FollowModeSelector
        value={settings.follows}
        onChange={updateSetting}
      />
    </div>
  );
}