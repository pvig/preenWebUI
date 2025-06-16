import OperatorPanel from '../components/OperatorPanel';

export function PatchEditor() {
  const operators = [1, 2, 3, 4, 5, 6];

  return (
    <div className="editor-container">
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