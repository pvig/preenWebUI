// FineTuneKnob.jsx
import React, { useState } from "react";
import Knob from "../../knobs/KnobBase";

export function FrequencyKnob({
  min = -1,
  max = 1,
  step = 0.01,
  initial = 0,
  label ="",
  onChange,
  ...props
}) {
  const [value, setValue] = useState(initial);

  const setFineValue = (v) => {
    const rounded = Math.round(v / step) * step;
    setValue(parseFloat(rounded.toFixed(4))); // 4 décimales max
    onChange(rounded);
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
}

export default FrequencyKnob;