// FineTuneKnob.jsx
import Knob from "../../knobs/KnobBase";

interface FineTuneKnobProps {
  min?: number;
  max?: number;
  step?: number;
  value: number; // <-- contrôlé par le parent
  label?: string;
  onChange: (v: number) => void;
}

export const FineTuneKnob: React.FC<FineTuneKnobProps> = ({
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
      renderValue={(v: number) => v.toFixed(2)}
      color="#1E90FF"
      strokeColor="#aaa"
      backgroundColor="#f5faff"
      size={60}
    />
  );
};

export default FineTuneKnob;