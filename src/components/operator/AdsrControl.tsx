import * as d3 from 'd3';
import React, { useEffect, useRef, useState } from 'react';
import { usePatchStore } from '../../stores/patchStore';

import { type AdsrState, type CurveType } from '../../types/adsr';

interface AdsrControlProps {
  operatorNumber: number;
}

export function AdsrControl({ operatorNumber }: AdsrControlProps) {
  const { operators, updateAdsr } = usePatchStore();
  //console.log("operators", operatorNumber);
  const adsr = operators[`op${operatorNumber}` as keyof typeof operators].env;
  
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const margin = { top: 20, right: 20, bottom: 30, left: 30 };
  const width = 300 - margin.left - margin.right;
  const height = 150 - margin.top - margin.bottom;

  // Références pour les éléments D3
  const lineRef = useRef<d3.Selection<SVGPathElement, Point[], null, undefined> | null>(null);
  const circlesRef = useRef<{ [key: string]: d3.Selection<SVGCircleElement, Point, null, undefined> }>({});

  // Stocke les positions actuelles avec leur contrainte
  const currentPoints = useRef<Point[]>([]);
  const dragOffset = useRef<{ x: number, y: number } | null>(null);

  // Couleurs distinctes pour chaque point
  const pointColors = {
    attack: '#FF6B6B', // Rouge
    decay: '#48BB78',  // Vert
    sustain: '#4299E1', // Bleu
    release: '#F6AD55' // Orange
  };

  type Point = { x: number; y: number };

  // Génère les points intermédiaires selon le type de courbe
  const generateCurvePoints = (start: Point, end: Point, curveType: CurveType, numPoints = 20): Point[] => {
    const points: Point[] = [];

    for (let i = 0; i <= numPoints; i++) {
      const t = i / numPoints;
      let factor: number;

      switch (curveType) {
        case 'exponential':
          factor = t === 0 ? 0 : Math.pow(2, 10 * (t - 1));
          break;
        case 'logarithmic':
          factor = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
          break;
        case 'user':
          factor = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
          break;
        default: // 'linear'
          factor = t;
      }

      points.push({
        x: start.x + (end.x - start.x) * t,
        y: start.y + (end.y - start.y) * factor
      });
    }

    return points;
  };

  // Construit le chemin complet de l'enveloppe
  const generateFullPath = (points: Point[]): Point[] => {
    const fullPath: Point[] = [];

    fullPath.push(...generateCurvePoints(points[0], points[1], adsr.curves?.attack || 'linear'));
    fullPath.push(...generateCurvePoints(points[1], points[2], adsr.curves?.decay || 'linear').slice(1));
    fullPath.push(...generateCurvePoints(points[2], points[3], 'linear').slice(1));
    fullPath.push(...generateCurvePoints(points[3], points[4], adsr.curves?.release || 'linear').slice(1));

    return fullPath;
  };

  // Contraint les positions X en fonction des autres points actuels
  const constrainXPosition = (key: string, newX: number): number => {
    const [start, attack, decay, sustain, release] = currentPoints.current;

    switch (key) {
      case 'attack':
        return Math.min(newX, decay.x);
      case 'decay':
        return Math.max(attack.x, Math.min(sustain.x, newX));
      case 'sustain':
        return Math.max(decay.x, Math.min(release.x, newX));
      case 'release':
        return Math.max(sustain.x, newX);
      default:
        return newX;
    }
  };

  // Initialise et met à jour les points
  useEffect(() => {
    currentPoints.current = [
      { x: 0, y: 0 },
      { x: adsr.attack.time, y: adsr.attack.level },
      { x: adsr.decay.time, y: adsr.decay.level },
      { x: adsr.sustain.time, y: adsr.sustain.level },
      { x: adsr.release.time, y: adsr.release.level }
    ];
  }, [adsr]);

  // Gestion du rendu D3
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

    // Ajout de la grille
    g.append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft(yScale).tickSize(-width).tickFormat(''))
      .selectAll('.tick line')
      .attr('stroke', '#E2E8F0')
      .attr('stroke-dasharray', '2,2');

    g.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale).tickSize(-height).tickFormat(''))
      .selectAll('.tick line')
      .attr('stroke', '#E2E8F0')
      .attr('stroke-dasharray', '2,2');

    const lineGenerator = d3.line<Point>()
      .x(d => xScale(d.x))
      .y(d => yScale(d.y));

    // Dessin de la ligne
    lineRef.current = g.append('path')
      .datum(generateFullPath(currentPoints.current))
      .attr('d', lineGenerator)
      .attr('stroke', '#4f46e5')
      .attr('stroke-width', 2)
      .attr('fill', 'none');

    // Gestion du drag
    const dragHandler = d3.drag<SVGCircleElement, Point, Point>()
      .on('start', function (event) {
        const key = d3.select(this).attr('data-key');
        setDragging(key);

        const pointIndex = ['attack', 'decay', 'sustain', 'release'].indexOf(key) + 1;
        const point = currentPoints.current[pointIndex];
        const mouseX = xScale.invert(event.x);
        const mouseY = yScale.invert(event.y);
        dragOffset.current = {
          x: mouseX - point.x,
          y: mouseY - point.y
        };

        d3.select(this).attr('fill', '#F56565');
      })
      .on('drag', function (event) {
        const key = d3.select(this).attr('data-key');
        if (!dragOffset.current) return;

        let newX = xScale.invert(event.x) - dragOffset.current.x;
        const newY = yScale.invert(event.y) - dragOffset.current.y;

        // Application des contraintes
        newX = constrainXPosition(key, newX);
        const constrainedX = Math.max(0, Math.min(100, newX));
        const constrainedY = Math.max(0, Math.min(100, newY));

        // Mise à jour des points
        const pointIndex = ['attack', 'decay', 'sustain', 'release'].indexOf(key) + 1;
        currentPoints.current[pointIndex] = { x: constrainedX, y: constrainedY };

        // Mise à jour visuelle
        d3.select(this)
          .attr('cx', xScale(constrainedX))
          .attr('cy', yScale(constrainedY));

        lineRef.current?.datum(generateFullPath(currentPoints.current)).attr('d', lineGenerator);

        // Préparation des nouvelles valeurs
        const updates: Partial<AdsrState> = {};
        if (key === 'attack') updates.attack = { time: constrainedX, level: constrainedY };
        if (key === 'decay') updates.decay = { time: constrainedX, level: constrainedY };
        if (key === 'sustain') updates.sustain = { time: constrainedX, level: constrainedY };
        if (key === 'release') updates.release = { time: constrainedX, level: constrainedY };

        // Notification du changement
        requestAnimationFrame(() => {
          updateAdsr(operatorNumber, updates);
        });
      })
      .on('end', function () {
        setDragging(null);
        dragOffset.current = null;
        const key = d3.select(this).attr('data-key');
        d3.select(this).attr('fill', pointColors[key as keyof typeof pointColors]);
      });

    // Création des points interactifs
    circlesRef.current = {};
    ['attack', 'decay', 'sustain', 'release'].forEach((key, i) => {
      circlesRef.current[key] = g.append('circle')
        .datum(currentPoints.current[i + 1])
        .attr('cx', d => xScale(d.x))
        .attr('cy', d => yScale(d.y))
        .attr('r', 8)
        .attr('fill', pointColors[key as keyof typeof pointColors])
        .attr('stroke', 'white')
        .attr('stroke-width', 2)
        .attr('cursor', 'pointer')
        .attr('data-key', key)
        .call(dragHandler);
    });

  }, [adsr.curves]); // Seulement si les courbes changent

  return (
    <div>
      <svg ref={svgRef} className="w-full h-full" />
      {dragging && (
        <div className="tooltip">
          Editing: {dragging} |
          Time: {Math.round(
            dragging === 'attack' ? adsr.attack.time :
              dragging === 'decay' ? adsr.decay.time :
                dragging === 'sustain' ? adsr.sustain.time : adsr.release.time
          )}% |
          Level: {Math.round(
            dragging === 'attack' ? adsr.attack.level :
              dragging === 'decay' ? adsr.decay.level :
                dragging === 'sustain' ? adsr.sustain.level : adsr.release.level
          )}%
        </div>
      )}
    </div>
  );
}

export default React.memo(AdsrControl);