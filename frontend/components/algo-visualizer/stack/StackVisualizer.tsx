"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StackArray } from './StackArray';
import { StackControls } from './StackControls';


export interface StackState {
  data: (number | null)[];
  top: number;
  maxSize: number;
  isAnimating: boolean;
  error: string | null;
  lastOperation: string | null;
}

export function StackVisualizer() {
  const [stack, setStack] = useState<StackState>({
    data: new Array(8).fill(null),
    top: -1,
    maxSize: 8,
    isAnimating: false,
    error: null,
    lastOperation: null,
  });

  const [inputValue, setInputValue] = useState<string>('');
  const [peekHighlight, setPeekHighlight] = useState<boolean>(false);
  const [operationHistory, setOperationHistory] = useState<string[]>([]);

  // Clear error after 3 seconds
  useEffect(() => {
    if (stack.error) {
      const timer = setTimeout(() => {
        setStack(prev => ({ ...prev, error: null }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [stack.error]);

  // Clear peek highlight after 2 seconds
  useEffect(() => {
    if (peekHighlight) {
      const timer = setTimeout(() => {
        setPeekHighlight(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [peekHighlight]);

  const addToHistory = (operation: string) => {
    setOperationHistory(prev => [...prev.slice(-4), operation]);
  };

  const push = async (value: number) => {
    if (stack.isAnimating) return;
    
    if (stack.top >= stack.maxSize - 1) {
      setStack(prev => ({ 
        ...prev, 
        error: "Overflow! Stack is full.",
        lastOperation: `Push(${value}) - FAILED`
      }));
      addToHistory(`Push(${value}) - OVERFLOW`);
      return;
    }

    setStack(prev => ({ ...prev, isAnimating: true, error: null }));
    
    // Animate the push operation
    await new Promise(resolve => setTimeout(resolve, 100));
    
    setStack(prev => {
      const newData = [...prev.data];
      const newTop = prev.top + 1;
      newData[newTop] = value;
      
      return {
        ...prev,
        data: newData,
        top: newTop,
        isAnimating: false,
        lastOperation: `Push(${value})`
      };
    });

    addToHistory(`Push(${value})`);
    setInputValue('');
  };

  const pop = async () => {
    if (stack.isAnimating) return;
    
    if (stack.top < 0) {
      setStack(prev => ({ 
        ...prev, 
        error: "Underflow! Stack is empty.",
        lastOperation: "Pop() - FAILED"
      }));
      addToHistory("Pop() - UNDERFLOW");
      return;
    }

    const poppedValue = stack.data[stack.top];
    setStack(prev => ({ ...prev, isAnimating: true, error: null }));
    
    // Animate the pop operation
    await new Promise(resolve => setTimeout(resolve, 300));
    
    setStack(prev => {
      const newData = [...prev.data];
      newData[prev.top] = null;
      
      return {
        ...prev,
        data: newData,
        top: prev.top - 1,
        isAnimating: false,
        lastOperation: `Pop() → ${poppedValue}`
      };
    });

    addToHistory(`Pop() → ${poppedValue}`);
  };

  const peek = () => {
    if (stack.isAnimating) return;
    
    if (stack.top < 0) {
      setStack(prev => ({ 
        ...prev, 
        error: "Underflow! Stack is empty.",
        lastOperation: "Peek() - FAILED"
      }));
      addToHistory("Peek() - UNDERFLOW");
      return;
    }

    const topValue = stack.data[stack.top];
    setPeekHighlight(true);
    setStack(prev => ({ 
      ...prev, 
      lastOperation: `Peek() → ${topValue}`
    }));
    addToHistory(`Peek() → ${topValue}`);
  };

  const reset = () => {
    if (stack.isAnimating) return;
    
    setStack({
      data: new Array(8).fill(null),
      top: -1,
      maxSize: 8,
      isAnimating: false,
      error: null,
      lastOperation: "Reset()"
    });
    setInputValue('');
    setPeekHighlight(false);
    setOperationHistory([]);
    addToHistory("Reset()");
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white font-inter">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent"
          >
            Stack Visualizer
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-400 max-w-2xl mx-auto"
          >
            Interactive visualization of array-based stack implementation with push, pop, and peek operations
          </motion.p>
        </div>

        {/* Error Display */}
        <AnimatePresence>
          {stack.error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              className="mb-6 mx-auto max-w-md"
            >
              <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <svg className="w-6 h-6 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-semibold text-red-400">Error</span>
                </div>
                <p className="text-red-300">{stack.error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Stack Visualization */}
          <div className="xl:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-slate-800 rounded-lg shadow-xl p-8"
            >
              <h2 className="text-2xl font-semibold mb-6 text-center">Array Implementation</h2>
              <StackArray 
                stack={stack} 
                peekHighlight={peekHighlight}
              />
            </motion.div>
          </div>

          {/* Controls and Stats */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <StackControls
                stack={stack}
                inputValue={inputValue}
                setInputValue={setInputValue}
                onPush={push}
                onPop={pop}
                onPeek={peek}
                onReset={reset}
              />
            </motion.div>

            
          </div>
        </div>

       
      </div>
    </div>
  );
}