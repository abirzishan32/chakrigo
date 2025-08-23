"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { StackState } from './StackVisualizer';

interface StackControlsProps {
  stack: StackState;
  inputValue: string;
  setInputValue: (value: string) => void;
  onPush: (value: number) => void;
  onPop: () => void;
  onPeek: () => void;
  onReset: () => void;
}

export function StackControls({
  stack,
  inputValue,
  setInputValue,
  onPush,
  onPop,
  onPeek,
  onReset,
}: StackControlsProps) {
  const handlePush = () => {
    const value = parseInt(inputValue);
    if (!isNaN(value) && value >= 0 && value <= 999) {
      onPush(value);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handlePush();
    }
  };

  const isValidInput = () => {
    const value = parseInt(inputValue);
    return !isNaN(value) && value >= 0 && value <= 999 && inputValue.trim() !== '';
  };

  return (
    <div className="bg-slate-800 rounded-lg shadow-xl p-6">
      <h2 className="text-xl font-semibold mb-6">Stack Operations</h2>
      
      <div className="space-y-4">
        {/* Push Operation */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-slate-300">
            Push Element (0-999)
          </label>
          <div className="flex space-x-2">
            <input
              type="number"
              min="0"
              max="999"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={stack.isAnimating}
              placeholder="Enter value"
              className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg 
                       text-white placeholder-slate-400 focus:outline-none focus:ring-2 
                       focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePush}
              disabled={!isValidInput() || stack.isAnimating || stack.top >= stack.maxSize - 1}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 
                       disabled:cursor-not-allowed text-white font-medium rounded-lg 
                       transition-colors duration-200"
            >
              Push
            </motion.button>
          </div>
        </div>

        {/* Operation Buttons */}
        <div className="grid grid-cols-1 gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onPop}
            disabled={stack.isAnimating || stack.top < 0}
            className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:bg-slate-600 
                     disabled:cursor-not-allowed text-white font-medium rounded-lg 
                     transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
            <span>Pop</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onPeek}
            disabled={stack.isAnimating || stack.top < 0}
            className="w-full py-3 bg-yellow-600 hover:bg-yellow-700 disabled:bg-slate-600 
                     disabled:cursor-not-allowed text-white font-medium rounded-lg 
                     transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>Peek</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onReset}
            disabled={stack.isAnimating}
            className="w-full py-3 bg-gray-600 hover:bg-gray-700 disabled:bg-slate-600 
                     disabled:cursor-not-allowed text-white font-medium rounded-lg 
                     transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Reset</span>
          </motion.button>
        </div>

        {/* Quick Actions */}
        <div className="pt-4 border-t border-slate-700">
          <p className="text-sm text-slate-400 mb-3">Quick Actions:</p>
          <div className="flex flex-wrap gap-2">
            {[1, 5, 10, 25, 50].map((value) => (
              <motion.button
                key={value}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onPush(value)}
                disabled={stack.isAnimating || stack.top >= stack.maxSize - 1}
                className="px-3 py-1 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 
                         disabled:cursor-not-allowed text-slate-300 text-sm rounded 
                         transition-colors duration-200"
              >
                +{value}
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}