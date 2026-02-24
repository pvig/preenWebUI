import React, { useState } from 'react';
import styled from 'styled-components';
import KnobBase from '../knobs/KnobBase';

const SeqContainer = styled.div`
  background: #2d3748;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
`;

const SeqTitle = styled.h3`
  color: #e2e8f0;
  font-size: 0.9rem;
  margin: 0 0 10px 0;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const SeqTabs = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
`;

const SeqTab = styled.button<{ active: boolean }>`
  background: ${props => props.active ? '#4a5568' : '#1a202c'};
  border: none;
  border-radius: 4px;
  color: ${props => props.active ? '#63b3ed' : '#a0aec0'};
  padding: 6px 12px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #4a5568;
    color: #63b3ed;
  }
`;

const StepGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(16, 1fr);
  gap: 4px;
  margin-bottom: 12px;
`;

const Step = styled.div<{ active: boolean; value: number }>`
  height: ${props => 30 + (props.value * 0.4)}px;
  background: ${props => props.active ? '#63b3ed' : '#4a5568'};
  border-radius: 3px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  
  &:hover {
    background: ${props => props.active ? '#4299e1' : '#718096'};
  }
  
  &::after {
    content: '${props => props.value}';
    font-size: 0.6rem;
    color: #1a202c;
    font-weight: bold;
    padding-bottom: 2px;
  }
`;

const SeqControls = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 12px;
  align-items: start;
  margin-top: 12px;
`;

const ControlGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
`;

const ControlLabel = styled.label`
  color: #a0aec0;
  font-size: 0.65rem;
  text-transform: uppercase;
`;

const Select = styled.select`
  background: #4a5568;
  border: 1px solid #2d3748;
  border-radius: 4px;
  color: #e2e8f0;
  padding: 6px;
  font-size: 0.75rem;
  width: 100%;
  
  &:focus {
    outline: none;
    border-color: #63b3ed;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
`;

const ActionButton = styled.button`
  background: #4a5568;
  border: none;
  border-radius: 4px;
  color: #e2e8f0;
  padding: 6px 12px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #63b3ed;
    color: #1a202c;
  }
`;

/**
 * Composant SeqEditor
 * Gère les 2 séquenceurs à pas (Step Sequencers) du PreenFM3
 */
export const SeqEditor: React.FC = () => {
  const [activeSeq, setActiveSeq] = useState<number>(1);
  const [steps, setSteps] = useState<number[]>(Array(16).fill(50));
  const [activeSteps, setActiveSteps] = useState<boolean[]>(Array(16).fill(true));

  const handleStepClick = (index: number) => {
    const newActiveSteps = [...activeSteps];
    newActiveSteps[index] = !newActiveSteps[index];
    setActiveSteps(newActiveSteps);
  };

  const handleStepValueChange = (index: number, delta: number) => {
    const newSteps = [...steps];
    newSteps[index] = Math.max(0, Math.min(100, newSteps[index] + delta));
    setSteps(newSteps);
  };

  const randomizeSteps = () => {
    setSteps(Array(16).fill(0).map(() => Math.floor(Math.random() * 101)));
  };

  const clearSteps = () => {
    setSteps(Array(16).fill(50));
    setActiveSteps(Array(16).fill(true));
  };

  return (
    <SeqContainer>
      <SeqTitle>Step Sequencer</SeqTitle>
      
      <SeqTabs>
        {[1, 2].map((seqNum) => (
          <SeqTab
            key={seqNum}
            active={activeSeq === seqNum}
            onClick={() => setActiveSeq(seqNum)}
          >
            Seq {seqNum}
          </SeqTab>
        ))}
      </SeqTabs>

      <ButtonGroup>
        <ActionButton onClick={randomizeSteps}>Randomize</ActionButton>
        <ActionButton onClick={clearSteps}>Clear</ActionButton>
      </ButtonGroup>

      <StepGrid>
        {steps.map((value, index) => (
          <Step
            key={index}
            active={activeSteps[index]}
            value={value}
            onClick={() => handleStepClick(index)}
            onWheel={(e) => {
              e.preventDefault();
              handleStepValueChange(index, e.deltaY > 0 ? -5 : 5);
            }}
            title={`Step ${index + 1}: ${value}`}
          />
        ))}
      </StepGrid>

      <SeqControls>
        <ControlGroup>
          <KnobBase
            size={50}
            min={0}
            max={100}
            step={0.1}
            value={50}
            onChange={(val) => console.log('BPM:', val)}
            color="#9F7AEA"
            backgroundColor="#2d3748"
            strokeColor="#4a5568"
            renderLabel={(v) => v.toFixed(1)}
            label="BPM"
          />
        </ControlGroup>

        <ControlGroup>
          <KnobBase
            size={50}
            min={1}
            max={16}
            step={1}
            value={16}
            onChange={(val) => console.log('Steps:', val)}
            color="#48BB78"
            backgroundColor="#2d3748"
            strokeColor="#4a5568"
            renderLabel={(v) => Math.round(v)}
            label="Steps"
          />
        </ControlGroup>

        <ControlGroup>
          <ControlLabel>Gate Mode</ControlLabel>
          <Select defaultValue="Gate">
            <option value="Gate">Gate</option>
            <option value="Trigger">Trigger</option>
            <option value="Hold">Hold</option>
          </Select>
        </ControlGroup>

        <ControlGroup>
          <ControlLabel>Direction</ControlLabel>
          <Select defaultValue="Forward">
            <option value="Forward">Forward</option>
            <option value="Backward">Backward</option>
            <option value="PingPong">Ping Pong</option>
            <option value="Random">Random</option>
          </Select>
        </ControlGroup>

        <ControlGroup>
          <ControlLabel>MIDI Sync</ControlLabel>
          <Select defaultValue="Off">
            <option value="Off">Off</option>
            <option value="On">On</option>
          </Select>
        </ControlGroup>
      </SeqControls>
    </SeqContainer>
  );
};
