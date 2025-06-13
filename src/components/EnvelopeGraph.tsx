import * as d3 from 'd3';
import { useEffect, useRef, useState } from 'react';

interface Point {
  x: number;
  y: number;
}

interface AdsrPoint {
  level: number;
  time: number;
}

interface AdsrValues {
  attack: AdsrPoint;
  decay: AdsrPoint;
  sustain: AdsrPoint;
  release: AdsrPoint;
}

export interface AdsrProps extends AdsrValues {
  onChange: (adsr: AdsrValues) => void;
}

function EnvelopeGraph({ attack, decay, sustain, release, onChange }: AdsrProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const margin = { top: 20, right: 20, bottom: 30, left: 30 };
  const width = 300 - margin.left - margin.right;
  const height = 150 - margin.top - margin.bottom;

  // Stocke les positions actuelles des points
  const currentPoints = useRef<Point[]>([]);
  const dragOffset = useRef<{x: number, y: number} | null>(null);

  const lineRef = useRef<d3.Selection<SVGPathElement, Point[], null, undefined> | null>(null);
  const circlesRef = useRef<{[key: string]: d3.Selection<SVGCircleElement, Point, null, undefined>}>({});

  // Mise à jour des points courants quand les props changent
  useEffect(() => {
    currentPoints.current = [
      { x: 0, y: 0 },
      { x: attack.time, y: attack.level },
      { x: decay.time, y: decay.level },
      { x: sustain.time, y: sustain.level },
      { x: release.time, y: release.level }
    ];
  }, [attack, decay, sustain, release]);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const g = svg
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleLinear().domain([0, 100]).range([0, width]);
    const yScale = d3.scaleLinear().domain([100, 0]).range([0, height]);

    const lineGenerator = d3.line<Point>()
      .x(d => xScale(d.x))
      .y(d => yScale(d.y))
      .curve(d3.curveMonotoneX);

    lineRef.current = g.append('path')
      .datum(currentPoints.current)
      .attr('d', lineGenerator)
      .attr('stroke', '#4f46e5')
      .attr('stroke-width', 2)
      .attr('fill', 'none');

    const constrainPoints = (updated: AdsrValues): AdsrValues => {
      const constrained = { ...updated };
      
      if (constrained.attack.time >= constrained.decay.time) {
        constrained.decay.time = constrained.attack.time + 5;
      }
      
      if (constrained.decay.time >= constrained.sustain.time) {
        constrained.sustain.time = constrained.decay.time + 5;
      }
      
      if (constrained.sustain.time >= constrained.release.time) {
        constrained.release.time = constrained.sustain.time + 5;
      }
      
      return constrained;
    };

    const dragHandler = d3.drag<SVGCircleElement, Point, Point>()
      .on('start', function(event) {
        const key = d3.select(this).attr('data-key');
        setDragging(key);
        
        // Calcule le décalage avec les positions actuelles
        const pointIndex = ['attack', 'decay', 'sustain', 'release'].indexOf(key) + 1;
        const point = currentPoints.current[pointIndex];
        const mouseX = xScale.invert(event.x);
        const mouseY = yScale.invert(event.y);
        dragOffset.current = {
          x: mouseX - point.x,
          y: mouseY - point.y
        };
        
        d3.select(this).attr('fill', '#f59e0b');
      })
      .on('drag', function(event) {
        const key = d3.select(this).attr('data-key');
        if (!dragOffset.current) return;

        // Calcule la nouvelle position avec l'offset actuel
        const newX = Math.max(0, Math.min(100, xScale.invert(event.x) - dragOffset.current.x));
        const newY = Math.max(0, Math.min(100, yScale.invert(event.y) - dragOffset.current.y));

        // Mise à jour visuelle immédiate
        const pointIndex = ['attack', 'decay', 'sustain', 'release'].indexOf(key) + 1;
        currentPoints.current[pointIndex] = { x: newX, y: newY };
        
        d3.select(this)
          .attr('cx', xScale(newX))
          .attr('cy', yScale(newY));

        lineRef.current?.datum(currentPoints.current).attr('d', lineGenerator);

        const newValues = {
          attack: key === 'attack' ? { time: newX, level: newY } : attack,
          decay: key === 'decay' ? { time: newX, level: newY } : decay,
          sustain: key === 'sustain' ? { time: newX, level: newY } : sustain,
          release: key === 'release' ? { time: newX, level: newY } : release
        };

        requestAnimationFrame(() => {
          onChange(constrainPoints(newValues));
        });
      })
      .on('end', function() {
        setDragging(null);
        dragOffset.current = null;
        d3.select(this).attr('fill', '#10b981');
      });

    circlesRef.current = {};
    ['attack', 'decay', 'sustain', 'release'].forEach((key, i) => {
      circlesRef.current[key] = g.append('circle')
        .datum(currentPoints.current[i + 1])
        .attr('cx', d => xScale(d.x))
        .attr('cy', d => yScale(d.y))
        .attr('r', 8)
        .attr('fill', '#10b981')
        .attr('stroke', 'white')
        .attr('stroke-width', 2)
        .attr('cursor', 'pointer')
        .attr('data-key', key)
        .call(dragHandler);
    });

  }, []);

  return (
    <div className="relative">
      <svg ref={svgRef} className="w-full h-full" />
      {dragging && (
        <div className="absolute top-2 left-2 bg-gray-800 text-white px-2 py-1 rounded text-xs">
          Editing: {dragging} | 
          Time: {Math.round(
            dragging === 'attack' ? attack.time :
            dragging === 'decay' ? decay.time :
            dragging === 'sustain' ? sustain.time : release.time
          )}% | 
          Level: {Math.round(
            dragging === 'attack' ? attack.level :
            dragging === 'decay' ? decay.level :
            dragging === 'sustain' ? sustain.level : release.level
          )}%
        </div>
      )}
    </div>
  );
}

export default EnvelopeGraph;