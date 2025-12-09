"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LoadingAnimationProps {
  progress?: number;
  stage?: string;
  stageDescription?: string;
}

const educationalTips = [
  {
    emoji: "🎯",
    title: "Visual + Text Learning",
    description: "Every visual scene is followed by clear text explanations (15-30 seconds) for deeper understanding"
  },
  {
    emoji: "🌈",
    title: "Color-Coded Knowledge",
    description: "YELLOW for descriptions • WHITE for explanations • GREEN for connections • ORANGE for insights • BLUE for reflections"
  },
  {
    emoji: "📊",
    title: "Font Hierarchy Matters",
    description: "We use different sizes for clarity: 24px for main points, 20px for details, 18px for prompts"
  },
  {
    emoji: "🎬",
    title: "Context is Everything",
    description: "We explain WHY you're learning this concept and how it connects to what you already know"
  },
  {
    emoji: "🔄",
    title: "Multiple Perspectives",
    description: "Geometric, algebraic, numerical, and practical interpretations for complete understanding"
  },
  {
    emoji: "⚠️",
    title: "Addressing Misconceptions",
    description: "We show incorrect approaches, explain why they fail, and demonstrate correct thinking"
  },
  {
    emoji: "🧠",
    title: "Memory Aids Built-In",
    description: "Visual mnemonics, consistent color coding, and familiar patterns help you remember"
  },
  {
    emoji: "🤔",
    title: "Interactive Questions",
    description: "Questions posed throughout keep you engaged: 'What would happen if...?' scenarios"
  },
  {
    emoji: "📖",
    title: "Complete Story Arc",
    description: "Beginning: Set up the problem • Middle: Explore multiple angles • End: Synthesize understanding"
  },
  {
    emoji: "🎨",
    title: "Animation Techniques",
    description: "Zoom for emphasis • Rotation for perspective • Morphing for evolution • Highlighting for attention"
  },
  {
    emoji: "↔️",
    title: "Movement Shows Relationships",
    description: "Objects shift, scale, and change colors to demonstrate connections and importance"
  },
  {
    emoji: "✅",
    title: "Quality Validation",
    description: "No overlapping elements • Perfect 16:9 viewing area • 3-second hold for complex concepts"
  },
  {
    emoji: "🎯",
    title: "Progressive Complexity",
    description: "We start simple and gradually build complexity for natural, comfortable learning"
  },
  {
    emoji: "🔗",
    title: "Building on Knowledge",
    description: "'Remember when we learned X? This builds on that...' connects to your existing understanding"
  },
  {
    emoji: "💡",
    title: "Visual Metaphors",
    description: "Consistent animation patterns and visual metaphors reinforce learning throughout"
  }
];

export function LoadingAnimation({ 
  progress = 0, 
  stage = "starting", 
  stageDescription = "Initializing..." 
}: LoadingAnimationProps) {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % educationalTips.length);
    }, 4500); // Change tip every 4.5 seconds

    return () => clearInterval(interval);
  }, []);

  const currentTip = educationalTips[currentTipIndex];

  return (
    <div className="absolute inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-20">
      {/* Animated background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Main content - Fixed layout with absolute positioning */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-8">
        {/* Subtle stage description at top - FIXED POSITION */}
        <div className="absolute top-0 left-0 right-0 text-center">
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-gray-500 uppercase tracking-wider"
          >
            {stageDescription}
          </motion.p>
        </div>

        {/* Animated spinner - FIXED POSITION */}
        <div className="absolute top-16 left-1/2 -translate-x-1/2">
          <motion.div
            className="w-12 h-12"
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          >
            <div className="w-12 h-12 border-3 border-purple-500/30 border-t-purple-500 rounded-full" />
          </motion.div>
        </div>

        {/* Educational tips container - FIXED HEIGHT & POSITION */}
        <div className="absolute top-36 left-0 right-0 text-center h-80 flex flex-col items-center justify-start">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTipIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="w-full"
            >
              {/* Emoji - FIXED SIZE */}
              <motion.div
                className="text-5xl h-16 flex items-center justify-center mb-6"
              >
                {currentTip.emoji}
              </motion.div>

              {/* Title - FIXED HEIGHT */}
              <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent h-16 flex items-center justify-center mb-4 px-4">
                {currentTip.title}
              </h3>

              {/* Description - FIXED HEIGHT */}
              <div className="h-24 flex items-start justify-center px-8">
                <p className="text-base text-gray-300 leading-relaxed max-w-2xl">
                  {currentTip.description}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Progress dots indicator - FIXED POSITION */}
        <div className="absolute bottom-20 left-0 right-0 flex justify-center gap-2">
          {educationalTips.map((_, index) => (
            <motion.div
              key={index}
              className={`h-2 rounded-full transition-all duration-500 ${
                index === currentTipIndex 
                  ? 'w-10 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500' 
                  : 'w-2 bg-gray-700'
              }`}
              animate={{
                scale: index === currentTipIndex ? 1.2 : 1
              }}
            />
          ))}
        </div>

        {/* Bottom message - FIXED POSITION */}
        <div className="absolute bottom-8 left-0 right-0 text-center">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-sm text-gray-500 italic"
          >
            Crafting your personalized educational animation...
          </motion.p>
        </div>
      </div>

      {/* Floating particles for ambient effect */}
      <AnimatePresence>
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 bg-purple-400/40 rounded-full"
            initial={{ 
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              opacity: 0,
              scale: 0
            }}
            animate={{ 
              y: [null, Math.random() * window.innerHeight],
              opacity: [0, 0.6, 0],
              scale: [0, 1.5, 0]
            }}
            transition={{ 
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: i * 0.7,
              ease: "easeInOut"
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
} 
