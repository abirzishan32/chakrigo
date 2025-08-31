import { DFSStep } from '@/components/algo-visualizer/dfs/types';
import Graph from 'graphology';

export function generateDFSSteps(graph: Graph, startNodeId: string): DFSStep[] {
  const steps: DFSStep[] = [];
  const visited: Set<string> = new Set();
  const stack: string[] = [startNodeId];
  
  // Initial state
  steps.push({
    currentNode: startNodeId,
    stack: [...stack],
    visited: [],
    state: 'initial'
  });
  
  // Use iteration to simulate recursion for clearer visualization
  while (stack.length > 0) {
    // Look at the top of the stack (don't pop yet)
    const currentNode = stack[stack.length - 1];
    
    if (visited.has(currentNode)) {
      // If we've already visited this node, backtrack
      stack.pop();
      
      if (stack.length > 0) {
        // Record backtracking
        steps.push({
          currentNode: stack[stack.length - 1],
          stack: [...stack],
          visited: [...visited],
          state: 'backtracking'
        });
      }
      continue;
    }
    
    // Mark as visiting
    steps.push({
      currentNode,
      stack: [...stack],
      visited: [...visited],
      state: 'visiting'
    });
    
    // Mark as visited
    visited.add(currentNode);
    
    // Get neighbors
    const neighbors = graph.neighbors(currentNode);
    const unvisitedNeighbors = neighbors.filter(n => !visited.has(n));
    
    // Processing neighbors
    steps.push({
      currentNode,
      stack: [...stack],
      visited: [...visited],
      state: 'processing-neighbors'
    });
    
    if (unvisitedNeighbors.length === 0) {
      // No unvisited neighbors, backtrack
      stack.pop();
      
      // Record backtracking (if we're not done)
      if (stack.length > 0) {
        steps.push({
          currentNode: stack[stack.length - 1],
          stack: [...stack],
          visited: [...visited],
          state: 'backtracking'
        });
      }
    } else {
      // Process each unvisited neighbor (in DFS we only take the first one)
      const nextNode = unvisitedNeighbors[0];
      stack.push(nextNode);
      
      // Record edge traversal
      steps.push({
        currentNode,
        stack: [...stack],
        visited: [...visited],
        processingEdge: {
          source: currentNode,
          target: nextNode
        },
        state: 'processing-neighbors'
      });
    }
  }
  
  // Final state
  steps.push({
    currentNode: '',
    stack: [],
    visited: [...visited],
    state: 'complete'
  });
  
  return steps;
}