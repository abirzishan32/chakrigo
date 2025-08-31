import { BFSStep } from '@/components/algo-visualizer/bfs/types';
import Graph from 'graphology';

export function generateBFSSteps(graph: Graph, startNodeId: string): BFSStep[] {
  const steps: BFSStep[] = [];
  const visited: Set<string> = new Set();
  const queue: string[] = [startNodeId];
  
  // Initial state
  steps.push({
    currentNode: startNodeId,
    queue: [...queue],
    visited: [],
    state: 'initial'
  });
  
  while (queue.length > 0) {
    const currentNode = queue.shift()!;
    
    if (visited.has(currentNode)) {
      continue;
    }
    
    // Mark as visiting
    steps.push({
      currentNode,
      queue: [...queue],
      visited: [...visited],
      state: 'visiting'
    });
    
    // Mark as visited
    visited.add(currentNode);
    
    // Get neighbors
    const neighbors = graph.neighbors(currentNode);
    
    // Processing neighbors
    steps.push({
      currentNode,
      queue: [...queue],
      visited: [...visited],
      state: 'processing-neighbors'
    });
    
    // Process each neighbor
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        queue.push(neighbor);
        
        // Record adding to queue
        steps.push({
          currentNode,
          queue: [...queue],
          visited: [...visited],
          processingEdge: {
            source: currentNode,
            target: neighbor
          },
          state: 'processing-neighbors'
        });
      }
    }
  }
  
  // Final state
  steps.push({
    currentNode: '',
    queue: [],
    visited: [...visited],
    state: 'complete'
  });
  
  return steps;
}