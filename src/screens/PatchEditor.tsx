import OperatorPanel from '../components/OperatorPanel';
import FMAlgorithmSelector from '../components/FMAlgorithmSelector';

export function PatchEditor() {
  const operators = [1, 2, 3, 4, 5, 6];

  const handleAlgorithmChange = (newAlgo: number) => {
    console.log("newAlgo", newAlgo);
  };

  return (
    <div className="editor-container">
      <FMAlgorithmSelector onAlgorithmChange={handleAlgorithmChange} />
      <div className="operator-grid">
        {operators.map((op) => (
          <OperatorPanel 
            key={`operator-${op}`}
            opNumber={op} 
            />
        ))}
      </div>
    </div>
  );
}