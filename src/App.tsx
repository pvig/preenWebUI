// src/App.jsx
import { useEffect, useState } from 'react';
import { usePatchStore } from './stores/patchStore.ts';
import { Knob } from './components/Knob';

export default function App() {
  const { operators, filter, updateParam } = usePatchStore();
  const [isMidiReady, setIsMidiReady] = useState(false);

  const handleOperatorChange = (opNumber, param, value) => {
    updateParam(`operators.op${opNumber}.${param}`, value);
  };

  return (
    <div className="app-container">
      <span>PreenFM3 Web Controller</span>
      
      <div className="operators-grid">
        {[1, 2, 3, 4].map((op) => (
          <div key={op} className="operator-panel">
            <h3>Operator {op}</h3>
            <Knob
              label="Frequency"
              value={operators[`op${op}`].freq}
              onChange={(v) => handleOperatorChange(op, 'freq', v)}
            />
          </div>
        ))}
      </div>

      <div className="filter-panel">
        <h3>Filter</h3>
        <Knob
          label="Cutoff"
          value={filter.cutoff}
          onChange={(v) => updateParam('filter.cutoff', v)}
        />
      </div>
    </div>
  );
}