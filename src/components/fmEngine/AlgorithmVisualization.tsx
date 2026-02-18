import React from 'react';
import styled from 'styled-components';
import { Algorithm } from '../../types/patch';

const VisualizationSVG = styled.svg`
  width: 100%;
  height: 100px;
`;

 export const AlgorithmVisualization: React.FC<{ algorithm: Algorithm }> = ({ algorithm }) => {
    // Sécurité : si algorithm ou algorithm.ops est undefined, n'affiche rien
    if (!algorithm || !algorithm.ops) {
      return (
        <svg width="100%" height="100px" viewBox="0 0 100 100">
          <text x="10" y="50" fontSize="10" fill="red">Aucun algorithme à afficher</text>
        </svg>
      );
    }
    // Debug: affiche la liste des opérateurs reçus
    const debugText = algorithm.ops.map(op => `id:${op.id} type:${op.type}`).join(' | ');
  // Dynamically position operators in a circle
  // Positionne chaque opérateur selon l'algorithme
  const getPosition = (opId: number) => {
    const opsCount = algorithm.ops.length;
    // Cas spécial pour alg5 : 6 opérateurs (2 carriers, 4 modulateurs)
    if (opsCount === 6) {
      // Les carriers (1, 3) en bas
      if (opId === 1) return { x: 30, y: 80 };
      if (opId === 3) return { x: 70, y: 80 };
      // Les modulateurs distribués au-dessus
      if (opId === 2) return { x: 20, y: 30 };
      if (opId === 4) return { x: 50, y: 30 };
      if (opId === 5) return { x: 80, y: 30 };
      if (opId === 6) return { x: 50, y: 55 };
    }
    // Cas spécial pour alg4 : 3 opérateurs, 2 carriers et 1 modulateur
    if (opsCount === 3 && algorithm.ops.filter(op => op.type === 'CARRIER').length === 2) {
      // Identifie les rôles
      if (opId === 1) return { x: 30, y: 80 };
      if (opId === 3) return { x: 70, y: 80 };
      if (opId === 2) return { x: 50, y: 20 };
    }
    // Cas spécial pour 2 opérateurs (alg2 : deux carriers)
    if (opsCount === 2) {
      // Pour alg1 : modulateur au-dessus du carrier
      if (algorithm.ops.some(op => op.type === 'MODULATOR')) {
        // Carrier en bas, modulateur en haut
        const op = algorithm.ops.find(o => o.id === opId);
        if (op?.type === 'CARRIER') return { x: 50, y: 80 };
        else return { x: 50, y: 20 };
      } else {
        // Cas deux carriers (alg2) : alignés en bas
        return { x: 30 + 40 * algorithm.ops.map(op => op.id).indexOf(opId), y: 80 };
      }
    }
    // Cas spécial pour 3 opérateurs (chaîne)
    if (opsCount === 3) {
      // Pour alg3 : modulateur 3 en haut, modulateur 2 au centre, carrier 1 en bas
      let y = 50;
      if (opId === 3) y = 20;
      else if (opId === 2) y = 50;
      else if (opId === 1) y = 80;
      return { x: 50, y };
    }
    // Par défaut : cercle
    const idx = algorithm.ops.map(op => op.id).indexOf(opId);
    const radius = 35;
    const centerX = 50;
    const centerY = 50;
    const angle = (2 * Math.PI * idx) / opsCount;
    return {
      x: centerX + radius * Math.cos(angle - Math.PI / 2),
      y: centerY + radius * Math.sin(angle - Math.PI / 2)
    };
  };

  return (
    <VisualizationSVG viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
      {/* Debug: affiche la liste des opérateurs reçus */}
      <text x="5" y="10" fontSize="5" fill="#2D3748">{debugText}</text>
      {/* Draw connections: relie uniquement les positions des opérateurs existants */}
      {algorithm.ops?.flatMap(op =>
        op.target
          .filter(targetId => algorithm.ops.some(o => o.id === targetId))
          .map(targetId => {
            const from = getPosition(op.id);
            const to = getPosition(targetId);
            return (
              <line
                key={`conn-${op.id}-${targetId}`}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke="#4FD1C5"
                strokeWidth="2"
                strokeOpacity="0.7"
                markerEnd="url(#arrowhead)"
              />
            );
          })
      )}

      {/* Arrowhead marker definition */}
      <defs>
        <marker id="arrowhead" markerWidth="5" markerHeight="5" refX="2.5" refY="2.5" orient="auto" markerUnits="strokeWidth">
          <path d="M0,0 L5,2.5 L0,5 Z" fill="#4FD1C5" />
        </marker>
      </defs>

      {/* Draw all operators (modulateurs and carriers) - aucun doublon */}
      {algorithm.ops?.map(op => {
        const pos = getPosition(op.id);
        let color = op.type === 'CARRIER' ? "#68D391" : "#63B3ED";
        let radius = op.type === 'CARRIER' ? 10 : 7;
        return (
          <g key={op.id}>
            <circle
              cx={pos.x}
              cy={pos.y}
              r={radius}
              fill={color}
              stroke="#2D3748"
              strokeWidth="2"
            />
            <text
              x={pos.x}
              y={pos.y + 4}
              textAnchor="middle"
              fill="white"
              fontSize="7"
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