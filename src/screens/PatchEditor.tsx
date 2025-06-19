import styled from 'styled-components';
import OperatorPanel from '../components/fmEngine/OperatorPanel';
import { FMSynthProvider } from '../components/fmEngine/FMSynthContext';
import { FMAlgorithmSelector } from '../components/fmEngine/FMAlgorithmSelector';
import { ModulationIndexes } from '../components/fmEngine/ModulationIndexes';
import CarrierControls from '../components/fmEngine/CarrierControls';

export function PatchEditor() {

  const operators = [1, 2, 3, 4, 5, 6];

  const Row = styled.div`
  display: flex;
  height: 100vh;
  background: #1a202c;
`;

  const Panel = styled.div`
  width: 50%;
  padding: 20px;
  overflow-y: auto;
`;

  const OperatorGrid = styled.div`
  display:flex;
  flex-wrap: wrap;
`;

  return (
<div className="editor-container">
  <FMSynthProvider>
    <Row>
      <FMAlgorithmSelector />
      <ModulationIndexes />
    </Row>

    <CarrierControls />

    <Row>
      <OperatorGrid>
        {operators.map((op) => (
          <OperatorPanel
            key={`operator-${op}`}
            opNumber={op}
          />
        ))}
      </OperatorGrid>
    </Row>
  </FMSynthProvider>
</div>
  );
}