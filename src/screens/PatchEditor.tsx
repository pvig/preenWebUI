import OperatorPanel from '../components/OperatorPanel';

export function PatchEditor() {
  const operators = [1, 2, 3, 4];

  return (
    <div className="editor-container">
      <h2>Édition de Patch</h2>
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