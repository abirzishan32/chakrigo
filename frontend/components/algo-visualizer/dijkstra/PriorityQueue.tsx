"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PriorityQueueProps {
  items: {
    node: string;
    distance: number;
  }[];
  currentNode: string;
}

export default function PriorityQueue({ items, currentNode }: PriorityQueueProps) {
  // Sort the queue by distance for display
  const sortedItems = [...items].sort((a, b) => a.distance - b.distance);
  
  return (
    <div className="h-full">
      <h2 className="text-lg font-semibold mb-2">Priority Queue</h2>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
        Nodes ordered by distance from start
      </p>
      
      {/* Queue visualization */}
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {sortedItems.length > 0 ? (
          <AnimatePresence>
            {sortedItems.map((item, index) => (
              <motion.div
                key={`${item.node}-${index}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className={`flex justify-between items-center rounded-md px-3 py-2 text-sm border
                          ${item.node === currentNode 
                            ? 'bg-red-100 border-red-300 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300' 
                            : 'bg-gray-50 border-gray-200 dark:bg-gray-700 dark:border-gray-600'
                          }
                          ${index === 0 ? 'border-t-2 border-t-indigo-500 dark:border-t-indigo-500' : ''}
                        `}
              >
                <span className="font-medium">{item.node}</span>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-mono ${
                    item.distance === Infinity 
                      ? 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300' 
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                  }`}>
                    {item.distance === Infinity ? '∞' : item.distance}
                  </span>
                  {index === 0 && (
                    <span className="text-xs bg-indigo-200 dark:bg-indigo-800 px-1.5 py-0.5 rounded">
                      Next
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <div className="text-xs text-gray-500 italic text-center py-4">
            Priority queue is empty
          </div>
        )}
      </div>
      
      <div className="mt-2 text-xs text-gray-500">
        Next node to visit is at the top
      </div>
    </div>
  );
}