import React, { useState } from 'react';
import styled from 'styled-components';
import KnobBase from '../knobs/KnobBase';
import LfoWaveformSelector from './LfoWaveformSelector';
import { type MidiClockMode, MIDI_CLOCK_MODES, MIDI_CLOCK_LABELS } from '../../types/lfo';
import { useLfo, updateLfo } from '../../stores/patchStore';
import { useThemeStore } from '../../theme/themeStore';

const LfoContainer = styled.div`
  background: ${props => props.theme.colors.panel};
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
  border: 1px solid ${props => props.theme.colors.border};
`;

const LfoTitle = styled.h3`
  color: ${props => props.theme.colors.text};
  font-size: 1rem;
  margin: 0 0 8px 0;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 12px;
`;

const HeaderLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 200px;
`;

const LfoTabs = styled.div`
  display: flex;
  gap: 8px;
`;

const LfoTab = styled.button<{ $active: boolean }>`
  background: ${props => props.$active ? props.theme.colors.buttonActive : props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 4px;
  color: ${props => props.$active ? props.theme.colors.background : props.theme.colors.textMuted};
  padding: 6px 12px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.theme.colors.buttonHover};
    color: ${props => props.theme.colors.primary};
  }
`;

const LfoControls = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
  align-items: start;
`;

const ControlGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
`;

const ControlLabel = styled.label`
  color: ${props => props.theme.colors.textMuted};
  font-size: 0.75rem;
  text-transform: uppercase;
`;

const Select = styled.select`
  background: ${props => props.theme.colors.button};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 4px;
  color: ${props => props.theme.colors.text};
  padding: 6px 8px;
  font-size: 0.75rem;
  min-width: 80px;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

/**
 * Composant LfoEditor
 * Gère les 3 LFOs du PreenFM3 (selon le code de référence)
 */
export const LfoEditor: React.FC = () => {
  const [activeLfo, setActiveLfo] = useState<0 | 1 | 2>(0);
  const lfo = useLfo(activeLfo);
  const { theme } = useThemeStore();

  return (
    <LfoContainer>
      <HeaderRow>
        <HeaderLeft>
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
        </HeaderLeft>
        
        <LfoWaveformSelector
          value={lfo.shape}
          onChange={(shape) => updateLfo(activeLfo, { shape })}
        />
      </HeaderRow>

      <LfoControls>
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
              backgroundColor={theme.colors.knobBackground}
              strokeColor={theme.colors.knobStroke}
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
            backgroundColor={theme.colors.knobBackground}
            strokeColor={theme.colors.knobStroke}
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
            backgroundColor={theme.colors.knobBackground}
            strokeColor={theme.colors.knobStroke}
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
            backgroundColor={theme.colors.knobBackground}
            strokeColor={theme.colors.knobStroke}
            renderLabel={(v) => v < 0 ? 'Off' : v.toFixed(1)}
            label="KeySync"
          />
        </ControlGroup>
      </LfoControls>
    </LfoContainer>
  );
};
