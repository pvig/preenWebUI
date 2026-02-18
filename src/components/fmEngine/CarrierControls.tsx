import { useCurrentPatch, updateOperator } from '../../stores/patchStore';
import KnobBase from '../knobs/KnobBase';
import styled from 'styled-components';

const ControlsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 20px;
  padding: 20px;
  background: #2d3748;
`;

const OperatorControl = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 15px;
  background: #1a202c;
  border-radius: 6px;
`;

const OperatorTitle = styled.h4`
  margin: 0;
  color: #e2e8f0;
  font-size: 1rem;
  text-align: center;
`;

const ControlGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  width: 100%;
`;

const ControlLabel = styled.span`
  font-size: 0.8rem;
  color: #a0aec0;
  text-align: center;
`;

const ControlInput = styled.input`
  font-size: 0.8rem;
  color: #a0aec0;
  text-align: center;
  width:80px;
  margin-top:10px;
`;

const CarrierControls = () => {
  const currentPatch = useCurrentPatch();
  const currentAlgorithm = currentPatch.algorithm;
  const carriers = currentAlgorithm?.ops?.filter(op => op.type === 'CARRIER') || [];

  if (carriers.length === 0) {
    return (
      <ControlsContainer>
        <div style={{ color: '#a0aec0', textAlign: 'center' }}>
          No carrier operators in current algorithm
        </div>
      </ControlsContainer>
    );
  }

  return (
    <ControlsContainer>
      {carriers.map(({ id }) => {
        const operator = currentPatch.operators.find(op => op.id === id);
        return (
        <OperatorControl key={`carrier-${id}`}>
          <OperatorTitle>OP{id}</OperatorTitle>

          <ControlGroup>
            <KnobBase
              size={60}
              min={0}
              max={127}
              value={operator?.amplitude ?? 0}
              onChange={val => updateOperator(id, { amplitude: val })}
              color="#68D391"
              backgroundColor="#2d3748"
              strokeColor="#4a5568"
              renderLabel={(val) => Math.round(val)}
              label="Volume"
            />
          </ControlGroup>

          <ControlGroup>
            <ControlInput
              type="range"
              min="-100"
              max="100"
              value={operator?.pan ?? 0}
              onChange={(e) => updateOperator(id, { pan: Number(e.target.value) })}
              width="80px"
            />
            <ControlLabel>Pan</ControlLabel>
          </ControlGroup>
        </OperatorControl>
        );
      })}
    </ControlsContainer>
  );
};

export default CarrierControls;