import { ToggleButtonGroup, ToggleButton } from '@mui/material';

export const KeyboardTrackingSelect = ({ value, onChange }) => {
  return (
    <div className="operator-control">
      <label>Tracking clavier</label>
      <ToggleButtonGroup
        exclusive
        value={value}
        onChange={(_, newValue) => onChange('follows', newValue)}
      >
        <ToggleButton value="fixed">Fixé</ToggleButton>
        <ToggleButton value="keyboard">Clavier</ToggleButton>
        <ToggleButton value="finetuneHz">Finetune Hz</ToggleButton>
      </ToggleButtonGroup>
    </div>
  );
}

export default KeyboardTrackingSelect;