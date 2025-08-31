"use client";

import { BFSStep } from './types';
import { LayoutGroup } from 'framer-motion'; // If you're using framer-motion

interface AlgorithmExplanationProps {
  currentStep: BFSStep | null;
}

export default function AlgorithmExplanation({
  currentStep
}: AlgorithmExplanationProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3">
      <h2 className="text-lg font-semibold mb-2">Breadth-First Search (BFS)</h2>
      
      {/* Current state explanation - Made more compact */}
      {currentStep && (
        <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs">
          {currentStep.state === 'initial' && (
            <p className="text-blue-800 dark:text-blue-300">
              Starting BFS from node <strong>{currentStep.currentNode}</strong>
            </p>
          )}
          {currentStep.state === 'visiting' && (
            <p className="text-purple-800 dark:text-purple-300">
              Dequeued <strong>{currentStep.currentNode}</strong>, exploring neighbors
            </p>
          )}
          {currentStep.state === 'processing-neighbors' && currentStep.processingEdge && (
            <p className="text-green-800 dark:text-green-300">
              Checking if node <strong>{currentStep.processingEdge.target}</strong> is visited
            </p>
          )}
          {currentStep.state === 'complete' && (
            <p className="text-green-800 dark:text-green-300">
              BFS traversal complete!
            </p>
          )}
        </div>
      )}
      
      {/* Current state panel - Compact layout with flexible height */}
      <div className="mb-3">
        <h3 className="text-sm font-semibold mb-1">Current State</h3>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
            <div className="font-medium">Current Node</div>
            <div>{currentStep?.currentNode || 'None'}</div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
            <div className="font-medium">Queue</div>
            <div className="truncate">
              {currentStep?.queue?.length && currentStep?.queue?.length > 0 ? currentStep?.queue?.join(', ') : 'Empty'}
            </div>
          </div>
          <div className="col-span-2 bg-gray-50 dark:bg-gray-700 p-2 rounded">
            <div className="font-medium">Visited</div>
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
{`function BFS(graph, start):
  queue = [start]
  visited = {start}
  
  while queue not empty:
    current = queue.shift()
    
    for neighbor of graph[current]:
      if neighbor not in visited:
        visited.add(neighbor)
        queue.push(neighbor)`}
            </pre>
          </div>
        </details>
        
        <details className="group mt-2">
          <summary className="flex items-center justify-between cursor-pointer text-sm font-semibold">
            <span>BFS Properties</span>
            <svg className="w-5 h-5 transition-transform group-open:rotate-180" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </summary>
          
          <div className="pt-2">
            <ul className="list-disc pl-4 space-y-0.5 text-xs">
              <li><strong>Time:</strong> O(V + E)</li>
              <li><strong>Space:</strong> O(V)</li>
              <li><strong>Complete:</strong> Yes (finds all reachable vertices)</li>
              <li><strong>Optimal:</strong> Yes (for unweighted graphs)</li>
            </ul>
          </div>
        </details>
      </div>
    </div>
  );
}