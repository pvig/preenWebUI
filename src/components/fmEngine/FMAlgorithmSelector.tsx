import styled from 'styled-components';
import { AlgorithmVisualization } from './AlgorithmVisualization';
import ModulationIndexesEditor from './ModulationIndexesEditor';
import { DEFAULT_ALGORITHMS } from '../../types/patch';
import { useCurrentPatch, selectAlgorithm } from '../../stores/patchStore';

const SelectorContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
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
  margin:0 20px;
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

const VisualizationWrapper = styled.div`
  background: #1a202c;
  border-radius: 8px;
  padding: 15px;
  position: relative;
  min-height: 220px;
  display: flex;
  gap: 20px;
  align-items: flex-start;
`;

const VisualizationContainer = styled.div`
  flex: 1;
  background: #1a202c;
  border-radius: 8px;
  padding: 15px;
  position: relative;
  min-height: 220px;
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

  const currentPatch = useCurrentPatch();
  const currentAlgorithm = currentPatch?.algorithm;
  if(!currentAlgorithm) {
    return;
  }

  const currentIndex = DEFAULT_ALGORITHMS.findIndex(a => a.id === currentAlgorithm.id);
  const carriers = currentAlgorithm.ops.filter(op => op.type === 'CARRIER');

  const handlePrevious = () => {
    const newIndex = (currentIndex - 1 + DEFAULT_ALGORITHMS.length) % DEFAULT_ALGORITHMS.length;
    selectAlgorithm(DEFAULT_ALGORITHMS[newIndex]);
  };

  const handleNext = () => {
    const newIndex = (currentIndex + 1) % DEFAULT_ALGORITHMS.length;
    selectAlgorithm(DEFAULT_ALGORITHMS[newIndex]);
  };

  return (
    <SelectorContainer>

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
          {currentAlgorithm.name}
        </div>

        <NavButton
          onClick={handleNext}
          disabled={currentIndex === DEFAULT_ALGORITHMS.length - 1}
          aria-label="Next algorithm"
        >
          →
        </NavButton>
      </NavigationControls>

      <VisualizationWrapper>
        <VisualizationContainer>
          <AlgorithmVisualization algorithm={currentAlgorithm} />
        </VisualizationContainer>
        <ModulationIndexesEditor algorithm={currentAlgorithm} />
      </VisualizationWrapper>

    </SelectorContainer>
  );
};