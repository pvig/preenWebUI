// FineTuneKnob.jsx
import React from "react";
import Knob from "../../knobs/KnobBase";
import { useThemeStore } from '../../../theme/themeStore';

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
  const { theme } = useThemeStore();
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
      color={theme.colors.knobFrequency}
      strokeColor={theme.colors.knobStroke}
      backgroundColor={theme.colors.knobBackground}
      size={60}
    />
  );
};

export default FrequencyKnob;