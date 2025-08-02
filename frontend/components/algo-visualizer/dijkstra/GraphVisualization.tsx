"use client";

import { useEffect, useRef } from 'react';
import { DijkstraStep } from './types';
import Sigma from 'sigma';
import Graph from 'graphology';

interface GraphVisualizationProps {
  graph: Graph;
  currentStep: DijkstraStep | null;
  isRunning: boolean;
}

export default function GraphVisualization({
  graph,
  currentStep,
  isRunning
}: GraphVisualizationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sigmaRef = useRef<Sigma | null>(null);
  const graphRef = useRef<Graph | null>(null);
  
  // Initialize and clean up Sigma
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Clone the graph to avoid modifying the original
    graphRef.current = graph.copy();

    // Set edge labels to their weights
    graphRef.current.forEachEdge((edge, attributes, source, target) => {
      const weight = attributes.weight || 1;
      graphRef.current?.setEdgeAttribute(edge, "label", weight.toString());
    });

    // Create Sigma instance
    sigmaRef.current = new Sigma(graphRef.current, containerRef.current, {
      renderEdgeLabels: true,
      allowInvalidContainer: true
    });
    
    // Clean up
    return () => {
      if (sigmaRef.current) {
        sigmaRef.current.kill();
        sigmaRef.current = null;
      }
    };
  }, [graph]);
  
  // Update the graph based on current step
  useEffect(() => {
    if (!graphRef.current || !sigmaRef.current || !currentStep) return;
    
    // Reset all nodes and edges to default state
    graphRef.current.forEachNode((node, attributes) => {
      graphRef.current?.setNodeAttribute(node, "color", "#6366F1"); // Default color
      graphRef.current?.setNodeAttribute(node, "size", 10); // Default size
    });
    
    graphRef.current.forEachEdge((edge, attributes, source, target) => {
      graphRef.current?.setEdgeAttribute(edge, "color", "#CBD5E1"); // Default edge color
      graphRef.current?.setEdgeAttribute(edge, "size", 1); // Default edge size
    });
    
    // Highlight visited nodes
    currentStep.visited.forEach(nodeId => {
      if (nodeId !== currentStep.currentNode) {
        graphRef.current?.setNodeAttribute(nodeId, "color", "#10B981"); // Visited nodes (green)
      }
    });
    
    // Highlight current node being processed
    if (currentStep.currentNode) {
      graphRef.current.setNodeAttribute(currentStep.currentNode, "color", "#EF4444"); // Current node (red)
      graphRef.current.setNodeAttribute(currentStep.currentNode, "size", 15); // Make current node larger
    }
    
    // Highlight nodes in priority queue
    currentStep.priorityQueue.forEach(({node}) => {
      if (!currentStep.visited.includes(node) && node !== currentStep.currentNode) {
        graphRef.current?.setNodeAttribute(node, "color", "#F59E0B"); // In queue (yellow)
      }
    });
    
    // Highlight target node if specified
    if (currentStep.targetNode && currentStep.targetNode !== currentStep.currentNode) {
      graphRef.current.setNodeAttribute(currentStep.targetNode, "color", "#8B5CF6"); // Target node (purple)
      graphRef.current.setNodeAttribute(currentStep.targetNode, "size", 15); // Make target node larger
    }
    
    // Highlight processing edge
    if (currentStep.processingEdge) {
      const { source, target } = currentStep.processingEdge;
      
      try {
        const edgeId = graphRef.current.edge(source, target);
        graphRef.current.setEdgeAttribute(edgeId, "color", "#3B82F6"); // Processing edge (blue)
        graphRef.current.setEdgeAttribute(edgeId, "size", 3); // Make it thicker
      } catch (e) {
        // Edge might not exist
      }
    }
    
    // Highlight the shortest path
    if (currentStep.shortestPath && currentStep.shortestPath.length > 1) {
      for (let i = 0; i < currentStep.shortestPath.length - 1; i++) {
        const source = currentStep.shortestPath[i];
        const target = currentStep.shortestPath[i + 1];
        
        try {
          const edgeId = graphRef.current.edge(source, target);
          graphRef.current.setEdgeAttribute(edgeId, "color", "#8B5CF6"); // Path edge (purple)
          graphRef.current.setEdgeAttribute(edgeId, "size", 2); // Make it thicker
        } catch (e) {
          // Edge might not exist
        }
      }
    }
    
    // Refresh the renderer
    sigmaRef.current.refresh();
    
  }, [currentStep]);
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-2 p-3 pb-0">
        <h2 className="text-lg font-semibold">Graph Visualization</h2>
        
        {/* Status text in header */}
        <div className="text-xs">
          {currentStep && (
            <>
              {currentStep.state === 'initial' && "Starting Dijkstra's algorithm..."}
              {currentStep.state === 'visiting' && `Visiting node ${currentStep.currentNode}`}
              {currentStep.state === 'relaxing-edges' && 
                (currentStep.processingEdge 
                  ? `Checking edge ${currentStep.processingEdge.source} → ${currentStep.processingEdge.target} (weight: ${currentStep.processingEdge.weight})` 
                  : `Relaxing edges from node ${currentStep.currentNode}`)
              }
              {currentStep.state === 'complete' && "Algorithm complete!"}
            </>
          )}
        </div>
      </div>
      
      {/* Color legend - compact horizontal row */}
      <div className="px-3 mb-2">
        <div className="flex flex-wrap gap-3 justify-start">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-[#6366F1] mr-1 rounded-full"></div>
            <span className="text-xs">Unvisited</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-[#EF4444] mr-1 rounded-full"></div>
            <span className="text-xs">Current</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-[#10B981] mr-1 rounded-full"></div>
            <span className="text-xs">Visited</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-[#F59E0B] mr-1 rounded-full"></div>
            <span className="text-xs">In Queue</span>
          </div>
          {currentStep?.targetNode && (
            <div className="flex items-center">
              <div className="w-3 h-3 bg-[#8B5CF6] mr-1 rounded-full"></div>
              <span className="text-xs">Target</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Graph container */}
      <div className="flex-1 p-3 pt-0">
        <div 
          ref={containerRef} 
          className="w-full h-full border border-gray-200 dark:border-gray-700 rounded-lg"
        />
      </div>
    </div>
  );
}