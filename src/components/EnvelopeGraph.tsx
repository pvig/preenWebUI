import * as d3 from 'd3';
import { useEffect, useRef, useState } from 'react';

type CurveType = 'linear' | 'exponential' | 'logarithmic' | 'user';

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
  curves?: {
    attack: CurveType;
    decay: CurveType;
    release: CurveType;
  };
}

export interface AdsrProps extends AdsrValues {
  onChange: (adsr: AdsrValues) => void;
}

function EnvelopeGraph({
  attack,
  decay,
  sustain,
  release,
  curves = {
    attack: 'linear',
    decay: 'linear',
    release: 'linear'
  },
  onChange,
}: AdsrProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const margin = { top: 20, right: 20, bottom: 30, left: 30 };
  const width = 300 - margin.left - margin.right;
  const height = 150 - margin.top - margin.bottom;

  // Stocke les valeurs actuelles pour les contraintes
  const currentValues = useRef<AdsrValues>({ attack, decay, sustain, release, curves });
  const currentPoints = useRef<Point[]>([]);
  const dragOffset = useRef<{ x: number, y: number } | null>(null);

  const lineRef = useRef<d3.Selection<SVGPathElement, Point[], null, undefined> | null>(null);
  const circlesRef = useRef<{ [key: string]: d3.Selection<SVGCircleElement, Point, null, undefined> }>({});

  // Couleurs distinctives
  const pointColors = {
    attack: '#FF6B6B',
    decay: '#48BB78',
    sustain: '#4299E1',
    release: '#F6AD55'
  };

  // Génération des courbes
  const generateCurvePoints = (start: Point, end: Point, curveType: CurveType): Point[] => {
    const points: Point[] = [];
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      let factor = t;

      if (curveType === 'exponential') factor = t === 0 ? 0 : Math.pow(2, 10 * (t - 1));
      if (curveType === 'logarithmic') factor = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      if (curveType === 'user') factor = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

      points.push({
        x: start.x + (end.x - start.x) * t,
        y: start.y + (end.y - start.y) * factor
      });
    }
    return points;
  };

  // Construction du chemin complet
  const generateFullPath = (points: Point[]): Point[] => {
    return [
      ...generateCurvePoints(points[0], points[1], currentValues.current.curves?.attack || 'linear'),
      ...generateCurvePoints(points[1], points[2], currentValues.current.curves?.decay || 'linear').slice(1),
      ...generateCurvePoints(points[2], points[3], 'linear').slice(1),
      ...generateCurvePoints(points[3], points[4], currentValues.current.curves?.release || 'linear').slice(1)
    ];
  };

  // Contraintes strictes sur l'axe X
  const constrainPoint = (key: string, newX: number): number => {
    const { attack, decay, sustain, release } = currentValues.current;

    switch (key) {
      case 'attack': return Math.min(Math.max(0, newX), decay.time);
      case 'decay': return Math.max(attack.time, Math.min(sustain.time, newX));
      case 'sustain': return Math.max(decay.time, Math.min(release.time, newX));
      case 'release': return Math.max(sustain.time, Math.min(100, newX));
      default: return newX;
    }
  };

  // État pour les valeurs en cours d'édition
  const [liveValues, setLiveValues] = useState<{
    time: number;
    level: number;
    point: string;
  } | null>(null);

  // Fonction pour mettre à jour les valeurs en direct
  const updateLiveValues = (point: string, time: number, level: number) => {
    setLiveValues({
      point,
      time: Math.round(time),
      level: Math.round(level)
    });
  };

  // Met à jour l'état local et notifie le parent
  const handleParamChange = (key: string, time: number, level: number) => {
    // Met à jour les valeurs courantes
    currentValues.current = {
      ...currentValues.current,
      attack: key === 'attack' ? { time, level } : currentValues.current.attack,
      decay: key === 'decay' ? { time, level } : currentValues.current.decay,
      sustain: key === 'sustain' ? { time, level } : currentValues.current.sustain,
      release: key === 'release' ? { time, level } : currentValues.current.release
    };

    // Met à jour les points
    currentPoints.current = [
      { x: 0, y: 0 },
      { x: currentValues.current.attack.time, y: currentValues.current.attack.level },
      { x: currentValues.current.decay.time, y: currentValues.current.decay.level },
      { x: currentValues.current.sustain.time, y: currentValues.current.sustain.level },
      { x: currentValues.current.release.time, y: currentValues.current.release.level }
    ];

    // Notifie le composant parent via les deux méthodes
    onChange(currentValues.current);
    //updateParam(`env.${key}.time`, time);
    //updateParam(`env.${key}.level`, level);
  };

  // Initialisation et mise à jour
  useEffect(() => {
    currentValues.current = { attack, decay, sustain, release, curves };
    currentPoints.current = [
      { x: 0, y: 0 },
      { x: attack.time, y: attack.level },
      { x: decay.time, y: decay.level },
      { x: sustain.time, y: sustain.level },
      { x: release.time, y: release.level }
    ];
  }, [attack, decay, sustain, release, curves]);

  // Rendering D3
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

    // Grille d'arrière-plan
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

    lineRef.current = g.append('path')
      .datum(generateFullPath(currentPoints.current))
      .attr('d', lineGenerator)
      .attr('stroke', '#4f46e5')
      .attr('stroke-width', 2)
      .attr('fill', 'none');

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
        updateLiveValues(key, point.x, point.y);
      })
      .on('drag', function (event) {
        const key = d3.select(this).attr('data-key');
        if (!dragOffset.current) return;

        let newX = xScale.invert(event.x) - dragOffset.current.x;
        const newY = yScale.invert(event.y) - dragOffset.current.y;

        // Applique les contraintes
        newX = constrainPoint(key, newX);
        const constrainedX = Math.max(0, Math.min(100, newX));
        const constrainedY = Math.max(0, Math.min(100, newY));

        // Mise à jour des valeurs en direct avant le rendu
        updateLiveValues(key, newX, newY);

        // Met à jour l'affichage
        const pointIndex = ['attack', 'decay', 'sustain', 'release'].indexOf(key) + 1;
        currentPoints.current[pointIndex] = { x: constrainedX, y: constrainedY };

        d3.select(this)
          .attr('cx', xScale(constrainedX))
          .attr('cy', yScale(constrainedY));

        lineRef.current?.datum(generateFullPath(currentPoints.current)).attr('d', lineGenerator);

        // Notifie le parent
        handleParamChange(key, constrainedX, constrainedY);
      })
      .on('end', function () {
        setDragging(null);
        const key = d3.select(this).attr('data-key');
        d3.select(this).attr('fill', pointColors[key as keyof typeof pointColors]);
      });

    // Crée les points interactifs
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

  }, [curves]);

  return (
    <div className="relative">
      <svg ref={svgRef} className="w-full h-full" />
      {dragging && (
        <div className="tooltip">
          Editing: {dragging} |
          Time: {Math.round(
            dragging === 'attack' ? currentValues.current.attack.time :
              dragging === 'decay' ? currentValues.current.decay.time :
                dragging === 'sustain' ? currentValues.current.sustain.time :
                  currentValues.current.release.time
          )}% |
          Level: {Math.round(
            dragging === 'attack' ? currentValues.current.attack.level :
              dragging === 'decay' ? currentValues.current.decay.level :
                dragging === 'sustain' ? currentValues.current.sustain.level :
                  currentValues.current.release.level
          )}%
        </div>
      )}
    </div>
  );


}

export default EnvelopeGraph;