import type { AlgoDiagram } from "./algorithms.static";
import type { HighlightedLink } from "../components/fmEngine/FMSynthContext";

type RenderOptions = {
  cell?: number;
  margin?: number;
  highlightedLink?: HighlightedLink | null;
};

export function renderAlgoSvg(diagram: AlgoDiagram, opts: RenderOptions = {}): string {
  const cell = opts.cell ?? 56;
  const margin = opts.margin ?? 16;

  const maxX = Math.max(...diagram.nodes.map((n) => n.x), 0);
  const maxY = Math.max(...diagram.nodes.map((n) => n.y), 0);
  const width = margin * 2 + (maxX + 1) * cell;
  const height = margin * 2 + (maxY + 1) * cell;

  const byId = new Map(diagram.nodes.map((n) => [n.id, n]));

  const edges = diagram.edges.map((e, i) => {
    const a = byId.get(e.from)!;
    const b = byId.get(e.to)!;

    const x1 = margin + a.x * cell;
    const y1 = margin + a.y * cell;
    const x2 = margin + b.x * cell;
    const y2 = margin + b.y * cell;

    // Extraire les IDs numériques des opérateurs ("op1" -> 1)
    const sourceId = parseInt(e.from.replace(/\D/g, ''));
    const targetId = parseInt(e.to.replace(/\D/g, ''));

    // Déterminer la couleur de base selon le type de liaison
    let baseColor: string;
    if (e.kind === "sync") {
      // Synchronisation : vert
      baseColor = "#b910ab";
    } else {
      // Modulation : bleu (vers CARRIER) ou violet (vers MODULATOR)
      baseColor = b.type === "CARRIER" ? "#0ea5e9" : "#7c3aed";
    }
    
    // Vérifier si cette edge est highlighted
    const isHighlighted = opts.highlightedLink && 
      opts.highlightedLink.sourceId === sourceId && 
      opts.highlightedLink.targetId === targetId;
    
    const color = isHighlighted ? "#fbbf24" : baseColor; // Jaune quand highlighted
    const strokeWidth = isHighlighted ? 4 : 2;
    
    const imLabel = `IM${i + 1}`;
    
    // Cas spécial : feedback (self-loop) - dessiner un arc au-dessus du nœud
    if (e.from === e.to) {
      const nodeRadius = a.type === "CARRIER" ? 16 : 12;
      const loopRadius = 12;
      const loopCenterX = x1;
      const loopCenterY = y1 - nodeRadius - loopRadius;
      
      // Arc SVG pour le feedback
      const arcPath = `M ${x1} ${y1 - nodeRadius} 
                       A ${loopRadius} ${loopRadius} 0 1 1 ${x1 + 0.1} ${y1 - nodeRadius}`;
      
      return `
        <g class="edge-group feedback" data-source="${sourceId}" data-target="${targetId}">
          <path class="edge" d="${arcPath}" stroke="${color}" stroke-width="${strokeWidth}" fill="none" />
          <text x="${loopCenterX}" y="${loopCenterY - 8}" text-anchor="middle" font-size="10" font-weight="bold" fill="${isHighlighted ? '#fbbf24' : '#a0aec0'}" style="pointer-events: none;">${imLabel}</text>
        </g>
      `;
    }
    
    // Cas normal : ligne droite entre deux nœuds
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    
    return `
      <g class="edge-group" data-source="${sourceId}" data-target="${targetId}">
        <line class="edge" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${strokeWidth}" />
        <text x="${midX}" y="${midY - 6}" text-anchor="middle" font-size="10" font-weight="bold" fill="${isHighlighted ? '#fbbf24' : '#a0aec0'}" style="pointer-events: none;">${imLabel}</text>
      </g>
    `;
  });

  const nodes = diagram.nodes.map((n, i) => {
    const cx = margin + n.x * cell;
    const cy = margin + n.y * cell;
    const isCarrier = n.type === "CARRIER";
    const radius = isCarrier ? 16 : 12;
    const fillColor = isCarrier ? "#68D391" : "#63B3ED";
    return `
      <g id="node-${i}">
        <circle cx="${cx}" cy="${cy}" r="${radius}" fill="${fillColor}" stroke="#2D3748" stroke-width="2" />
        <text x="${cx}" y="${cy + 4}" text-anchor="middle" font-size="11" font-weight="bold" fill="#1a202c">${n.label}</text>
      </g>
    `;
  });

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="100%" height="100%" fill="#0b1020" />
  ${edges.join("\n")}
  ${nodes.join("\n")}
</svg>`.trim();
}
