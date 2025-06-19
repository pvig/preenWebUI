import React from 'react';
import styled from 'styled-components';

const VisualizationSVG = styled.svg`
  width: 100%;
  height: 120px;
  background: #1a202c;
  border-radius: 6px;
`;

interface AlgorithmVisualizationProps {
  algorithm: {
    operatorCount: number;
    ops: Array<{
      id: number;
      type: 'carrier' | 'modulator';
      modulators: number[];
    }>;
  };
}

export const AlgorithmVisualization: React.FC<AlgorithmVisualizationProps> = ({ algorithm }) => {
  // Positionnement dynamique basé sur le nombre d'opérateurs
  const getOperatorPosition = (opId: number) => {
    const positions = algorithm.operatorCount === 4 
      ? [
          { x: 50, y: 30 },  // OP1
          { x: 20, y: 60 },  // OP2
          { x: 80, y: 60 },  // OP3
          { x: 50, y: 90 }   // OP4
        ]
      : [
          { x: 25, y: 20 },  // OP1
          { x: 10, y: 50 },  // OP2
          { x: 40, y: 50 },  // OP3
          { x: 70, y: 20 },  // OP4
          { x: 85, y: 50 },  // OP5
          { x: 55, y: 80 }   // OP6
        ];
    
    return positions[opId - 1] || { x: 50, y: 50 };
  };

  return (
    <VisualizationSVG viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
      {/* Connexions entre opérateurs */}
      {algorithm.ops.flatMap(op => 
        op.modulators.map(modId => {
          const from = getOperatorPosition(modId);
          const to = getOperatorPosition(op.id);
          return (
            <line
              key={`${modId}-${op.id}`}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke="#4FD1C5"
              strokeWidth="1.2"
              strokeOpacity="0.8"
            />
          );
        })
      )}
      
      {/* Cercles des opérateurs */}
      {algorithm.ops.map(op => {
        const pos = getOperatorPosition(op.id);
        return (
          <g key={op.id}>
            <circle
              cx={pos.x}
              cy={pos.y}
              r="6"
              fill={op.type === 'carrier' ? "#68D391" : "#63B3ED"}
              stroke="#2D3748"
              strokeWidth="1.5"
            />
            <text
              x={pos.x}
              y={pos.y + 4}
              textAnchor="middle"
              fill="white"
              fontSize="6"
              fontWeight="bold"
              pointerEvents="none"
            >
              {op.id}
            </text>
          </g>
        );
      })}
    </VisualizationSVG>
  );
};
export default AlgorithmVisualization;