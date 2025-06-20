import { Select, MenuItem } from '@mui/material';

const WAVEFORMS = [
  { value: 0, label: 'Sinus' },
  { value: 1, label: 'Carré' },
  { value: 2, label: 'Triangle' },
  { value: 3, label: 'Dent de scie' }
];

export const WaveformSelector = ({ value, onChange }) => {
  return (
    <div className="operator-control">
      <label>Forme d'onde</label>
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        size="small"
        variant="standard"
      >
        {WAVEFORMS.map(wave => (
          <MenuItem key={wave.value} value={wave.value}>
            {wave.label}
          </MenuItem>
        ))}
      </Select>
    </div>
  );
}


export default WaveformSelector;