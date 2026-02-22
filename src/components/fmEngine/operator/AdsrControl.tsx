import * as d3 from 'd3';
import React, { useEffect, useRef, useState } from 'react';
import { useOperatorEnvelope, updateADSR } from '../../../stores/patchStore';
import { type AdsrState, type CurveType } from '../../../types/adsr';

interface AdsrControlProps {
  operatorId: number;
}

const AdsrControl: React.FC<AdsrControlProps> = ({ operatorId }) => {
  //Console.log("AdsrControl", operatorId);
  const envelope = useOperatorEnvelope(operatorId);
  //console.log("envelope", envelope);

  if (!envelope) return null;

  const svgRef = useRef<SVGSVGElement>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [hoverInfo, setHoverInfo] = useState<{ key: string; time: number; level: number } | null>(null);
  const margin = { top: 20, right: 20, bottom: 10, left: 30 };
  const width = 250 - margin.left - margin.right;
  const height = 120 - margin.top - margin.bottom;

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

    fullPath.push(...generateCurvePoints(points[0], points[1], envelope.curves?.attack || 'linear'));
    fullPath.push(...generateCurvePoints(points[1], points[2], envelope.curves?.decay || 'linear').slice(1));
    fullPath.push(...generateCurvePoints(points[2], points[3], envelope.curves?.sustain || 'linear').slice(1));
    fullPath.push(...generateCurvePoints(points[3], points[4], envelope.curves?.release || 'linear').slice(1));

    return fullPath;
  };

  // Contraint les positions X en fonction des autres points actuels
  // Chaque segment (différence entre deux points consécutifs) est limité à 16
  const constrainXPosition = (key: string, newX: number): number => {
    const [, attack, decay, sustain, release] = currentPoints.current;

    switch (key) {
      case 'attack':
        // Attack segment: 0 à 16 max, et doit rester avant decay
        return Math.max(0, Math.min(newX, 16, decay.x));
      case 'decay':
        // Decay segment: attack à attack+16 max, et doit rester avant sustain
        return Math.max(attack.x, Math.min(newX, attack.x + 16, sustain.x));
      case 'sustain':
        // Sustain segment: decay à decay+16 max, et doit rester avant release
        return Math.max(decay.x, Math.min(newX, decay.x + 16, release.x));
      case 'release':
        // Release segment: sustain à sustain+16 max
        return Math.max(sustain.x, Math.min(newX, sustain.x + 16));
      default:
        return newX;
    }
  };

  // Initialise et met à jour les points
  useEffect(() => {
    currentPoints.current = [
      { x: 0, y: 0 },
      { x: envelope.attack.time, y: envelope.attack.level },
      { x: envelope.decay.time, y: envelope.decay.level },
      { x: envelope.sustain.time, y: envelope.sustain.level },
      { x: envelope.release.time, y: envelope.release.level }
    ];
  }, [envelope]);

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

    // L'échelle X s'adapte à la durée réelle de l'enveloppe
    // Pas de limite max puisque les temps sont cumulatifs (peut aller jusqu'à 64)
    const maxTime = Math.max(envelope.release.time, 1);
    const xScale = d3.scaleLinear().domain([0, maxTime]).range([0, width]);
    const yScale = d3.scaleLinear().domain([100, 0]).range([0, height]);

    // Quadrillage adaptatif pour l'axe Y (levels)
    g.append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft(yScale).ticks(5).tickSize(-width).tickFormat(null))
      .selectAll('.tick line')
      .attr('stroke', '#666')
      .attr('stroke-dasharray', '2,2');

    // Quadrillage adaptatif : nombre de lignes proportionnel à maxTime
    // maxTime=1 → ~1 tick, maxTime=16 → 16 ticks
    const numTicks = Math.ceil(maxTime);
    g.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale).ticks(numTicks).tickSize(-height).tickFormat(null))
      .selectAll('.tick line')
      .attr('stroke', '#666')
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
        setHoverInfo(null); // Cacher le tooltip hover pendant le drag

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
        // Pas de limite supérieure absolue (les temps cumulatifs peuvent aller jusqu'à 64)
        const constrainedX = Math.max(0, newX);
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


      })
      .on('end', function () {
        setDragging(null);
        dragOffset.current = null;
        const key = d3.select(this).attr('data-key');
        d3.select(this).attr('fill', pointColors[key as keyof typeof pointColors]);


        const updates: Partial<AdsrState> = {};
        if (key === 'attack') {
          updates.attack = { time: currentPoints.current[1].x, level: currentPoints.current[1].y };
        }
        if (key === 'decay') {
          updates.decay = { time: currentPoints.current[2].x, level: currentPoints.current[2].y };
        }
        if (key === 'sustain') {
          updates.sustain = { time: currentPoints.current[3].x, level: currentPoints.current[3].y };
        }
        if (key === 'release') {
          updates.release = { time: currentPoints.current[4].x, level: currentPoints.current[4].y };
        }
        
        // Notification du changement
        requestAnimationFrame(() => {
          updateADSR(operatorId, updates);
        });
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
        .on('mouseover', function() {
          const point = currentPoints.current[i + 1];
          setHoverInfo({ key, time: point.x, level: point.y });
          d3.select(this).attr('r', 10); // Agrandir au survol
        })
        .on('mouseout', function() {
          if (!dragging) {
            setHoverInfo(null);
            d3.select(this).attr('r', 8); // Taille normale
          }
        })
        .call(dragHandler);
    });

  }, [envelope]); // Rafraîchir quand n'importe quelle valeur change

  return (
    <div>
      <svg ref={svgRef} className="adsr w-full h-full" />
      {/* Tooltip pendant le drag */}
      {dragging && (
        <div className="tooltip">
          Editing: {dragging} |
          Time: {(
            dragging === 'attack' ? envelope.attack.time :
              dragging === 'decay' ? envelope.decay.time :
                dragging === 'sustain' ? envelope.sustain.time : envelope.release.time
          ).toFixed(1)} |
          Level: {Math.round(
            dragging === 'attack' ? envelope.attack.level :
              dragging === 'decay' ? envelope.decay.level :
                dragging === 'sustain' ? envelope.sustain.level : envelope.release.level
          )}%
        </div>
      )}
      {/* Tooltip au survol */}
      {!dragging && hoverInfo && (
        <div style={{
          position: 'absolute',
          top: '5px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          pointerEvents: 'none',
          zIndex: 1000
        }}>
          {hoverInfo.key.charAt(0).toUpperCase() + hoverInfo.key.slice(1)} - 
          Time: {hoverInfo.time.toFixed(1)} | 
          Level: {hoverInfo.level.toFixed(1)}%
        </div>
      )}
    </div>
  );
}

export default React.memo(AdsrControl);