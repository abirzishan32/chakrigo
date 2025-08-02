export interface DijkstraStep {
  currentNode: string;
  priorityQueue: {
    node: string;
    distance: number;
  }[];
  distances: Record<string, number>;
  previous: Record<string, string | null>;
  visited: string[];
  processingEdge?: {
    source: string;
    target: string;
    weight: number;
  };
  state: 'initial' | 'visiting' | 'relaxing-edges' | 'complete';
  targetNode?: string;
  shortestPath?: string[];
}

export interface GraphData {
  nodes: {
    id: string;
    label: string;
    x: number;
    y: number;
    size: number;
    color?: string;
  }[];
  edges: {
    id: string;
    source: string;
    target: string;
    weight: number;
    color?: string;
    label?: string;
  }[];
}