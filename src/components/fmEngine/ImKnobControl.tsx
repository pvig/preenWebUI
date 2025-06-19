import React from 'react';
import styled from 'styled-components';
import Knob from "../knobs/KnobBase";

const ImControlContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  background: #2d3748;
  border-radius: 8px;
  width: 80px;
`;

const ImLabel = styled.div`
  color: white;
  font-size: 12px;
  margin-bottom: 5px;
`;

export const ImKnobControl: React.FC<{
  imNumber: number;
  value: number;
  veloSens: number;
  onChange: (type: 'value' | 'veloSens', val: number) => void;
}> = ({ imNumber, value, veloSens, onChange }) => {
  return (
    <ImControlContainer>
      <ImLabel>IM{imNumber}</ImLabel>
      <Knob
        knobRadius={50}
        value={value}
        min={0}
        max={127}
        onChange={(val) => onChange('value', val)}
        size={50}
      />
      <Knob
        knobRadius={50}
        value={veloSens}
        min={-64}
        max={63}
        onChange={(val) => onChange('veloSens', val)}
        size={40}
      />
      <ImLabel>Velo: {veloSens > 0 ? `+${veloSens}` : veloSens}</ImLabel>
    </ImControlContainer>
  );
};