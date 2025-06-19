import React from 'react';
import { useFMSynth } from './FMSynthContext';
import styled from 'styled-components';

const Container = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 15px;
  padding: 20px;
`;

const KnobContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Label = styled.div`
  margin-bottom: 8px;
  font-weight: bold;
  color: #e2e8f0;
`;

export const ModulationIndexes: React.FC = () => {
  const { imValues, updateImValue } = useFMSynth();

  return (
    <Container>
      {Object.entries(imValues).map(([key, value]) => (
        <KnobContainer key={key}>
          <Label>{key}</Label>
          <input
            type="range"
            min="0"
            max="127"
            value={value.value}
            onChange={(e) => updateImValue(
              parseInt(key.replace('IM', '')),
              'value',
              parseInt(e.target.value)
            )}
          />
          <input
            type="range"
            min="-64"
            max="63"
            value={value.veloSens}
            onChange={(e) => updateImValue(
              parseInt(key.replace('IM', '')),
              'veloSens',
              parseInt(e.target.value)
            )}
          />
        </KnobContainer>
      ))}
    </Container>
  );
};