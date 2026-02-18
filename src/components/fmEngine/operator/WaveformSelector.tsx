import { Select, MenuItem } from '@mui/material';
import { WaveformType } from '../../../types/waveform';

const WAVEFORMS = [
  { value: 'SINE', label: 'Sinus' },
  { value: 'SQUARE', label: 'Carré' },
  { value: 'TRIANGLE', label: 'Triangle' },
  { value: 'SAW', label: 'Dent de scie' }
];

export const WaveformSelector = ({ value, onChange }: { value?: WaveformType; onChange: (v: WaveformType) => void }) => {
  return (
    <div className="operator-control">
      <label>Forme d'onde</label>
      <Select
        value={value || 'SINE'}
        onChange={(e) => onChange(e.target.value as WaveformType)}
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