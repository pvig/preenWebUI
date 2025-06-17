import { Select, MenuItem } from '@mui/material';


const trackingModes = [
  { value: 0, label: 'Fixed' },
  { value: 1, label: 'Keyboard' },
  { value: 2, label: 'Finetune Hz' }
];

export const KeyboardTrackingSelect = ({ value, onChange }) => {
  return (
    <div className="operator-control">
      <label>Tracking clavier</label>
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value)}
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