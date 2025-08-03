"use client";

import { useState } from 'react';
import { Play, Pause, RotateCcw, Shuffle, Settings, Sliders, Hash, TrendingUp } from 'lucide-react';

interface MediaControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onReset: () => void;
  onShuffle: () => void;
  animationSpeed: number;
  onSpeedChange: (speed: number) => void;
  arraySize: number;
  onArraySizeChange: (size: number) => void;
  maxValue: number;
  onMaxValueChange: (value: number) => void;
  onGenerate: () => void;
  showSettings: boolean;
  disabled: boolean;
}

export default function MediaControls({
  isPlaying,
  onPlayPause,
  onReset,
  onShuffle,
  animationSpeed,
  onSpeedChange,
  arraySize,
  onArraySizeChange,
  maxValue,
  onMaxValueChange,
  onGenerate,
  showSettings,
  disabled
}: MediaControlsProps) {
  const [localArraySize, setLocalArraySize] = useState(arraySize);
  const [localMaxValue, setLocalMaxValue] = useState(maxValue);

  const handleArraySizeChange = (value: number) => {
    setLocalArraySize(value);
    onArraySizeChange(value);
  };

  const handleMaxValueChange = (value: number) => {
    setLocalMaxValue(value);
    onMaxValueChange(value);
  };

  const speedPresets = [
    { label: 'Slow', value: 1500, icon: '🐌' },
    { label: 'Normal', value: 800, icon: '🚶' },
    { label: 'Fast', value: 400, icon: '🏃' },
    { label: 'Turbo', value: 150, icon: '🚀' }
  ];

  return (
    <div className="space-y-4">
      {/* Main Controls */}
      <div className="flex items-center justify-center space-x-6">
        {/* Primary Action Buttons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onPlayPause}
            disabled={disabled}
            className={`
              group relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 transform hover:scale-105 active:scale-95
              ${isPlaying 
                ? 'bg-gradient-to-r from-orange-500 to-red-500 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40' 
                : 'bg-gradient-to-r from-green-500 to-emerald-600 shadow-lg shadow-green-500/25 hover:shadow-green-500/40'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-xl'}
            `}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 text-white" />
            ) : (
              <Play className="w-5 h-5 text-white ml-0.5" />
            )}
            <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>

          <button
            onClick={onReset}
            className="group relative flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-gray-500 to-gray-600 text-white transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg shadow-gray-500/25 hover:shadow-gray-500/40"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
            <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>

          <button
            onClick={onShuffle}
            disabled={disabled}
            className={`
              group relative flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-600 text-white transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            title="Generate New Array"
          >
            <Shuffle className="w-4 h-4" />
            <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
        </div>

        {/* Speed Control */}
        <div className="flex items-center space-x-4 px-6 py-3 rounded-full bg-white/10 dark:bg-black/10 backdrop-blur-sm border border-white/20">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Speed</span>
          </div>
          
          <div className="flex space-x-1">
            {speedPresets.map((preset) => (
              <button
                key={preset.value}
                onClick={() => onSpeedChange(preset.value)}
                className={`
                  px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200
                  ${animationSpeed === preset.value
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-white/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-600/70'
                  }
                `}
                title={`${preset.label} (${1000/preset.value}x speed)`}
              >
                <span className="mr-1">{preset.icon}</span>
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Advanced Settings */}
      {showSettings && (
        <div className="animate-slide-down">
          <div className="flex items-center justify-center space-x-8 px-6 py-4 rounded-xl bg-white/10 dark:bg-black/10 backdrop-blur-sm border border-white/20">
            {/* Array Size Control */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Hash className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[80px]">
                  Array Size
                </span>
              </div>
              
              <div className="flex items-center space-x-3">
                <input
                  type="range"
                  min="5"
                  max="25"
                  value={localArraySize}
                  onChange={(e) => handleArraySizeChange(parseInt(e.target.value))}
                  disabled={disabled}
                  className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <span className="text-sm font-bold text-gray-900 dark:text-white min-w-[24px] text-center">
                  {localArraySize}
                </span>
              </div>
            </div>

            {/* Max Value Control */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[70px]">
                  Max Value
                </span>
              </div>
              
              <div className="flex items-center space-x-3">
                <input
                  type="range"
                  min="20"
                  max="200"
                  step="10"
                  value={localMaxValue}
                  onChange={(e) => handleMaxValueChange(parseInt(e.target.value))}
                  disabled={disabled}
                  className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <span className="text-sm font-bold text-gray-900 dark:text-white min-w-[32px] text-center">
                  {localMaxValue}
                </span>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={onGenerate}
              disabled={disabled}
              className={`
                px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 transform hover:scale-105 active:scale-95
                ${disabled 
                  ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40'
                }
              `}
            >
              Generate Array
            </button>
          </div>
        </div>
      )}

      {/* Custom Styles for Sliders */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          transition: all 0.2s ease;
        }
        
        .slider::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
        }
        
        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          transition: all 0.2s ease;
        }
        
        .slider::-moz-range-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
        }
      `}</style>
    </div>
  );
}