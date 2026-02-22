import { Select, MenuItem } from '@mui/material';

interface KeyboardTrackingSelectProps {
  value: number;
  onChange: (value: number) => void;
}

const trackingModes = [
  { value: 0, label: 'Fixed' },
  { value: 1, label: 'Keyboard' },
  { value: 2, label: 'Finetune Hz' }
];

export const KeyboardTrackingSelect: React.FC<KeyboardTrackingSelectProps> = ({ value, onChange }) => {
  return (
    <div className="operator-control">
      <label>Tracking clavier</label>
      <Select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        size="small"
        variant="standard"
      >
        {trackingModes.map(wave => (
          <MenuItem key={wave.value} value={wave.value}>
            {wave.label}
          </MenuItem>
        ))}
      </Select>
    </div>
  );
}

export default KeyboardTrackingSelect;