import { useEffect, useRef } from 'react';
import styled from 'styled-components';
import type { Algorithm } from '../../types/patch';
import { ALGO_DIAGRAMS } from '../../algo/algorithms.static';
import { renderAlgoSvg } from '../../algo/renderAlgoSvg';
import { useFMSynthContext } from './FMSynthContext';

const VisualizationContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    max-width: 100%;
    max-height: 100%;
  }
`;

interface AlgorithmVisualizationProps {
  algorithm: Algorithm;
}

export const AlgorithmVisualization = ({ algorithm }: AlgorithmVisualizationProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { highlightedLink } = useFMSynthContext();

  useEffect(() => {
    if (!containerRef.current) return;

    const diagram = ALGO_DIAGRAMS.find(d => d.id === String(algorithm.id));
    
    if (!diagram) {
      containerRef.current.innerHTML = `<p style="color: #cbd5e0;">Algorithm ${algorithm.id} not found</p>`;
      return;
    }

    const svg = renderAlgoSvg(diagram, { cell: 56, margin: 16, highlightedLink });
    containerRef.current.innerHTML = svg;
  }, [algorithm.id, highlightedLink]);

  return <VisualizationContainer ref={containerRef} />;
};

export default AlgorithmVisualization;