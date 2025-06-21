import React from 'react';
import styled from 'styled-components';

const VisualizationSVG = styled.svg`
  width: 100%;
  height: 100px;
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
  const getPosition = (opId: number) => {
    // Positionnement spécifique pour correspondre au PreenFM
    const positions = algorithm.operatorCount === 4
      ? [
          { x: 50, y: 30 },  // OP1 (en haut)
          { x: 25, y: 70 },  // OP2 (bas gauche)
          { x: 75, y: 70 },  // OP3 (bas droit)
          { x: 50, y: 90 }   // OP4 (tout en bas)
        ]
      : [
          { x: 50, y: 20 },  // OP1 (en haut)
          { x: 20, y: 50 },  // OP2 (milieu gauche)
          { x: 50, y: 50 },  // OP3 (centre)
          { x: 80, y: 50 },  // OP4 (milieu droit)
          { x: 30, y: 80 },  // OP5 (bas gauche)
          { x: 70, y: 80 }   // OP6 (bas droit)
        ];

    return positions[opId - 1] || { x: 50, y: 50 };
  };

  return (
    <VisualizationSVG viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
      {/* Connexions */}
      {algorithm.ops.map(op => 
        op.modulators.map(modId => {
          const from = getPosition(modId);
          const to = getPosition(op.id);
          return (
            <line
              key={`${modId}-${op.id}`}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke="#4FD1C5"
              strokeWidth="1.5"
              strokeOpacity="0.7"
            />
          );
        })
      )}
      
      {/* Opérateurs */}
      {algorithm.ops.map(op => {
        const pos = getPosition(op.id);
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