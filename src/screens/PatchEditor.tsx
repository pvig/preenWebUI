import styled from 'styled-components';
import OperatorPanel from '../components/fmEngine/OperatorPanel';
import { FMSynthProvider } from '../components/fmEngine/FMSynthContext';
import { FMAlgorithmSelector } from '../components/fmEngine/FMAlgorithmSelector';
import { ModulationIndexes } from '../components/fmEngine/ModulationIndexes';
import CarrierControls from '../components/fmEngine/CarrierControls';
import { useCurrentPatch } from '../stores/patchStore';

const Row = styled.div`
  display: flex;
  height: auto;
  background: #1a202c;
`;

const OperatorGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
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
          <ModulationIndexes />
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