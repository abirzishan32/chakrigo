"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StackState } from './StackVisualizer';

interface StackArrayProps {
  stack: StackState;
  peekHighlight: boolean;
}

export function StackArray({ stack, peekHighlight }: StackArrayProps) {
  return (
    <div className="flex flex-col items-center space-y-8">
      {/* Top Pointer */}
      <div className="relative w-full max-w-4xl">
        <div className="flex justify-center">
          <AnimatePresence>
            {stack.top >= 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  x: (stack.top - 3.5) * 80,
                  scale: peekHighlight ? 1.2 : 1
                }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 300, 
                  damping: 30,
                  scale: { duration: 0.2 }
                }}
                className={`flex flex-col items-center ${peekHighlight ? 'text-yellow-400' : 'text-blue-400'}`}
              >
                <div className="text-sm font-semibold mb-1">TOP</div>
                <motion.div
                  animate={{ 
                    rotate: peekHighlight ? [0, -10, 10, -10, 10, 0] : 0,
                  }}
                  transition={{ duration: 0.5 }}
                  className="text-2xl"
                >
                  ↓
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Stack Array */}
      <div className="flex space-x-2 p-6 bg-slate-700/50 rounded-lg">
        {stack.data.map((value, index) => (
          <motion.div
            key={index}
            className={`
              relative w-16 h-16 border-2 rounded-lg flex items-center justify-center
              text-lg font-semibold transition-all duration-300
              ${index <= stack.top 
                ? 'border-blue-400 bg-blue-900/30' 
                : 'border-slate-600 bg-slate-800'
              }
              ${index === stack.top && peekHighlight 
                ? 'ring-2 ring-yellow-400 ring-opacity-60' 
                : ''
              }
            `}
            animate={{
              scale: index === stack.top && peekHighlight ? 1.1 : 1,
              boxShadow: index === stack.top && peekHighlight 
                ? '0 0 20px rgba(250, 204, 21, 0.3)'
                : '0 0 0px rgba(0, 0, 0, 0)'
            }}
            whileHover={{ scale: 1.05 }}
          >
            <AnimatePresence mode="wait">
              {value !== null && (
                <motion.span
                  key={`${index}-${value}`}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.2 }}
                  className={`
                    ${index <= stack.top ? 'text-blue-200' : 'text-slate-500'}
                    ${index === stack.top && peekHighlight ? 'text-yellow-300' : ''}
                  `}
                >
                  {value}
                </motion.span>
              )}
            </AnimatePresence>
            
            {/* Error animation for overflow */}
            {stack.error?.includes('Overflow') && index === stack.top + 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 0.6, repeat: 2 }}
                className="absolute inset-0 border-2 border-red-500 rounded-lg bg-red-500/20"
              />
            )}
          </motion.div>
        ))}
      </div>

      {/* Array Indices */}
      <div className="flex space-x-2">
        {stack.data.map((_, index) => (
          <div
            key={index}
            className="w-16 text-center text-sm text-slate-400 font-mono"
          >
            [{index}]
          </div>
        ))}
      </div>

      {/* Stack Info */}
      <div className="text-center space-y-2">
        <div className="text-lg">
          <span className="text-slate-400">Size: </span>
          <span className="text-blue-400 font-semibold">{stack.top + 1}</span>
          <span className="text-slate-400"> / {stack.maxSize}</span>
        </div>
        {stack.lastOperation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-slate-400"
          >
            Last operation: <span className="text-green-400">{stack.lastOperation}</span>
          </motion.div>
        )}
      </div>
    </div>
  );
}