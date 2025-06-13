// OperatorPanel.tsx
interface OperatorPanelProps {
  opNumber: 1 | 2 | 3 | 4;
}

export const OperatorPanel = ({ opNumber }: OperatorPanelProps) => {
  const { operators, updateParam } = usePatchStore();
  const op = operators[`op${opNumber}`];

  return (
    <div>
      <Knob
        label="Fréquence"
        value={op.freq}
        onChange={(v) => updateParam(`operators.op${opNumber}.freq`, v)}
      />
      {/* ... */}
    </div>
  );
};