import React, { useState } from 'react';
import styled from 'styled-components';
import KnobBase from '../knobs/KnobBase';

const EnvContainer = styled.div`
  background: #2d3748;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
`;

const EnvTitle = styled.h3`
  color: #e2e8f0;
  font-size: 1rem;
  margin: 0 0 15px 0;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const EnvTabs = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
`;

const EnvTab = styled.button<{ active: boolean }>`
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

const EnvControls = styled.div`
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

const EnvVisualizer = styled.div`
  width: 100%;
  height: 120px;
  background: #1a202c;
  border-radius: 4px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4a5568;
  font-size: 0.875rem;
`;

/**
 * Composant LfoEnvEditor
 * Gère les 2 enveloppes libres (Env1 et Env2) du PreenFM3
 * Ces enveloppes peuvent moduler les LFOs et autres paramètres
 */
export const LfoEnvEditor: React.FC = () => {
  const [activeEnv, setActiveEnv] = useState<number>(1);

  const loopModes = [
    'Off',
    'Loop',
    'Ping Pong',
  ];

  return (
    <EnvContainer>
      <EnvTitle>LFO Envelope Editor</EnvTitle>
      
      <EnvTabs>
        {[1, 2].map((envNum) => (
          <EnvTab
            key={envNum}
            active={activeEnv === envNum}
            onClick={() => setActiveEnv(envNum)}
          >
            Env {envNum}
          </EnvTab>
        ))}
      </EnvTabs>

      <EnvVisualizer>
        Envelope visualization (to be implemented)
      </EnvVisualizer>

      <EnvControls>
        <ControlGroup>
          <KnobBase
            size={60}
            min={0}
            max={100}
            step={1}
            value={0}
            onChange={(val) => console.log('Attack:', val)}
            color="#F56565"
            backgroundColor="#2d3748"
            strokeColor="#4a5568"
            renderLabel={(v) => Math.round(v)}
            label="Attack"
          />
        </ControlGroup>

        <ControlGroup>
          <KnobBase
            size={60}
            min={0}
            max={100}
            step={1}
            value={50}
            onChange={(val) => console.log('Attack Level:', val)}
            color="#F6AD55"
            backgroundColor="#2d3748"
            strokeColor="#4a5568"
            renderLabel={(v) => Math.round(v)}
            label="Atk Level"
          />
        </ControlGroup>

        <ControlGroup>
          <KnobBase
            size={60}
            min={0}
            max={100}
            step={1}
            value={30}
            onChange={(val) => console.log('Decay:', val)}
            color="#48BB78"
            backgroundColor="#2d3748"
            strokeColor="#4a5568"
            renderLabel={(v) => Math.round(v)}
            label="Decay"
          />
        </ControlGroup>

        <ControlGroup>
          <KnobBase
            size={60}
            min={0}
            max={100}
            step={1}
            value={50}
            onChange={(val) => console.log('Decay Level:', val)}
            color="#4299E1"
            backgroundColor="#2d3748"
            strokeColor="#4a5568"
            renderLabel={(v) => Math.round(v)}
            label="Dec Level"
          />
        </ControlGroup>

        <ControlGroup>
          <KnobBase
            size={60}
            min={0}
            max={100}
            step={1}
            value={40}
            onChange={(val) => console.log('Sustain:', val)}
            color="#9F7AEA"
            backgroundColor="#2d3748"
            strokeColor="#4a5568"
            renderLabel={(v) => Math.round(v)}
            label="Sustain"
          />
        </ControlGroup>

        <ControlGroup>
          <KnobBase
            size={60}
            min={0}
            max={100}
            step={1}
            value={30}
            onChange={(val) => console.log('Sustain Level:', val)}
            color="#ED64A6"
            backgroundColor="#2d3748"
            strokeColor="#4a5568"
            renderLabel={(v) => Math.round(v)}
            label="Sus Level"
          />
        </ControlGroup>

        <ControlGroup>
          <KnobBase
            size={60}
            min={0}
            max={100}
            step={1}
            value={50}
            onChange={(val) => console.log('Release:', val)}
            color="#63B3ED"
            backgroundColor="#2d3748"
            strokeColor="#4a5568"
            renderLabel={(v) => Math.round(v)}
            label="Release"
          />
        </ControlGroup>

        <ControlGroup>
          <ControlLabel>Loop Mode</ControlLabel>
          <Select defaultValue="Off">
            {loopModes.map((mode) => (
              <option key={mode} value={mode}>
                {mode}
              </option>
            ))}
          </Select>
        </ControlGroup>
      </EnvControls>
    </EnvContainer>
  );
};
