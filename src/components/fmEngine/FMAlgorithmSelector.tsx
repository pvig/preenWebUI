import React from 'react';
import { useFMSynth } from './FMSynthContext';
import styled from 'styled-components';
import { AlgorithmVisualization } from './AlgorithmVisualization';

const SelectorContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  background: #2d3748;
  border-radius: 8px;
`;

const AlgorithmGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 15px;
`;

const AlgorithmCard = styled.div<{ $selected: boolean }>`
  padding: 15px;
  background: ${p => p.$selected ? '#4a5568' : '#1a202c'};
  border: 1px solid ${p => p.$selected ? '#63b3ed' : '#2d3748'};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;

  &:hover {
    border-color: #63b3ed;
  }

    position: relative;
`;

const AlgorithmName = styled.div`
  font-weight: bold;
  margin-bottom: 5px;
`;

const OperatorCount = styled.small`
  color: #a0aec0;
`;

const VisualizationContainer = styled.div`
  width: 100%;
  height: 120px;
  margin-top: 10px;
`;

const AlgorithmBadge = styled.div<{ $type: 'carrier' | 'modulator' }>`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: ${p => p.$type === 'carrier' ? '#68D391' : '#63B3ED'};
  color: white;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const FMAlgorithmSelector = () => {
  const { algorithms, currentAlgorithm, setCurrentAlgorithm } = useFMSynth();

  return (
    <SelectorContainer>
      <h2>Algorithm Selection</h2>
      <AlgorithmGrid>
        {algorithms.map(algorithm => {
          const carriersCount = algorithm.ops.filter(op => op.type === 'carrier').length;
          
          return (
            <AlgorithmCard
              key={algorithm.id}
              $selected={algorithm.id === currentAlgorithm.id}
              onClick={() => setCurrentAlgorithm(algorithm)}
            >
              <AlgorithmBadge $type={carriersCount > 0 ? 'carrier' : 'modulator'}>
                {carriersCount}
              </AlgorithmBadge>
              
              <AlgorithmName>{algorithm.name}</AlgorithmName>
              <OperatorCount>{algorithm.operatorCount} Operators</OperatorCount>
              
              <VisualizationContainer>
                <AlgorithmVisualization algorithm={algorithm} />
              </VisualizationContainer>
            </AlgorithmCard>
          );
        })}
      </AlgorithmGrid>
    </SelectorContainer>
  );
};