"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Graph from 'graphology';
import GraphVisualization from './GraphVisualization';
import GraphControls from './GraphControls';
import PriorityQueue from './PriorityQueue';
import DistanceTable from './DistanceTable';
import AlgorithmExplanation from './AlgorithmExplanation';
import { DijkstraStep } from './types';
import { generateTeachingGraph } from '@/lib/graph-algorithm/graph-generator';

// Generate weighted teaching graph
function generateWeightedTeachingGraph(): Graph {
  const graph = generateTeachingGraph();
  
  // Add weights to all edges
  graph.forEachEdge((edge, attributes, source, target) => {
    graph.setEdgeAttribute(edge, "weight", Math.floor(Math.random() * 9) + 1);
  });
  
  return graph;
}

// Dijkstra's algorithm implementation
function dijkstraAlgorithm(graph: Graph, startNode: string, endNode?: string): DijkstraStep[] {
  const steps: DijkstraStep[] = [];
  const distances: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  const visited: string[] = [];
  const priorityQueue: { node: string; distance: number }[] = [];

  // Initialize distances
  graph.forEachNode((node) => {
    distances[node] = node === startNode ? 0 : Infinity;
    previous[node] = null;
  });

  // Add start node to priority queue
  priorityQueue.push({ node: startNode, distance: 0 });

  // Initial step
  steps.push({
    currentNode: startNode,
    priorityQueue: [...priorityQueue],
    distances: { ...distances },
    previous: { ...previous },
    visited: [...visited],
    state: 'initial',
    targetNode: endNode
  });

  while (priorityQueue.length > 0) {
    // Sort priority queue by distance
    priorityQueue.sort((a, b) => a.distance - b.distance);
    
    // Get node with minimum distance
    const current = priorityQueue.shift();
    if (!current) break;

    const currentNode = current.node;

    // Skip if already visited
    if (visited.includes(currentNode)) continue;

    // Mark as visited
    visited.push(currentNode);

    // Add visiting step
    steps.push({
      currentNode,
      priorityQueue: [...priorityQueue],
      distances: { ...distances },
      previous: { ...previous },
      visited: [...visited],
      state: 'visiting',
      targetNode: endNode
    });

    // If we reached the target, we can stop
    if (endNode && currentNode === endNode) {
      // Generate shortest path
      const shortestPath: string[] = [];
      let pathNode: string | null = endNode;
      while (pathNode !== null) {
        shortestPath.unshift(pathNode);
        pathNode = previous[pathNode];
      }

      steps.push({
        currentNode,
        priorityQueue: [...priorityQueue],
        distances: { ...distances },
        previous: { ...previous },
        visited: [...visited],
        state: 'complete',
        targetNode: endNode,
        shortestPath
      });
      break;
    }

    // Check all neighbors
    const neighbors = graph.neighbors(currentNode);
    
    for (const neighbor of neighbors) {
      if (visited.includes(neighbor)) continue;

      const edge = graph.edge(currentNode, neighbor);
      const weight = graph.getEdgeAttribute(edge, 'weight') || 1;
      const alt = distances[currentNode] + weight;

      // Add edge processing step
      steps.push({
        currentNode,
        priorityQueue: [...priorityQueue],
        distances: { ...distances },
        previous: { ...previous },
        visited: [...visited],
        processingEdge: {
          source: currentNode,
          target: neighbor,
          weight
        },
        state: 'relaxing-edges',
        targetNode: endNode
      });

      if (alt < distances[neighbor]) {
        distances[neighbor] = alt;
        previous[neighbor] = currentNode;
        
        // Add to priority queue if not already there
        const existingIndex = priorityQueue.findIndex(item => item.node === neighbor);
        if (existingIndex !== -1) {
          priorityQueue[existingIndex].distance = alt;
        } else {
          priorityQueue.push({ node: neighbor, distance: alt });
        }
      }
    }
  }

  // Final step if we didn't reach target
  if (!endNode || !visited.includes(endNode)) {
    steps.push({
      currentNode: visited[visited.length - 1] || startNode,
      priorityQueue: [],
      distances: { ...distances },
      previous: { ...previous },
      visited: [...visited],
      state: 'complete',
      targetNode: endNode
    });
  }

  return steps;
}

export default function DijkstraVisualizer() {
  const [graph, setGraph] = useState<Graph>(() => generateWeightedTeachingGraph());
  const [selectedStartNode, setSelectedStartNode] = useState<string>('A');
  const [selectedEndNode, setSelectedEndNode] = useState<string>('J');
  const [steps, setSteps] = useState<DijkstraStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1000);
  const [animationTimer, setAnimationTimer] = useState<NodeJS.Timeout | null>(null);

  // Generate steps when graph or nodes change
  useEffect(() => {
    if (graph.hasNode(selectedStartNode) && graph.hasNode(selectedEndNode)) {
      const newSteps = dijkstraAlgorithm(graph, selectedStartNode, selectedEndNode);
      setSteps(newSteps);
      setCurrentStepIndex(0);
    }
  }, [graph, selectedStartNode, selectedEndNode]);

  // Clean up animation timer when component unmounts
  useEffect(() => {
    return () => {
      if (animationTimer) {
        clearTimeout(animationTimer);
      }
    };
  }, [animationTimer]);

  const handleStart = useCallback(() => {
    if (currentStepIndex >= steps.length - 1) {
      setCurrentStepIndex(0);
    }
    
    setIsRunning(true);
    
    const runStep = () => {
      setCurrentStepIndex(prevIndex => {
        const nextIndex = prevIndex + 1;
        
        if (nextIndex >= steps.length - 1) {
          setIsRunning(false);
          return steps.length - 1;
        }
        
        const timer = setTimeout(runStep, speed);
        setAnimationTimer(timer);
        
        return nextIndex;
      });
    };
    
    runStep();
  }, [currentStepIndex, steps, speed]);

  const handlePause = useCallback(() => {
    if (animationTimer) {
      clearTimeout(animationTimer);
      setAnimationTimer(null);
    }
    setIsRunning(false);
  }, [animationTimer]);

  const handleReset = useCallback(() => {
    if (animationTimer) {
      clearTimeout(animationTimer);
      setAnimationTimer(null);
    }
    setIsRunning(false);
    setCurrentStepIndex(0);
  }, [animationTimer]);

  const handleStepForward = useCallback(() => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prevIndex => prevIndex + 1);
    }
  }, [currentStepIndex, steps]);

  const handleStepBackward = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prevIndex => prevIndex - 1);
    }
  }, [currentStepIndex]);

  const handleGraphChange = useCallback((newGraph: Graph) => {
    setGraph(newGraph);
    if (animationTimer) {
      clearTimeout(animationTimer);
      setAnimationTimer(null);
    }
    setIsRunning(false);
    setCurrentStepIndex(0);
  }, [animationTimer]);

  const handleStartNodeChange = useCallback((nodeId: string) => {
    setSelectedStartNode(nodeId);
    if (animationTimer) {
      clearTimeout(animationTimer);
      setAnimationTimer(null);
    }
    setIsRunning(false);
    setCurrentStepIndex(0);
  }, [animationTimer]);

  const handleEndNodeChange = useCallback((nodeId: string) => {
    setSelectedEndNode(nodeId);
    if (animationTimer) {
      clearTimeout(animationTimer);
      setAnimationTimer(null);
    }
    setIsRunning(false);
    setCurrentStepIndex(0);
  }, [animationTimer]);

  const currentStep = steps[currentStepIndex] || null;

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Dijkstra's Algorithm Visualization</h1>
          <p className="text-muted-foreground">
            Watch how Dijkstra's algorithm finds the shortest path in a weighted graph using a priority queue.
          </p>
        </div>

        {/* Layout matching DFS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Main visualization area */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            {/* Graph visualization with fixed height */}
            <div 
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border dark:border-gray-700"
              style={{ height: "500px", position: "relative", overflow: "hidden" }}
            >
              <GraphVisualization
                graph={graph}
                currentStep={currentStep}
                isRunning={isRunning}
              />
            </div>

            {/* Bottom panels */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Priority Queue */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border dark:border-gray-700">
                <PriorityQueue
                  items={currentStep?.priorityQueue || []}
                  currentNode={currentStep?.currentNode || ''}
                />
              </div>

              {/* Distance Table */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border dark:border-gray-700">
                <DistanceTable
                  distances={currentStep?.distances || {}}
                  previous={currentStep?.previous || {}}
                  visited={currentStep?.visited || []}
                  currentNode={currentStep?.currentNode || ''}
                  targetNode={selectedEndNode}
                  shortestPath={currentStep?.shortestPath}
                />
              </div>
            </div>
          </div>

          {/* Right sidebar for controls and explanation */}
          <div className="flex flex-col gap-5">
            {/* Controls panel */}
            <GraphControls
              graph={graph}
              onGraphChange={handleGraphChange}
              onStartNodeChange={handleStartNodeChange}
              onEndNodeChange={handleEndNodeChange}
              onStart={handleStart}
              onPause={handlePause}
              onReset={handleReset}
              onStepForward={handleStepForward}
              onStepBackward={handleStepBackward}
              onSpeedChange={setSpeed}
              selectedStartNode={selectedStartNode}
              selectedEndNode={selectedEndNode}
              isRunning={isRunning}
              currentStepIndex={currentStepIndex}
              totalSteps={steps.length}
              speed={speed}
            />

            {/* Algorithm explanation with controlled height */}
            <div className="flex-grow overflow-auto">
              <AlgorithmExplanation currentStep={currentStep} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}