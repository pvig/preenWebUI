import styled from 'styled-components';
import OperatorPanel from '../components/fmEngine/OperatorPanel';
import { FMSynthProvider } from '../components/fmEngine/FMSynthContext';
import { FMAlgorithmSelector } from '../components/fmEngine/FMAlgorithmSelector';
import CarrierControls from '../components/fmEngine/CarrierControls';
import { useCurrentPatch } from '../stores/patchStore';
import ModulationIndexesEditor from '../components/fmEngine/ModulationIndexesEditor';

const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  height: auto;
  background: #1a202c;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const OperatorGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
`;

export function PatchEditor() {

  const currentPatch = useCurrentPatch();

  if(!currentPatch) {
    return null;
  }

  return (
    <div className="editor-container">
      <FMSynthProvider patch={currentPatch}>
        <Row>
          <FMAlgorithmSelector />
          <ModulationIndexesEditor algorithm={currentPatch.algorithm} />
        </Row>
        
        <CarrierControls />

        <Row>
          <OperatorGrid>
            {currentPatch.operators.map((op) => (
              <OperatorPanel opNumber={op.id} key={op.id} />
            ))}
          </OperatorGrid>
        </Row>
      </FMSynthProvider>
    </div>
  );
}