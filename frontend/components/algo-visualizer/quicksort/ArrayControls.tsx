"use client";

import { useState } from 'react';

interface ArrayControlsProps {
  onGenerate: (size: number, maxValue: number) => void;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
  sortingSpeed: number;
  disabled: boolean;
}

export default function ArrayControls({
  onGenerate,
  onStart,
  onStop,
  onReset,
  onSpeedChange,
  sortingSpeed,
  disabled
}: ArrayControlsProps) {
  const [arraySize, setArraySize] = useState<number>(10);
  const [maxValue, setMaxValue] = useState<number>(100);
  
  const handleGenerate = () => {
    onGenerate(arraySize, maxValue);
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Controls</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">Array Size</label>
          <div className="flex items-center">
            <input
              type="range"
              min="5"
              max="30"
              value={arraySize}
              onChange={(e) => setArraySize(parseInt(e.target.value))}
              className="w-full mr-2"
              disabled={disabled}
            />
            <span className="w-10 text-center">{arraySize}</span>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Max Value</label>
          <div className="flex items-center">
            <input
              type="range"
              min="10"
              max="200"
              value={maxValue}
              onChange={(e) => setMaxValue(parseInt(e.target.value))}
              className="w-full mr-2"
              disabled={disabled}
            />
            <span className="w-12 text-center">{maxValue}</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
        <button
          onClick={handleGenerate}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={disabled}
        >
          Generate Array
        </button>
        
        <button
          onClick={onStart}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={disabled}
        >
          Start Sorting
        </button>
        
        <button
          onClick={onStop}
          className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!disabled}
        >
          Pause
        </button>
        
        <button
          onClick={onReset}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
        >
          Reset
        </button>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Animation Speed</label>
        <div className="flex items-center">
          <span className="text-xs mr-2">Fast</span>
          <input
            type="range"
            min="50"
            max="1000"
            step="50"
            value={sortingSpeed}
            onChange={(e) => onSpeedChange(parseInt(e.target.value))}
            className="w-full"
          />
          <span className="text-xs ml-2">Slow</span>
        </div>
      </div>
    </div>
  );
}