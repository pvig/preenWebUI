import styled from 'styled-components';
import { AlgorithmVisualization } from './AlgorithmVisualization';
import { DEFAULT_ALGORITHMS } from '../../types/patch';
import { useCurrentPatch, selectAlgorithm } from '../../stores/patchStore';

const SelectorContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 20px;
  background: #2d3748;
  border-radius: 8px;
  min-width: 250px;
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

const AlgorithmSelect = styled.select`
  flex: 1;
  padding: 8px 12px;
  background: #1a202c;
  color: #cbd5e0;
  border: 2px solid #4a5568;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  outline: none;
  transition: all 0.2s;

  &:hover {
    border-color: #63b3ed;
  }

  &:focus {
    border-color: #63b3ed;
    box-shadow: 0 0 0 3px rgba(99, 179, 237, 0.1);
  }

  option {
    background: #1a202c;
    color: #cbd5e0;
  }
`;

const VisualizationWrapper = styled.div`
  background: #1a202c;
  border-radius: 8px;
  padding: 15px;
  position: relative;
  min-height: 220px;
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  align-items: flex-start;
`;

const VisualizationContainer = styled.div`
  flex: 1 1 260px;
  min-width: 220px;
  background: #1a202c;
  border-radius: 8px;
  padding: 15px;
  position: relative;
  min-height: 220px;
`;

export const FMAlgorithmSelector = () => {

  const currentPatch = useCurrentPatch();
  const currentAlgorithm = currentPatch?.algorithm;
  if(!currentAlgorithm) {
    return;
  }

  const currentIndex = DEFAULT_ALGORITHMS.findIndex(a => a.id === currentAlgorithm.id);
  const handlePrevious = () => {
    const newIndex = (currentIndex - 1 + DEFAULT_ALGORITHMS.length) % DEFAULT_ALGORITHMS.length;
    selectAlgorithm(DEFAULT_ALGORITHMS[newIndex]);
  };

  const handleNext = () => {
    const newIndex = (currentIndex + 1) % DEFAULT_ALGORITHMS.length;
    selectAlgorithm(DEFAULT_ALGORITHMS[newIndex]);
  };

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedAlgo = DEFAULT_ALGORITHMS.find(a => String(a.id) === event.target.value);
    if (selectedAlgo) {
      selectAlgorithm(selectedAlgo);
    }
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

        <AlgorithmSelect 
          value={String(currentAlgorithm.id)} 
          onChange={handleSelectChange}
          aria-label="Select algorithm"
        >
          {DEFAULT_ALGORITHMS.map((algo) => (
            <option key={String(algo.id)} value={String(algo.id)}>
              {algo.name}
            </option>
          ))}
        </AlgorithmSelect>

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

      </VisualizationWrapper>

    </SelectorContainer>
  );
};