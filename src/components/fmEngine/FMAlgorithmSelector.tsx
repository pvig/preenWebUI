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

const NavigationControls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const NavButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #4a5568;
  color: white;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background: #63b3ed;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const AlgorithmInfo = styled.div`
  text-align: center;
`;

const AlgorithmName = styled.h3`
  margin: 0;
  color: #e2e8f0;
  font-size: 1.3rem;
`;

const AlgorithmDetails = styled.div`
  color: #a0aec0;
  font-size: 0.9rem;
`;

const VisualizationWrapper = styled.div`
  background: #1a202c;
  border-radius: 8px;
  padding: 15px;
  position: relative;
  min-height: 200px;
`;

const CarriersIndicator = styled.div`
  position: absolute;
  bottom: 10px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 10px;
`;

const CarrierBadge = styled.div`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #68d391;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
`;

export const FMAlgorithmSelector = () => {
  const {
    algorithms,
    currentAlgorithm,
    setCurrentAlgorithm
  } = useFMSynth();

  const currentIndex = algorithms.findIndex(a => a.id === currentAlgorithm.id);
  const carriers = currentAlgorithm.ops.filter(op => op.type === 'carrier');

  const handlePrevious = () => {
    const newIndex = (currentIndex - 1 + algorithms.length) % algorithms.length;
    setCurrentAlgorithm(algorithms[newIndex]);
  };

  const handleNext = () => {
    const newIndex = (currentIndex + 1) % algorithms.length;
    setCurrentAlgorithm(algorithms[newIndex]);
  };

  return (
    <SelectorContainer>
      <AlgorithmInfo>
        <AlgorithmName>{currentAlgorithm.name}</AlgorithmName>
        <AlgorithmDetails>
          {currentAlgorithm.operatorCount} Operators • Algorithm {currentIndex + 1}/{algorithms.length}
        </AlgorithmDetails>
      </AlgorithmInfo>

      <VisualizationWrapper>
        <AlgorithmVisualization algorithm={currentAlgorithm} />
        
        <CarriersIndicator>
          {carriers.map(op => (
            <CarrierBadge key={`carrier-badge-${op.id}`}>
              {op.id}
            </CarrierBadge>
          ))}
        </CarriersIndicator>
      </VisualizationWrapper>

      <NavigationControls>
        <NavButton 
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          aria-label="Previous algorithm"
        >
          ←
        </NavButton>
        
        <div style={{ flexGrow: 1, textAlign: 'center' }}>
          {/* Pourrait ajouter un sélecteur déroulant ici */}
        </div>
        
        <NavButton 
          onClick={handleNext}
          disabled={currentIndex === algorithms.length - 1}
          aria-label="Next algorithm"
        >
          →
        </NavButton>
      </NavigationControls>
    </SelectorContainer>
  );
};