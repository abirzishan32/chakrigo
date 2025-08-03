"use client";

import { useState, useEffect } from 'react';
import { SortStep } from './visualizer-adapter';

interface PremiumVisualizationProps {
  step: SortStep;
  isPlaying: boolean;
  isCompleted: boolean;
  onBarClick?: (index: number) => void;
}

interface FloatingLabel {
  id: string;
  text: string;
  index: number;
  type: 'compare' | 'swap' | 'pivot' | 'sorted';
}

export default function PremiumVisualization({
  step,
  isPlaying,
  isCompleted,
  onBarClick
}: PremiumVisualizationProps) {
  const [floatingLabels, setFloatingLabels] = useState<FloatingLabel[]>([]);

  // Create floating labels for actions
  useEffect(() => {
    const newLabels: FloatingLabel[] = [];

    if (step.pivotIndex !== undefined) {
      newLabels.push({
        id: `pivot-${step.pivotIndex}-${Date.now()}`,
        text: `Pivot: ${step.array[step.pivotIndex]}`,
        index: step.pivotIndex,
        type: 'pivot'
      });
    }

    if (step.swappedIndices && step.swappedIndices.length === 2) {
      const [i, j] = step.swappedIndices;
      newLabels.push({
        id: `swap-${i}-${j}-${Date.now()}`,
        text: `Swapped ${step.array[i]} ↔ ${step.array[j]}`,
        index: Math.floor((i + j) / 2),
        type: 'swap'
      });
    }

    if (step.comparingIndices && step.comparingIndices.length === 2) {
      const [i, j] = step.comparingIndices;
      newLabels.push({
        id: `compare-${i}-${j}-${Date.now()}`,
        text: `Compare ${step.array[i]} vs ${step.array[j]}`,
        index: Math.floor((i + j) / 2),
        type: 'compare'
      });
    }

    setFloatingLabels(newLabels);

    // Clear labels after animation
    const timer = setTimeout(() => {
      setFloatingLabels([]);
    }, 2000);

    return () => clearTimeout(timer);
  }, [step]);

  const getBarHeight = (value: number) => {
    const maxValue = Math.max(...step.array);
    const minHeight = 40;
    const maxHeight = 280; // Reduced height to ensure better fit
    return Math.max(minHeight, (value / maxValue) * maxHeight);
  };

  const getBarColor = (index: number) => {
    // Completion state
    if (isCompleted) {
      return 'from-green-400 to-emerald-500 shadow-lg shadow-green-500/25';
    }

    // Sorted elements
    if (step.sortedIndices?.includes(index)) {
      return 'from-green-400 to-emerald-500 shadow-lg shadow-green-500/25';
    }
    
    // Pivot element
    if (step.pivotIndex === index) {
      return 'from-purple-500 to-violet-600 shadow-lg shadow-purple-500/30 ring-2 ring-purple-300';
    }
    
    // Elements being swapped
    if (step.swappedIndices?.includes(index)) {
      return 'from-red-500 to-rose-600 shadow-lg shadow-red-500/30 ring-2 ring-red-300';
    }
    
    // Elements being compared
    if (step.comparingIndices?.includes(index)) {
      return 'from-yellow-400 to-amber-500 shadow-lg shadow-yellow-500/25 ring-2 ring-yellow-300';
    }
    
    // Elements in partition range
    if (step.partitionRange && 
        index >= step.partitionRange[0] && 
        index <= step.partitionRange[1]) {
      return 'from-blue-400 to-cyan-500 shadow-md shadow-blue-500/20';
    }
    
    // Default unsorted elements
    return 'from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700';
  };

  const getBarAnimation = (index: number) => {
    let classes = 'transition-all duration-500 ease-out transform';
    
    if (isPlaying) {
      classes += ' hover:scale-105';
    }
    
    if (step.swappedIndices?.includes(index)) {
      classes += ' animate-pulse scale-105';
    }
    
    if (step.comparingIndices?.includes(index)) {
      classes += ' animate-bounce';
    }
    
    return classes;
  };

  return (
    <div className="relative w-full flex flex-col items-center">
      {/* Status Banner */}
      {isCompleted && (
        <div className="mb-6 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full shadow-lg animate-fade-in">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span className="font-semibold">Sorting Complete! 🎉</span>
          </div>
        </div>
      )}

      {/* Floating Action Labels */}
      <div className="absolute inset-0 pointer-events-none z-20">
        {floatingLabels.map((label) => (
          <div
            key={label.id}
            className={`absolute transform -translate-x-1/2 -translate-y-full animate-float-up ${
              label.type === 'pivot' ? 'text-purple-600 dark:text-purple-400 font-bold' :
              label.type === 'swap' ? 'text-red-600 dark:text-red-400 font-bold' :
              label.type === 'compare' ? 'text-yellow-600 dark:text-yellow-400 font-semibold' :
              'text-green-600 dark:text-green-400 font-bold'
            }`}
            style={{
              left: `${(label.index / (step.array.length - 1)) * 100}%`,
              top: '10%'
            }}
          >
            <div className="bg-white dark:bg-gray-800 px-3 py-1 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
              {label.text}
            </div>
          </div>
        ))}
      </div>

      {/* Compact Legend Above Visualization */}
      <div className="mb-4 flex flex-wrap justify-center gap-3 text-xs">
        <div className="flex items-center space-x-1.5 px-2 py-1 bg-white/80 dark:bg-gray-800/80 rounded-full">
          <div className="w-3 h-3 rounded bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700"></div>
          <span className="text-gray-700 dark:text-gray-300">Unsorted</span>
        </div>
        <div className="flex items-center space-x-1.5 px-2 py-1 bg-white/80 dark:bg-gray-800/80 rounded-full">
          <div className="w-3 h-3 rounded bg-gradient-to-r from-blue-400 to-cyan-500"></div>
          <span className="text-gray-700 dark:text-gray-300">Partition</span>
        </div>
        <div className="flex items-center space-x-1.5 px-2 py-1 bg-white/80 dark:bg-gray-800/80 rounded-full">
          <div className="w-3 h-3 rounded bg-gradient-to-r from-yellow-400 to-amber-500"></div>
          <span className="text-gray-700 dark:text-gray-300">Comparing</span>
        </div>
        <div className="flex items-center space-x-1.5 px-2 py-1 bg-white/80 dark:bg-gray-800/80 rounded-full">
          <div className="w-3 h-3 rounded bg-gradient-to-r from-red-500 to-rose-600"></div>
          <span className="text-gray-700 dark:text-gray-300">Swapping</span>
        </div>
        <div className="flex items-center space-x-1.5 px-2 py-1 bg-white/80 dark:bg-gray-800/80 rounded-full">
          <div className="w-3 h-3 rounded bg-gradient-to-r from-purple-500 to-violet-600"></div>
          <span className="text-gray-700 dark:text-gray-300">Pivot</span>
        </div>
        <div className="flex items-center space-x-1.5 px-2 py-1 bg-white/80 dark:bg-gray-800/80 rounded-full">
          <div className="w-3 h-3 rounded bg-gradient-to-r from-green-400 to-emerald-500"></div>
          <span className="text-gray-700 dark:text-gray-300">Sorted</span>
        </div>
      </div>

      {/* Main Array Visualization */}
      <div className="flex items-end justify-center space-x-2 relative z-10">
        {step.array.map((value, index) => (
          <div
            key={index}
            className="flex flex-col items-center cursor-pointer group"
            onClick={() => onBarClick?.(index)}
          >
            {/* Bar */}
            <div
              className={`
                w-12 rounded-t-lg bg-gradient-to-t flex items-end justify-center text-white text-sm font-bold
                ${getBarColor(index)}
                ${getBarAnimation(index)}
              `}
              style={{ height: `${getBarHeight(value)}px` }}
            >
              <span className="mb-2 drop-shadow-sm">{value}</span>
            </div>
            
            {/* Index label */}
            <div className="mt-2 text-xs font-medium text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors">
              {index}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}