"use client";

import { useState, useEffect } from 'react';
import Graph from 'graphology';
import { generateTeachingGraph } from '@/lib/graph-algorithm/graph-generator';
import { Play, Pause, SkipBack, SkipForward, RefreshCw, Database } from 'lucide-react';

// Extend the graph generator to create weighted graphs
function generateWeightedTeachingGraph(): Graph {
  const graph = generateTeachingGraph();
  
  // Add weights to all edges
  graph.forEachEdge((edge, attributes, source, target) => {
    graph.setEdgeAttribute(edge, "weight", Math.floor(Math.random() * 9) + 1);
  });
  
  return graph;
}

interface GraphControlsProps {
  graph: Graph;
  onGraphChange: (graph: Graph) => void;
  onStartNodeChange: (nodeId: string) => void;
  onEndNodeChange: (nodeId: string) => void;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  onSpeedChange: (speed: number) => void;
  selectedStartNode: string;
  selectedEndNode: string;
  isRunning: boolean;
  currentStepIndex: number;
  totalSteps: number;
  speed: number;
}

// Speed multiplier options and their corresponding millisecond values
const speedOptions = [
  { label: '0.5x', value: 2000 },
  { label: '1x', value: 1000 },
  { label: '2x', value: 500 },
  { label: '4x', value: 250 }
];

export default function GraphControls({
  graph,
  onGraphChange,
  onStartNodeChange,
  onEndNodeChange,
  onStart,
  onPause,
  onReset,
  onStepForward,
  onStepBackward,
  onSpeedChange,
  selectedStartNode,
  selectedEndNode,
  isRunning,
  currentStepIndex,
  totalSteps,
  speed
}: GraphControlsProps) {
  
  // Generate a new teaching graph
  const handleGenerateGraph = () => {
    try {
      const newGraph = generateWeightedTeachingGraph();
      onGraphChange(newGraph);
      onStartNodeChange('A');
      onEndNodeChange('J');
      
      console.log(`Generated teaching graph with ${newGraph.order} nodes and ${newGraph.size} edges`);
    } catch (error) {
      console.error("Error generating graph:", error);
    }
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5 border dark:border-gray-700">
      <h2 className="text-xl font-bold mb-4 flex items-center">
        <Database size={20} className="mr-2 text-indigo-500" />
        Simulation Controls
      </h2>
      
      {/* Graph Configuration */}
      <div className="space-y-5 mb-6">
        {/* Start and End Node Selection */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium">Start Node</label>
            <select
              value={selectedStartNode}
              onChange={(e) => onStartNodeChange(e.target.value)}
              className="w-full py-2 px-3 text-sm border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              disabled={isRunning}
            >
              {graph.nodes().map((nodeId) => (
                <option key={nodeId} value={nodeId}>
                  Node {nodeId}
                </option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium">Target Node</label>
            <select
              value={selectedEndNode}
              onChange={(e) => onEndNodeChange(e.target.value)}
              className="w-full py-2 px-3 text-sm border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              disabled={isRunning}
            >
              {graph.nodes().map((nodeId) => (
                <option key={nodeId} value={nodeId}>
                  Node {nodeId}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Generate & Reset Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={handleGenerateGraph}
            className="py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 disabled:opacity-50 transition-all duration-200 flex items-center justify-center"
            disabled={isRunning}
          >
            <RefreshCw size={16} className="mr-2" />
            Generate New Graph
          </button>
          
          <button
            onClick={onReset}
            className="py-2 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1 disabled:opacity-50 transition-all duration-200 flex items-center justify-center"
            disabled={isRunning && currentStepIndex === 0}
          >
            <SkipBack size={16} className="mr-2" />
            Reset
          </button>
        </div>
      </div>
      
      {/* Divider */}
      <div className="border-t dark:border-gray-700 my-4"></div>
      
      {/* Traversal Controls */}
      <div className="space-y-4">
        {/* Progress Bar */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">
              Step {currentStepIndex + 1} of {totalSteps}
            </span>
            <span className="text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 px-2 py-1 rounded-full">
              {currentStepIndex >= totalSteps - 1 ? 'Complete' : 
               isRunning ? 'Running' : 'Paused'}
            </span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-600 transition-all duration-300"
              style={{ 
                width: `${totalSteps > 0 ? (currentStepIndex / (totalSteps - 1)) * 100 : 0}%` 
              }}
            ></div>
          </div>
        </div>
        
        {/* Playback Speed */}
        <div>
          <label className="block text-sm font-medium mb-2">Playback Speed</label>
          <div className="flex gap-2">
            {speedOptions.map((option) => (
              <button
                key={option.label}
                onClick={() => onSpeedChange(option.value)}
                className={`flex-1 py-1.5 px-2 text-sm rounded-md transition-all duration-200 ${
                  speed === option.value
                    ? 'bg-indigo-600 text-white font-medium shadow-sm'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* Playback Controls */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={onStepBackward}
            className="py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1 disabled:opacity-50 transition-all duration-200 flex items-center justify-center"
            disabled={currentStepIndex <= 0 || isRunning}
          >
            <SkipBack size={16} />
          </button>
          
          {isRunning ? (
            <button
              onClick={onPause}
              className="py-2 text-sm bg-yellow-600 text-white rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-1 transition-all duration-200 flex items-center justify-center"
            >
              <Pause size={16} className="mr-1" />
              Pause
            </button>
          ) : (
            <button
              onClick={onStart}
              className="py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 disabled:opacity-50 transition-all duration-200 flex items-center justify-center"
              disabled={currentStepIndex >= totalSteps - 1}
            >
              <Play size={16} className="mr-1" />
              Play
            </button>
          )}
          
          <button
            onClick={onStepForward}
            className="py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1 disabled:opacity-50 transition-all duration-200 flex items-center justify-center"
            disabled={currentStepIndex >= totalSteps - 1 || isRunning}
          >
            <SkipForward size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}