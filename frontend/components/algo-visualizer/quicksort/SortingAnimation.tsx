"use client";

import { SortStep } from './visualizer-adapter';

interface SortingAnimationProps {
  step: SortStep;
  isSorting: boolean;
}

export default function SortingAnimation({
  step,
  isSorting
}: SortingAnimationProps) {
  const getBarColor = (index: number) => {
    // Sorted elements
    if (step.sortedIndices?.includes(index)) {
      return 'bg-green-500';
    }
    
    // Pivot element
    if (step.pivotIndex === index) {
      return 'bg-purple-500';
    }
    
    // Elements being compared
    if (step.comparingIndices?.includes(index)) {
      return 'bg-yellow-500';
    }
    
    // Elements being swapped
    if (step.swappedIndices?.includes(index)) {
      return 'bg-red-500';
    }
    
    // Elements in partition range
    if (step.partitionRange && 
        index >= step.partitionRange[0] && 
        index <= step.partitionRange[1]) {
      return 'bg-blue-400';
    }
    
    // Default unsorted elements
    return 'bg-gray-400';
  };

  const getBarHeight = (value: number) => {
    const maxValue = Math.max(...step.array);
    const minHeight = 20;
    const maxHeight = 300;
    return Math.max(minHeight, (value / maxValue) * maxHeight);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Array Visualization</h2>
      
      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-400 rounded"></div>
          <span>Unsorted</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-400 rounded"></div>
          <span>In Partition</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-500 rounded"></div>
          <span>Comparing</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span>Swapping</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-purple-500 rounded"></div>
          <span>Pivot</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span>Sorted</span>
        </div>
      </div>
      
      {/* Array Visualization */}
      <div className="flex items-end justify-center gap-1 min-h-[320px] overflow-x-auto">
        {step.array.map((value, index) => (
          <div
            key={index}
            className="flex flex-col items-center"
          >
            <div
              className={`
                w-8 transition-all duration-300 rounded-t flex items-end justify-center text-white text-xs font-bold
                ${getBarColor(index)}
                ${isSorting ? 'animate-pulse' : ''}
              `}
              style={{ height: `${getBarHeight(value)}px` }}
            >
              <span className="mb-1">{value}</span>
            </div>
            <span className="text-xs mt-1 text-gray-600 dark:text-gray-400">
              {index}
            </span>
          </div>
        ))}
      </div>
      
      {/* Current Step Info */}
      <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          {step.pivotIndex !== undefined && (
            <div>
              <strong>Pivot:</strong> {step.array[step.pivotIndex]} (index {step.pivotIndex})
            </div>
          )}
          {step.partitionRange && (
            <div>
              <strong>Partition Range:</strong> [{step.partitionRange[0]}, {step.partitionRange[1]}]
            </div>
          )}
          {step.comparingIndices && step.comparingIndices.length > 0 && (
            <div>
              <strong>Comparing:</strong> indices {step.comparingIndices.join(', ')}
            </div>
          )}
          {step.swappedIndices && step.swappedIndices.length > 0 && (
            <div>
              <strong>Swapped:</strong> indices {step.swappedIndices.join(', ')}
            </div>
          )}
          {step.sortedIndices && step.sortedIndices.length > 0 && (
            <div>
              <strong>Sorted Count:</strong> {step.sortedIndices.length}/{step.array.length}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}