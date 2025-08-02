"use client";

import React from 'react';
import { DijkstraStep } from './types';
import { AlertTriangle, CheckCircle, Activity, Target, Zap } from 'lucide-react';

interface AlgorithmExplanationProps {
  currentStep: DijkstraStep | null;
}

export default function AlgorithmExplanation({
  currentStep
}: AlgorithmExplanationProps) {
  const renderExplanation = () => {
    if (!currentStep) {
      return (
        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800">
          <p className="text-gray-600 dark:text-gray-400">
            Click "Start" to begin the visualization or use the step controls.
          </p>
        </div>
      );
    }

    switch (currentStep.state) {
      case 'initial':
        return (
          <div className="p-4 border border-blue-100 dark:border-blue-900 rounded-md bg-blue-50 dark:bg-blue-900/30">
            <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2 flex items-center">
              <Activity size={18} className="mr-2" />
              Initializing Dijkstra's Algorithm
            </h3>
            <p className="mb-2 text-blue-700 dark:text-blue-300">
              Starting from node <span className="font-mono bg-blue-100 dark:bg-blue-800 px-1 rounded">{currentStep.currentNode}</span>
              {currentStep.targetNode && <> to find shortest path to <span className="font-mono bg-blue-100 dark:bg-blue-800 px-1 rounded">{currentStep.targetNode}</span></>}
            </p>
            <ul className="list-disc pl-5 text-sm space-y-1 text-blue-600 dark:text-blue-400">
              <li>Set distance to start node as 0, all others as ∞</li>
              <li>Add start node to priority queue</li>
              <li>Mark no nodes as visited yet</li>
            </ul>
          </div>
        );
      
      case 'visiting':
        return (
          <div className="p-4 border border-amber-100 dark:border-amber-900 rounded-md bg-amber-50 dark:bg-amber-900/30">
            <h3 className="font-semibold text-amber-800 dark:text-amber-300 mb-2 flex items-center">
              <Target size={18} className="mr-2" />
              Processing Node
            </h3>
            <p className="mb-2 text-amber-700 dark:text-amber-300">
              Selected node <span className="font-mono bg-amber-100 dark:bg-amber-800 px-1 rounded">{currentStep.currentNode}</span> from priority queue (shortest distance so far).
            </p>
            <p className="text-sm text-amber-600 dark:text-amber-400">
              Now we'll examine all neighbors and potentially update their shortest distances.
            </p>
          </div>
        );
      
      case 'relaxing-edges':
        const { source, target, weight } = currentStep.processingEdge || { source: '', target: '', weight: 0 };
        const currentDistance = currentStep.distances[target];
        const newDistance = currentStep.distances[source] + weight;
        const isImprovement = newDistance < currentDistance;
        
        return (
          <div className={`p-4 border rounded-md ${
            isImprovement 
              ? "border-green-100 dark:border-green-900 bg-green-50 dark:bg-green-900/30" 
              : "border-purple-100 dark:border-purple-900 bg-purple-50 dark:bg-purple-900/30"
          }`}>
            <h3 className={`font-semibold mb-2 flex items-center ${
              isImprovement 
                ? "text-green-800 dark:text-green-300" 
                : "text-purple-800 dark:text-purple-300"
            }`}>
              {isImprovement ? (
                <Zap size={18} className="mr-2" />
              ) : (
                <AlertTriangle size={18} className="mr-2" />
              )}
              Edge Relaxation
            </h3>
            
            <p className={`mb-2 ${
              isImprovement 
                ? "text-green-700 dark:text-green-300" 
                : "text-purple-700 dark:text-purple-300"
            }`}>
              Checking edge {source} → {target} (weight: {weight})
            </p>
            
            <div className={`text-sm space-y-1 ${
              isImprovement 
                ? "text-green-600 dark:text-green-400" 
                : "text-purple-600 dark:text-purple-400"
            }`}>
              <p>Current distance to {target}: {currentDistance === Infinity ? '∞' : currentDistance}</p>
              <p>New distance via {source}: {currentStep.distances[source]} + {weight} = {newDistance}</p>
              {isImprovement ? (
                <p className="font-semibold">✓ Better path found! Updating distance and previous node.</p>
              ) : (
                <p>✗ No improvement. Keeping existing distance.</p>
              )}
            </div>
          </div>
        );
      
      case 'complete':
        return (
          <div className="p-4 border border-green-100 dark:border-green-900 rounded-md bg-green-50 dark:bg-green-900/30">
            <h3 className="font-semibold text-green-800 dark:text-green-300 mb-2 flex items-center">
              <CheckCircle size={18} className="mr-2" />
              Algorithm Complete
            </h3>
            <p className="mb-2 text-green-700 dark:text-green-300">
              Dijkstra's algorithm finished! 
              {currentStep.shortestPath && (
                <> Found shortest path to {currentStep.targetNode}.</>
              )}
            </p>
            {currentStep.shortestPath && (
              <div className="text-sm text-green-600 dark:text-green-400">
                <p className="font-medium mb-1">Shortest path:</p>
                <div className="flex flex-wrap gap-1">
                  {currentStep.shortestPath.map((node, index) => (
                    <span key={node} className="px-2 py-0.5 bg-green-100 dark:bg-green-800 rounded-full font-mono text-xs">
                      {index > 0 && '→ '}{node}
                    </span>
                  ))}
                </div>
                <p className="mt-2">
                  Total distance: {currentStep.distances[currentStep.targetNode!]}
                </p>
              </div>
            )}
          </div>
        );
      
      default:
        return <p>Processing algorithm...</p>;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3">
      <h2 className="text-lg font-semibold mb-2">Dijkstra's Algorithm</h2>
      
      {/* Current state explanation */}
      {currentStep && (
        <div className="mb-3">
          {renderExplanation()}
        </div>
      )}
      
      {/* Current state panel - Compact layout */}
      <div className="mb-3">
        <h3 className="text-sm font-semibold mb-1">Current State</h3>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
            <div className="font-medium">Current Node</div>
            <div>{currentStep?.currentNode || 'None'}</div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
            <div className="font-medium">Queue Size</div>
            <div>{currentStep?.priorityQueue?.length || 0}</div>
          </div>
          <div className="col-span-2 bg-gray-50 dark:bg-gray-700 p-2 rounded">
            <div className="font-medium">Visited Nodes</div>
            <div className="flex flex-wrap gap-1 mt-1">
              {currentStep?.visited?.map(node => (
                <span key={node} className="inline-block px-1.5 py-0.5 text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded">
                  {node}
                </span>
              ))}
              {(!currentStep?.visited || currentStep.visited.length === 0) && "None"}
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabbed content to save space */}
      <div className="border-t dark:border-gray-700 pt-2">
        <details className="group">
          <summary className="flex items-center justify-between cursor-pointer text-sm font-semibold">
            <span>Algorithm Overview</span>
            <svg className="w-5 h-5 transition-transform group-open:rotate-180" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </summary>
          
          <div className="pt-2 text-xs">
            <pre className="bg-gray-100 dark:bg-gray-900 p-2 rounded-md font-mono overflow-x-auto text-xs">
{`function Dijkstra(graph, start, end):
  distances = {start: 0, others: ∞}
  previous = {all: null}
  pq = PriorityQueue()
  visited = {}
  
  pq.add(start, 0)
  
  while pq not empty:
    current = pq.extractMin()
    if current == end: break
    
    for neighbor in graph[current]:
      newDist = distances[current] + weight(current, neighbor)
      if newDist < distances[neighbor]:
        distances[neighbor] = newDist
        previous[neighbor] = current
        pq.add(neighbor, newDist)`}
            </pre>
          </div>
        </details>
        
        <details className="group mt-2">
          <summary className="flex items-center justify-between cursor-pointer text-sm font-semibold">
            <span>Algorithm Properties</span>
            <svg className="w-5 h-5 transition-transform group-open:rotate-180" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </summary>
          
          <div className="pt-2">
            <ul className="list-disc pl-4 space-y-0.5 text-xs">
              <li><strong>Time:</strong> O((V + E) log V) with binary heap</li>
              <li><strong>Space:</strong> O(V) for distances and priority queue</li>
              <li><strong>Optimal:</strong> Yes (finds shortest paths)</li>
              <li><strong>Requirement:</strong> Non-negative edge weights only</li>
              <li><strong>Applications:</strong> GPS navigation, network routing, flight scheduling</li>
            </ul>
          </div>
        </details>

        <details className="group mt-2">
          <summary className="flex items-center justify-between cursor-pointer text-sm font-semibold">
            <span>Key Concepts</span>
            <svg className="w-5 h-5 transition-transform group-open:rotate-180" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </summary>
          
          <div className="pt-2">
            <div className="space-y-2 text-xs">
              <div>
                <strong>Edge Relaxation:</strong> If we find a shorter path to a node, we update its distance and previous pointer.
              </div>
              <div>
                <strong>Priority Queue:</strong> Always process the unvisited node with the smallest known distance first.
              </div>
              <div>
                <strong>Greedy Choice:</strong> Once a node is visited, we know its shortest distance from the source.
              </div>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
}