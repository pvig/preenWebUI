// FineTuneKnob.jsx
import React from "react";
import Knob from "../../knobs/KnobBase";

interface FrequencyKnobProps {
  min?: number;
  max?: number;
  step?: number;
  value: number;
  label?: string;
  onChange: (v: number) => void;
}

export const FrequencyKnob: React.FC<FrequencyKnobProps> = ({
  min = -1,
  max = 1,
  step = 0.01,
  value,
  label = "",
  onChange,
  ...props
}) => {
  const setFineValue = (v: number) => {
    const rounded = Math.round(v / step) * step;
    onChange(parseFloat(rounded.toFixed(4))); // 4 décimales max
  };

  return (
    <Knob
      {...props}
      min={min}
      max={max}
      value={value}
      onChange={setFineValue}
      label={label}
      color="#1E90FF"
      strokeColor="#aaa"
      backgroundColor="#f5faff"
      size={60}
    />
  );
};

export default FrequencyKnob;