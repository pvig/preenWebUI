import { Slider } from '@mui/material';

export const FineTuneKnob = ({ value, onChange }) => {
  console.log("value", value);
  return (
    <div className="operator-control">
      <label>Fine Tune (-1 à 1)</label>
      <Slider
        min={-1}
        max={1}
        step={0.01}
        value={value}
        onChange={(e, newValue) => onChange('fineTune', newValue)}
      />
      <span>{value}</span>
    </div>
  );
}

export default FineTuneKnob;