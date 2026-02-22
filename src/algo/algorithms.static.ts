// Structures de données statiques pour les algorithmes PreenFM3
// Basé sur Voice.cpp: https://github.com/Ixox/preenfm3/blob/master/firmware/Src/synth/Voice.cpp

export type AlgoNodeType = "CARRIER" | "MODULATOR";

export type AlgoNode = {
  id: string;
  type: AlgoNodeType;
  label: string;
  x: number;
  y: number;
};

export type AlgoEdge = {
  from: string;
  to: string;
  kind?: "modulation" | "sync"; // Type de liaison : modulation (défaut) ou synchronisation
};

export type AlgoDiagram = {
  id: string;
  name: string;
  nodes: AlgoNode[];
  edges: AlgoEdge[];
  ascii?: string;
};

// Import tous les 32 algorithmes PreenFM3
import { ALL_PREENFM_ALGORITHMS } from './allAlgorithms';

export const ALGO_DIAGRAMS: ReadonlyArray<AlgoDiagram> = ALL_PREENFM_ALGORITHMS;
