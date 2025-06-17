import React, { useState } from 'react';
import styled from 'styled-components';

// Exemple d'algorithmes mixant 4 et 6 opérateurs
const ALGORITHMS = [
  // Algo 6 opérateurs (style DX7)
  {
    id: 1,
    name: "6OP-A",
    operatorCount: 6,
    ops: [
      { id: 1, carriers: [], modulators: [
        { id: 2, amount: 75 }, 
        { id: 3, amount: 60 },
        { id: 4, amount: 45 }
      ]},
      { id: 2, carriers: [], modulators: [] },
      { id: 3, carriers: [], modulators: [] },
      { id: 4, carriers: [{ id: 1, amount: 100 }], modulators: [] },
      { id: 5, carriers: [], modulators: [{ id: 6, amount: 80 }] },
      { id: 6, carriers: [{ id: 5, amount: 100 }], modulators: [] }
    ]
  },
  // Algo 3 opérateurs
  {
    id: 2,
    name: "3OP-A", 
    operatorCount: 3,
    ops: [
      { id: 1, carriers: [], modulators: [
        { id: 2, amount: 90 },
        { id: 3, amount: 50 }
      ]},
      { id: 2, carriers: [], modulators: [] },
      { id: 3, carriers: [{ id: 1, amount: 100 }], modulators: [] },
    ]
  },
  // Algo 4 opérateurs
  {
    id: 3,
    name: "4OP-A", 
    operatorCount: 4,
    ops: [
      { id: 1, carriers: [], modulators: [
        { id: 2, amount: 90 },
        { id: 3, amount: 50 }
      ]},
      { id: 2, carriers: [], modulators: [] },
      { id: 3, carriers: [{ id: 1, amount: 100 }], modulators: [{ id: 4, amount: 70 }] },
      { id: 4, carriers: [], modulators: [] }
    ]
  },
];

const ModulationLink = ({ from, to, amount }) => {
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;
  const angle = Math.atan2(to.y - from.y, to.x - from.x) * (180 / Math.PI);

  return (
    <g>
      <line
        x1={from.x}
        y1={from.y}
        x2={to.x}
        y2={to.y}
        stroke="#555"
        strokeWidth="1.5"
        markerEnd="url(#arrowhead)"
      />
      <text
        x={midX}
        y={midY}
        textAnchor="middle"
        fill="#333"
        fontSize="4"
        fontWeight="bold"
        transform={`rotate(${angle}, ${midX}, ${midY})`}
        dy={-5}
      >
        {amount}%
      </text>
    </g>
  );
};

const OperatorDisplay = ({ algorithm }) => {
  // Positionnement dynamique selon le nombre d'opérateurs
  const getOperatorPosition = (opId, totalOps) => {
    const positions = {
      3: [
        { x: 50, y: 30 },  // OP1
        { x: 30, y: 60 },  // OP2
        { x: 70, y: 60 },  // OP3
      ],
      4: [
        { x: 50, y: 30 },  // OP1
        { x: 30, y: 60 },  // OP2
        { x: 70, y: 60 },  // OP3
        { x: 50, y: 90 }   // OP4
      ],
      6: [
        { x: 30, y: 30 },  // OP1
        { x: 10, y: 60 },  // OP2
        { x: 50, y: 60 },  // OP3
        { x: 70, y: 30 },  // OP4
        { x: 30, y: 90 },  // OP5
        { x: 70, y: 90 }   // OP6
      ]
    };
    
    return positions[totalOps][opId - 1] || { x: 50, y: 50 };
  };

  return (
    <svg width="200" height="200" viewBox="0 0 100 100">
      <defs>
        <marker 
          id="arrowhead"
          markerWidth="4"
          markerHeight="4" 
          refX="3" 
          refY="2"
          orient="auto"
        >
          <polygon points="0 0, 4 2, 0 4" fill="#555" />
        </marker>
      </defs>

      {/* Connexions avec indices */}
      {algorithm.ops.map(op => 
        op.modulators.map(mod => {
          const from = getOperatorPosition(mod.id, algorithm.operatorCount);
          const to = getOperatorPosition(op.id, algorithm.operatorCount);
          return (
            <ModulationLink
              key={`${algorithm.id}-${op.id}-${mod.id}`}
              from={from}
              to={to}
              amount={mod.amount}
            />
          );
        })
      )}

      {/* Opérateurs */}
      {algorithm.ops.map(op => {
        const pos = getOperatorPosition(op.id, algorithm.operatorCount);
        return (
          <g key={`${algorithm.id}-${op.id}`}>
            <circle
              cx={pos.x}
              cy={pos.y}
              r="7"
              fill={op.carriers.length > 0 ? "#4CAF50" : "#2196F3"}
              stroke="#333"
              strokeWidth="1.5"
            />
            <text
              x={pos.x}
              y={pos.y + 3}
              textAnchor="middle"
              fill="white"
              fontSize="6"
              fontWeight="bold"
            >
              {op.id}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

export const FMAlgorithmSelector = () => {
  const [currentAlgo, setCurrentAlgo] = useState(0);

  const handlePrevious = () => {
    setCurrentAlgo(prev => (prev > 0 ? prev - 1 : ALGORITHMS.length - 1));
  };

  const handleNext = () => {
    setCurrentAlgo(prev => (prev < ALGORITHMS.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="algorithm-selector">
      <h3>{ALGORITHMS[currentAlgo].name}</h3>
      <OperatorDisplay algorithm={ALGORITHMS[currentAlgo]} />
      
      <div className="controls">
        <button onClick={handlePrevious}>-</button>
        <span>{currentAlgo + 1}/{ALGORITHMS.length}</span>
        <button onClick={handleNext}>+</button>
      </div>

      <div className="info">
        {ALGORITHMS[currentAlgo].operatorCount} opérateurs
      </div>
    </div>
  );
};

export default FMAlgorithmSelector;