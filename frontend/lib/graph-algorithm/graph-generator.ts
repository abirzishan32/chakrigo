import Graph from 'graphology';
import { GraphData } from '@/components/algo-visualizer/bfs/types';

// Generate a random graph
export function generateRandomGraph(
  nodeCount: number = 10,
  edgeProbability: number = 0.3
): Graph {
  const graph = new Graph();
  
  // Add nodes
  for (let i = 0; i < nodeCount; i++) {
    const nodeId = `n${i}`;
    graph.addNode(nodeId, {
      label: `Node ${i}`,
      x: Math.random(),
      y: Math.random(),
      size: 10,
      color: '#6366F1' // Indigo color
    });
  }
  
  // Add edges
  for (let i = 0; i < nodeCount; i++) {
    for (let j = 0; j < nodeCount; j++) {
      if (i !== j && Math.random() < edgeProbability) {
        const edgeId = `e${i}_${j}`;
        try {
          if (!graph.hasEdge(`n${i}`, `n${j}`)) {
            graph.addEdge(`n${i}`, `n${j}`, {
              id: edgeId,
              weight: Math.floor(Math.random() * 10) + 1,
              color: '#CBD5E1' // Slate color
            });
          }
        } catch (e) {
          // Edge may already exist
        }
      }
    }
  }
  
  return graph;
}

// Define node and edge types for better type checking
interface GraphNode {
  id: string;
  x: number;
  y: number;
  size?: number;
  color?: string;
}

interface GraphEdge {
  source: string;
  target: string;
  id?: string;
  weight?: number;
  color?: string;
}

// Generate a predefined graph for teaching purposes
export function generateTeachingGraph(): Graph {
  const graph = new Graph();
  
  // Add nodes in a structured layout with explicit type
  const nodes: GraphNode[] = [
    { id: 'A', x: 0.5, y: 0.1 },
    { id: 'B', x: 0.3, y: 0.3 },
    { id: 'C', x: 0.7, y: 0.3 },
    { id: 'D', x: 0.1, y: 0.5 },
    { id: 'E', x: 0.4, y: 0.5 },
    { id: 'F', x: 0.6, y: 0.5 },
    { id: 'G', x: 0.9, y: 0.5 },
    { id: 'H', x: 0.3, y: 0.7 },
    { id: 'I', x: 0.7, y: 0.7 },
    { id: 'J', x: 0.5, y: 0.9 }
  ];
  
  // Define edges with explicit type
  const edges: GraphEdge[] = [
    { source: 'A', target: 'B' },
    { source: 'A', target: 'C' },
    { source: 'B', target: 'D' },
    { source: 'B', target: 'E' },
    { source: 'C', target: 'F' },
    { source: 'C', target: 'G' },
    { source: 'D', target: 'H' },
    { source: 'E', target: 'H' },
    { source: 'F', target: 'I' },
    { source: 'G', target: 'I' },
    { source: 'H', target: 'J' },
    { source: 'I', target: 'J' }
  ];
  
  // Add nodes
  nodes.forEach(node => {
    graph.addNode(node.id, {
      label: `Node ${node.id}`,
      x: node.x,
      y: node.y,
      size: 15,
      color: '#6366F1' // Indigo color
    });
  });
  
  // Add edges
  edges.forEach((edge, index) => {
    graph.addEdge(edge.source, edge.target, {
      id: `e${index}`,
      weight: 1,
      color: '#CBD5E1' // Slate color
    });
  });
  
  return graph;
}

// Convert graphology graph to a format suitable for Sigma
export function convertGraphToSigmaFormat(graph: Graph): GraphData {
  const nodes: {
    id: string;
    label: string;
    x: number;
    y: number;
    size: number;
    color?: string;
  }[] = [];
  
  const edges: {
    id: string;
    source: string;
    target: string;
    color?: string;
  }[] = [];
  
  graph.forEachNode((node, attributes) => {
    nodes.push({
      id: node,
      label: attributes.label || node,
      x: attributes.x,
      y: attributes.y,
      size: attributes.size || 10,
      color: attributes.color
    });
  });
  
  graph.forEachEdge((edge, attributes, source, target) => {
    edges.push({
      id: edge,
      source,
      target,
      color: attributes.color
    });
  });
  
  return { nodes, edges };
}

// Add this function after the generateTeachingGraph function

// Generate a weighted version of the teaching graph specifically for Dijkstra's algorithm
export function generateWeightedTeachingGraph(): Graph {
  const graph = new Graph();
  
  // Add nodes in a structured layout
  const nodes: GraphNode[] = [
    { id: 'A', x: 0.5, y: 0.1 },
    { id: 'B', x: 0.3, y: 0.3 },
    { id: 'C', x: 0.7, y: 0.3 },
    { id: 'D', x: 0.1, y: 0.5 },
    { id: 'E', x: 0.4, y: 0.5 },
    { id: 'F', x: 0.6, y: 0.5 },
    { id: 'G', x: 0.9, y: 0.5 },
    { id: 'H', x: 0.3, y: 0.7 },
    { id: 'I', x: 0.7, y: 0.7 },
    { id: 'J', x: 0.5, y: 0.9 }
  ];
  
  // Define edges with predetermined weights to create an educational example
  const edges: GraphEdge[] = [
    { source: 'A', target: 'B', weight: 4 },
    { source: 'A', target: 'C', weight: 3 },
    { source: 'B', target: 'D', weight: 5 },
    { source: 'B', target: 'E', weight: 2 },
    { source: 'C', target: 'F', weight: 6 },
    { source: 'C', target: 'G', weight: 8 },
    { source: 'D', target: 'H', weight: 3 },
    { source: 'E', target: 'H', weight: 1 },
    { source: 'F', target: 'I', weight: 7 },
    { source: 'G', target: 'I', weight: 2 },
    { source: 'H', target: 'J', weight: 4 },
    { source: 'I', target: 'J', weight: 5 }
  ];
  
  // Add nodes
  nodes.forEach(node => {
    graph.addNode(node.id, {
      label: `Node ${node.id}`,
      x: node.x,
      y: node.y,
      size: 15,
      color: '#6366F1' // Indigo color
    });
  });
  
  // Add weighted edges
  edges.forEach((edge, index) => {
    graph.addEdge(edge.source, edge.target, {
      id: `e${index}`,
      weight: edge.weight,
      label: edge.weight?.toString(),
      color: '#CBD5E1' // Slate color
    });
  });
  
  // Add a few extra edges to create multiple possible paths
  const extraEdges: GraphEdge[] = [
    { source: 'B', target: 'F', weight: 9 },
    { source: 'D', target: 'E', weight: 2 },
    { source: 'F', target: 'H', weight: 8 },
    { source: 'E', target: 'I', weight: 6 }
  ];
  
  // Add extra edges
  extraEdges.forEach((edge, index) => {
    graph.addEdge(edge.source, edge.target, {
      id: `extra${index}`,
      weight: edge.weight,
      label: edge.weight?.toString(),
      color: '#CBD5E1' // Slate color
    });
  });
  
  return graph;
}

// Generate a weighted random graph specifically for Dijkstra's algorithm
export function generateWeightedRandomGraph(
  nodeCount: number = 10,
  edgeProbability: number = 0.3
): Graph {
  const graph = generateRandomGraph(nodeCount, edgeProbability);
  
  // Ensure the graph has edge weights
  graph.forEachEdge((edge, attributes, source, target) => {
    const weight = attributes.weight || Math.floor(Math.random() * 9) + 1;
    graph.setEdgeAttribute(edge, "weight", weight);
    graph.setEdgeAttribute(edge, "label", weight.toString());
  });
  
  // Ensure the graph is connected (every node can be reached)
  const nodes = graph.nodes();
  for (let i = 1; i < nodes.length; i++) {
    if (graph.neighbors(nodes[i]).length === 0) {
      // Connect isolated nodes to a random node
      const targetIndex = Math.floor(Math.random() * i);
      const weight = Math.floor(Math.random() * 9) + 1;
      graph.addEdge(nodes[i], nodes[targetIndex], {
        weight,
        label: weight.toString(),
        color: '#CBD5E1'
      });
    }
  }
  
  return graph;
}