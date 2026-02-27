import React from 'react';
import styled from 'styled-components';
import type { NoteCurveType } from '../../types/patch';

const VisualizerContainer = styled.div`
  width: 100%;
  height: 120px;
  background: ${props => props.theme.colors.background};
  border-radius: 4px;
  border: 1px solid ${props => props.theme.colors.border};
  padding: 8px;
  margin-bottom: 16px;
`;

const SvgContainer = styled.svg`
  width: 100%;
  height: 100%;
`;

interface NoteCurveVisualizerProps {
  before: NoteCurveType;
  breakNote: number;
  after: NoteCurveType;
}

/**
 * Génère les points pour une courbe donnée
 * @param type Type de courbe
 * @param startNote Note de début (0-127)
 * @param endNote Note de fin (0-127)
 * @param isBeforeCurve Si true, courbe va vers le breakpoint, sinon part du breakpoint
 * @param steps Nombre de points à générer
 * @returns [note, value] où value est dans [-1, +1]
 */
function generateCurvePoints(
  type: NoteCurveType,
  startNote: number,
  endNote: number,
  isBeforeCurve: boolean,
  steps: number = 50
): [number, number][] {
  const points: [number, number][] = [];
  
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const note = startNote + (endNote - startNote) * t;
    let value: number;
    
    // Pour les courbes "before", on va de la note 0 vers le breakpoint
    // Pour les courbes "after", on part du breakpoint vers la note 127
    const progress = isBeforeCurve ? t : t;
    
    switch (type) {
      case 'Flat':
        value = 0; // Toujours neutre
        break;
        
      case 'M Lin1': // Minus Linear 1 (pente douce négative)
        value = isBeforeCurve ? -0.3 * (1 - progress) : -0.3 * progress;
        break;
        
      case 'M Lin2': // Minus Linear 2 (pente moyenne négative)
        value = isBeforeCurve ? -0.6 * (1 - progress) : -0.6 * progress;
        break;
        
      case 'M Lin3': // Minus Linear 3 (pente forte négative)
        value = isBeforeCurve ? -1.0 * (1 - progress) : -1.0 * progress;
        break;
        
      case 'M Exp1': // Minus Exponential 1
        value = isBeforeCurve ? -0.5 * Math.pow(1 - progress, 1.5) : -0.5 * (1 - Math.pow(1 - progress, 1.5));
        break;
        
      case 'M Exp2': // Minus Exponential 2
        value = isBeforeCurve ? -1.0 * Math.pow(1 - progress, 2.5) : -1.0 * (1 - Math.pow(1 - progress, 2.5));
        break;
        
      case 'P Lin1': // Plus Linear 1 (pente douce positive)
        value = isBeforeCurve ? 0.3 * (1 - progress) : 0.3 * progress;
        break;
        
      case 'P Lin2': // Plus Linear 2 (pente moyenne positive)
        value = isBeforeCurve ? 0.6 * (1 - progress) : 0.6 * progress;
        break;
        
      case 'P Lin3': // Plus Linear 3 (pente forte positive)
        value = isBeforeCurve ? 1.0 * (1 - progress) : 1.0 * progress;
        break;
        
      case 'P Exp1': // Plus Exponential 1
        value = isBeforeCurve ? 0.5 * Math.pow(1 - progress, 1.5) : 0.5 * (1 - Math.pow(1 - progress, 1.5));
        break;
        
      case 'P Exp2': // Plus Exponential 2
        value = isBeforeCurve ? 1.0 * Math.pow(1 - progress, 2.5) : 1.0 * (1 - Math.pow(1 - progress, 2.5));
        break;
        
      default:
        value = 0;
    }
    
    // Clamper entre -1 et +1
    value = Math.max(-1, Math.min(1, value));
    
    points.push([note, value]);
  }
  
  return points;
}

export const NoteCurveVisualizer: React.FC<NoteCurveVisualizerProps> = ({
  before,
  breakNote,
  after
}) => {
  const width = 300;
  const height = 100;
  const padding = 10;
  const graphWidth = width - 2 * padding;
  const graphHeight = height - 2 * padding;
  
  // Note curves varient entre -1 et +1, avec 0 comme valeur neutre
  // Générer les points pour la partie avant le break
  const beforePoints = generateCurvePoints(
    before,
    0,
    breakNote,
    true, // isBeforeCurve = true
    30
  );
  
  // Récupérer la valeur au breakpoint depuis la courbe before
  const breakValue = beforePoints.length > 0 ? beforePoints[beforePoints.length - 1][1] : 0;
  
  // Générer les points pour la partie après le break
  const afterPoints = generateCurvePoints(
    after,
    breakNote,
    127,
    false, // isBeforeCurve = false
    30
  );
  
  // Convertir les points en coordonnées SVG
  // value va de -1 à +1, avec 0 au centre
  const toSvgCoords = (note: number, value: number): [number, number] => {
    const x = padding + (note / 127) * graphWidth;
    // Convertir value de [-1, +1] vers [height-padding, padding]
    // -1 (bas) -> height-padding, 0 (centre) -> height/2, +1 (haut) -> padding
    const normalizedValue = (1 - value) / 2; // Convertir [-1,1] vers [0,1] avec inversion
    const y = padding + normalizedValue * graphHeight;
    return [x, y];
  };
  
  // Créer les chemins SVG
  const beforePath = beforePoints.map(([note, value], i) => {
    const [x, y] = toSvgCoords(note, value);
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');
  
  const afterPath = afterPoints.map(([note, value], i) => {
    const [x, y] = toSvgCoords(note, value);
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');
  
  // Position du breakpoint
  const [breakX, breakY] = toSvgCoords(breakNote, breakValue);
  
  return (
    <VisualizerContainer>
      <SvgContainer viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        {/* Ligne centrale à y=0 (neutre) */}
        <line
          x1={padding}
          y1={height / 2}
          x2={width - padding}
          y2={height / 2}
          stroke="currentColor"
          strokeOpacity="0.3"
          strokeWidth="1"
        />
        
        {/* Ligne du breakpoint */}
        <line
          x1={breakX}
          y1={padding}
          x2={breakX}
          y2={height - padding}
          stroke="currentColor"
          strokeOpacity="0.3"
          strokeDasharray="4,4"
          strokeWidth="1.5"
        />
        
        {/* Courbe avant le break */}
        <path
          d={beforePath}
          fill="none"
          stroke="#F56565"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Courbe après le break */}
        <path
          d={afterPath}
          fill="none"
          stroke="#48BB78"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Point du breakpoint */}
        <circle
          cx={breakX}
          cy={breakY}
          r="3"
          fill="currentColor"
          opacity="0.6"
        />
      </SvgContainer>
    </VisualizerContainer>
  );
};
