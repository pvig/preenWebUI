
interface KnobProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

// Export nommé recommandé
export const Knob = ({
  label,
  value,
  onChange,
  min = 0,
  max = 127
}: KnobProps) => {
  return (
    <label >{label}
    <input
      type="range"
      min={min}
      max={max}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="knob"
    />
    </label>
  );
};