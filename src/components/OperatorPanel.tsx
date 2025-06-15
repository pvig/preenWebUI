import { usePatchStore } from '../stores/patchStore';
import EnvelopeGraph from './EnvelopeGraph';
import Knob from './Knob';

interface OperatorPanelProps {
  opNumber: number; // 1 à 4
}

export const OperatorPanel = ({ opNumber }: OperatorPanelProps) => {
  const { operators, updateOperator, selectedOperator } = usePatchStore();
  const operator = operators[`op${opNumber}` as keyof typeof operators];

  const handleFrequencyChange = (newFreq: number) => {
    updateOperator(opNumber, { freq: newFreq });
  };

  return (
    <div className={`operator-panel ${opNumber === selectedOperator ? 'active' : ''}`}>
      <h3>Operator {opNumber}</h3>
      
      {/* Contrôle de fréquence */}
      <Knob 
        label="Frequency"
        value={operator.freq}
        onChange={handleFrequencyChange}
        min={0}
        max={127}
      />
      
      {/* Éditeur d'enveloppe */}
      <EnvelopeGraph
        operatorNumber={opNumber}
      />
      
      {/* Autres contrôles d'opérateur... */}
    </div>
  );
};

export default OperatorPanel