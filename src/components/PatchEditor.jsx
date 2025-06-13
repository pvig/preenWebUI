// src/components/PatchEditor.jsx
import { OperatorPanel, FilterPanel, EnvelopePanel } from './';

export const PatchEditor = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* 3 opérateurs (le PreenFM3 en a 4, adaptez) */}
      {[1, 2, 3].map((op) => (
        <OperatorPanel key={op} operatorId={op} />
      ))}
      
      <FilterPanel />
      <EnvelopePanel />
    </div>
  );
};