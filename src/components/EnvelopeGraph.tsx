// src/components/EnvelopeGraph.jsx
import * as d3 from 'd3';
import { useEffect, useRef } from 'react';

export const EnvelopeGraph = ({ adsr }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!adsr) return;
    
    const svg = d3.select(svgRef.current);
    const width = 200, height = 100;
    
    // Exemple simplifié (à adapter avec les vraies valeurs ADSR)
    const points = [
      [0, height],
      [adsr.attack * width, 0],
      [adsr.decay * width, adsr.sustain * height],
      [width, height]
    ];

    const line = d3.line();
    svg.selectAll('*').remove();
    svg.append('path')
      .attr('d', line(points))
      .attr('stroke', 'white')
      .attr('fill', 'none');
  }, [adsr]);

  return <svg ref={svgRef} width={200} height={100} />;
};