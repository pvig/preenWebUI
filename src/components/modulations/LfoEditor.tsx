import React, { useState } from 'react';
import styled from 'styled-components';
import KnobBase from '../knobs/KnobBase';
import LfoWaveformSelector from './LfoWaveformSelector';
import { type LfoType, type MidiClockMode, MIDI_CLOCK_MODES, MIDI_CLOCK_LABELS } from '../../types/lfo';
import { useLfo, updateLfo } from '../../stores/patchStore';

const LfoContainer = styled.div`
  background: #2d3748;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
`;

const LfoTitle = styled.h3`
  color: #e2e8f0;
  font-size: 1rem;
  margin: 0 0 15px 0;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const LfoTabs = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
`;

const LfoTab = styled.button<{ $active: boolean }>`
  background: ${props => props.$active ? '#4a5568' : '#1a202c'};
  border: none;
  border-radius: 4px;
  color: ${props => props.$active ? '#63b3ed' : '#a0aec0'};
  padding: 8px 16px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #4a5568;
    color: #63b3ed;
  }
`;

const LfoControls = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 20px;
  align-items: start;
`;

const ControlGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
`;

const ControlLabel = styled.label`
  color: #a0aec0;
  font-size: 0.75rem;
  text-transform: uppercase;
`;

const Select = styled.select`
  background: #4a5568;
  border: 1px solid #2d3748;
  border-radius: 4px;
  color: #e2e8f0;
  padding: 8px;
  font-size: 0.875rem;
  width: 100%;
  
  &:focus {
    outline: none;
    border-color: #63b3ed;
  }
`;

/**
 * Composant LfoEditor
 * Gère les 3 LFOs du PreenFM3 (selon le code de référence)
 */
export const LfoEditor: React.FC = () => {
  const [activeLfo, setActiveLfo] = useState<0 | 1 | 2>(0);
  const lfo = useLfo(activeLfo);

  return (
    <LfoContainer>
      <LfoTitle>LFO Editor</LfoTitle>
      
      <LfoTabs>
        {([0, 1, 2] as const).map((lfoNum) => (
          <LfoTab
            key={lfoNum}
            $active={activeLfo === lfoNum}
            onClick={() => setActiveLfo(lfoNum)}
          >
            LFO {lfoNum + 1}
          </LfoTab>
        ))}
      </LfoTabs>

      <LfoControls>
        <ControlGroup style={{ gridColumn: '1 / -1' }}>
          <LfoWaveformSelector
            value={lfo.shape}
            onChange={(shape) => updateLfo(activeLfo, { shape })}
          />
        </ControlGroup>

        <ControlGroup>
          <ControlLabel>Sync Mode</ControlLabel>
          <Select 
            value={lfo.syncMode} 
            onChange={(e) => updateLfo(activeLfo, { syncMode: e.target.value as 'Int' | 'Ext' })}
          >
            <option value="Int">Internal (0-99.9 Hz)</option>
            <option value="Ext">External (MIDI Clock)</option>
          </Select>
        </ControlGroup>

        <ControlGroup>
          {lfo.syncMode === 'Int' ? (
            <KnobBase
              size={60}
              min={0}
              max={99.9}
              step={0.1}
              value={lfo.frequency}
              onChange={(frequency) => updateLfo(activeLfo, { frequency })}
              color="#9F7AEA"
              backgroundColor="#2d3748"
              strokeColor="#4a5568"
              renderLabel={(v) => v.toFixed(1) + ' Hz'}
              label="Frequency"
            />
          ) : (
            <div>
              <ControlLabel>MIDI Clock Mode</ControlLabel>
              <Select
                value={lfo.midiClockMode}
                onChange={(e) => updateLfo(activeLfo, { midiClockMode: e.target.value as MidiClockMode })}
              >
                {MIDI_CLOCK_MODES.map((mode) => (
                  <option key={mode} value={mode}>
                    {MIDI_CLOCK_LABELS[mode]}
                  </option>
                ))}
              </Select>
            </div>
          )}
        </ControlGroup>

        <ControlGroup>
          <KnobBase
            size={60}
            min={0}
            max={360}
            step={1}
            value={lfo.phase}
            onChange={(phase) => updateLfo(activeLfo, { phase })}
            color="#48BB78"
            backgroundColor="#2d3748"
            strokeColor="#4a5568"
            renderLabel={(v) => Math.round(v) + '°'}
            label="Phase"
          />
        </ControlGroup>

        <ControlGroup>
          <KnobBase
            size={60}
            min={-1}
            max={1}
            step={0.01}
            value={lfo.bias}
            onChange={(bias) => updateLfo(activeLfo, { bias })}
            color="#F6AD55"
            backgroundColor="#2d3748"
            strokeColor="#4a5568"
            renderLabel={(v) => v.toFixed(2)}
            label="Bias"
          />
        </ControlGroup>

        <ControlGroup>
          <KnobBase
            size={60}
            min={-1}
            max={16}
            step={0.1}
            value={lfo.keysync === 'Off' ? -1 : lfo.keysync}
            onChange={(value) => {
              const keysync = value < 0 ? 'Off' : Math.max(0, value);
              updateLfo(activeLfo, { keysync });
            }}
            color="#63B3ED"
            backgroundColor="#2d3748"
            strokeColor="#4a5568"
            renderLabel={(v) => v < 0 ? 'Off' : v.toFixed(1)}
            label="KeySync"
          />
        </ControlGroup>
      </LfoControls>
    </LfoContainer>
  );
};
