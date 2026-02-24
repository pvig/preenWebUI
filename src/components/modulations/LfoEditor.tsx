import React, { useState } from 'react';
import styled from 'styled-components';
import KnobBase from '../knobs/KnobBase';

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

const LfoTab = styled.button<{ active: boolean }>`
  background: ${props => props.active ? '#4a5568' : '#1a202c'};
  border: none;
  border-radius: 4px;
  color: ${props => props.active ? '#63b3ed' : '#a0aec0'};
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
  const [activeLfo, setActiveLfo] = useState<number>(1);

  const lfoShapes = [
    'Sine',
    'Saw',
    'Square',
    'Triangle',
    'Random',
  ];

  const syncModes = [
    'Off',
    'Keysync On',
    'MIDI Clock',
  ];

  return (
    <LfoContainer>
      <LfoTitle>LFO Editor</LfoTitle>
      
      <LfoTabs>
        {[1, 2, 3].map((lfoNum) => (
          <LfoTab
            key={lfoNum}
            active={activeLfo === lfoNum}
            onClick={() => setActiveLfo(lfoNum)}
          >
            LFO {lfoNum}
          </LfoTab>
        ))}
      </LfoTabs>

      <LfoControls>
        <ControlGroup>
          <ControlLabel>Shape</ControlLabel>
          <Select defaultValue="Sine">
            {lfoShapes.map((shape) => (
              <option key={shape} value={shape}>
                {shape}
              </option>
            ))}
          </Select>
        </ControlGroup>

        <ControlGroup>
          <KnobBase
            size={60}
            min={0}
            max={100}
            step={0.1}
            value={50}
            onChange={(val) => console.log('Frequency:', val)}
            color="#9F7AEA"
            backgroundColor="#2d3748"
            strokeColor="#4a5568"
            renderLabel={(v) => v.toFixed(1)}
            label="Frequency"
          />
        </ControlGroup>

        <ControlGroup>
          <KnobBase
            size={60}
            min={0}
            max={100}
            step={1}
            value={0}
            onChange={(val) => console.log('Phase:', val)}
            color="#48BB78"
            backgroundColor="#2d3748"
            strokeColor="#4a5568"
            renderLabel={(v) => Math.round(v)}
            label="Phase"
          />
        </ControlGroup>

        <ControlGroup>
          <KnobBase
            size={60}
            min={-100}
            max={100}
            step={1}
            value={0}
            onChange={(val) => console.log('Bias:', val)}
            color="#F6AD55"
            backgroundColor="#2d3748"
            strokeColor="#4a5568"
            renderLabel={(v) => Math.round(v)}
            label="Bias"
          />
        </ControlGroup>

        <ControlGroup>
          <ControlLabel>Sync Mode</ControlLabel>
          <Select defaultValue="Off">
            {syncModes.map((mode) => (
              <option key={mode} value={mode}>
                {mode}
              </option>
            ))}
          </Select>
        </ControlGroup>

        <ControlGroup>
          <KnobBase
            size={60}
            min={0}
            max={16}
            step={1}
            value={0}
            onChange={(val) => console.log('KeySync:', val)}
            color="#63B3ED"
            backgroundColor="#2d3748"
            strokeColor="#4a5568"
            renderLabel={(v) => Math.round(v)}
            label="KeySync"
          />
        </ControlGroup>
      </LfoControls>
    </LfoContainer>
  );
};
