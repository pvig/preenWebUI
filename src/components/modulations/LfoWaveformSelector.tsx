import React from 'react';
import styled from 'styled-components';
import { LfoType, LFO_TYPE_LABELS, LFO_TYPES } from '../../types/lfo';

const SelectorContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const WaveformVisualization = styled.div`
  flex: 1;
  background: #1a202c;
  border: 1px solid #2d3748;
  border-radius: 6px;
  padding: 12px;
  min-height: 80px;
  display: flex;
  align-items: center;
`;

const WaveformCanvas = styled.svg`
  width: 100%;
  height: 60px;
`;

const Select = styled.select`
  background: #4a5568;
  border: 1px solid #2d3748;
  border-radius: 4px;
  color: #e2e8f0;
  padding: 8px 12px;
  font-size: 0.875rem;
  min-width: 140px;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #63b3ed;
  }
  
  &:hover {
    background: #5a6578;
  }
`;

interface LfoWaveformSelectorProps {
  value: LfoType;
  onChange: (type: LfoType) => void;
}

/**
 * Génère les points pour visualiser une forme d'onde LFO
 * Basé sur le firmware PreenFM3 LfoOsc.cpp
 */
const generateWaveformPath = (type: LfoType, width: number = 200, height: number = 60): string => {
  const points: number[] = [];
  const numPoints = 200;
  const centerY = height / 2;
  const amplitude = height * 0.4;
  
  for (let i = 0; i < numPoints; i++) {
    const t = i / numPoints;
    const x = t * width;
    let y: number;
    
    switch (type) {
      case 'LFO_SIN':
        // Sinusoïde standard
        y = centerY - Math.sin(t * Math.PI * 2) * amplitude;
        break;
        
      case 'LFO_SAW':
        // Dent de scie descendante
        y = centerY - (1 - (t * 2 % 2)) * amplitude;
        break;
        
      case 'LFO_TRIANGLE':
        // Triangle
        const trianglePhase = (t * 2) % 2;
        y = centerY - (trianglePhase < 1 ? trianglePhase : 2 - trianglePhase) * 2 * amplitude + amplitude;
        break;
        
      case 'LFO_SQUARE':
        // Carré
        y = centerY - (Math.sin(t * Math.PI * 2) >= 0 ? 1 : -1) * amplitude;
        break;
        
      case 'LFO_RANDOM':
        // Sample & Hold aléatoire (changement tous les 10%)
        const randomIndex = Math.floor(t * 10);
        const randomSeed = randomIndex * 12345; // Pseudo-random déterministe
        y = centerY - (Math.sin(randomSeed) * amplitude);
        break;
        
      case 'LFO_BROWNIAN':
        // Sample & Hold aléatoire (changement tous les 10%)
        const randomIndex2 = 1 + Math.floor(t * 8);
        y = centerY - (Math.sin(randomIndex2) * amplitude);
        break;
        
      case 'LFO_WANDERING':
        // Wandering (mouvement organique lent)
        const wander = Math.sin(t * Math.PI * 2) * Math.cos(t * Math.PI * 4);
        y = centerY - wander * amplitude;
        break;
        
      case 'LFO_FLOW':
        // Flow (combinaison de sinusoïdes)
        const flow = Math.sin(t * Math.PI * 2) * 0.6 + Math.sin(t * Math.PI * 6) * 0.4;
        y = centerY - flow * amplitude;
        break;
        
      default:
        y = centerY;
    }
    
    points.push(x, y);
  }
  
  // Créer le path SVG
  let path = `M ${points[0]} ${points[1]}`;
  for (let i = 2; i < points.length; i += 2) {
    path += ` L ${points[i]} ${points[i + 1]}`;
  }
  
  return path;
};

const LfoWaveformSelector: React.FC<LfoWaveformSelectorProps> = ({ value, onChange }) => {
  const path = generateWaveformPath(value);
  
  return (
    <SelectorContainer>
      <WaveformVisualization>
        <WaveformCanvas viewBox="0 0 200 60" preserveAspectRatio="none">
          <path
            d={path}
            fill="none"
            stroke="#63b3ed"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </WaveformCanvas>
      </WaveformVisualization>
      
      <Select value={value} onChange={(e) => onChange(e.target.value as LfoType)}>
        {LFO_TYPES.map((type) => (
          <option key={type} value={type}>
            {LFO_TYPE_LABELS[type]}
          </option>
        ))}
      </Select>
    </SelectorContainer>
  );
};

export default LfoWaveformSelector;
