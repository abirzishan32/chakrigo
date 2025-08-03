"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { getQuickSortSteps, SortStep } from './visualizer-adapter';
import { Play, Pause, RotateCcw, Shuffle, Zap, Code, BookOpen, Settings } from 'lucide-react';
import PremiumVisualization from './PremiumVisualization';
import InteractiveTimeline from './InteractiveTimeline';
import SmartSidebar from './SmartSidebar';
import MediaControls from './MediaControls';

export default function QuickSortVisualizer() {
  const [array, setArray] = useState<number[]>([]);
  const [steps, setSteps] = useState<SortStep[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [animationSpeed, setAnimationSpeed] = useState<number>(800);
  const [arraySize, setArraySize] = useState<number>(12);
  const [maxValue, setMaxValue] = useState<number>(100);
  const [showCode, setShowCode] = useState<boolean>(true);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [arraySource, setArraySource] = useState<'random' | 'custom'>('random');
  
  const animationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isFirstRender = useRef(true);

  // Generate a beautifully random array
  const generateArray = useCallback((size?: number, max?: number) => {
    const actualSize = size || arraySize;
    const actualMax = max || maxValue;
    
    const newArray: number[] = [];
    for (let i = 0; i < actualSize; i++) {
      newArray.push(Math.floor(Math.random() * actualMax) + 1);
    }
    
    setArray(newArray);
    setSteps([]);
    setCurrentStep(-1);
    setIsPlaying(false);
    setArraySource('random');
    
    // Clear any existing timer
    if (animationTimerRef.current) {
      clearTimeout(animationTimerRef.current);
      animationTimerRef.current = null;
    }
  }, [arraySize, maxValue]);

  // Handle custom array input
  const handleCustomArray = useCallback((customArray: number[]) => {
    setArray(customArray);
    setSteps([]);
    setCurrentStep(-1);
    setIsPlaying(false);
    setArraySource('custom');
    
    // Clear any existing timer
    if (animationTimerRef.current) {
      clearTimeout(animationTimerRef.current);
      animationTimerRef.current = null;
    }
  }, []);

  // Enhanced play/pause functionality
  const togglePlayback = useCallback(() => {
    if (array.length === 0) return;
    
    if (!isPlaying) {
      // Starting or resuming playback
      if (steps.length === 0) {
        const sortingSteps = getQuickSortSteps([...array]);
        setSteps(sortingSteps);
        setCurrentStep(0);
      } else if (currentStep === -1) {
        setCurrentStep(0);
      } else if (currentStep >= steps.length - 1) {
        // Restart from beginning if at end
        setCurrentStep(0);
      }
      setIsPlaying(true);
    } else {
      // Pausing
      setIsPlaying(false);
      if (animationTimerRef.current) {
        clearTimeout(animationTimerRef.current);
        animationTimerRef.current = null;
      }
    }
  }, [array, isPlaying, steps, currentStep]);

  // Reset to beginning
  const resetVisualization = useCallback(() => {
    setIsPlaying(false);
    setCurrentStep(-1);
    if (animationTimerRef.current) {
      clearTimeout(animationTimerRef.current);
      animationTimerRef.current = null;
    }
  }, []);

  // Jump to specific step (for timeline scrubbing)
  const jumpToStep = useCallback((step: number) => {
    setCurrentStep(step);
    setIsPlaying(false);
    if (animationTimerRef.current) {
      clearTimeout(animationTimerRef.current);
      animationTimerRef.current = null;
    }
  }, []);

  // Calculate steps when array changes
  useEffect(() => {
    if (array.length > 0 && !isFirstRender.current) {
      const sortingSteps = getQuickSortSteps([...array]);
      setSteps(sortingSteps);
      setCurrentStep(-1);
      setIsPlaying(false);
    }
  }, [array]);

  // Handle animation stepping with smooth timing
  useEffect(() => {
    if (isPlaying && currentStep >= 0 && currentStep < steps.length - 1) {
      animationTimerRef.current = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, animationSpeed);
    } else if (isPlaying && currentStep >= steps.length - 1) {
      setIsPlaying(false);
    }

    return () => {
      if (animationTimerRef.current) {
        clearTimeout(animationTimerRef.current);
      }
    };
  }, [isPlaying, currentStep, steps, animationSpeed]);

  // Generate initial array on first render
  useEffect(() => {
    if (isFirstRender.current) {
      generateArray();
      isFirstRender.current = false;
    }

    return () => {
      if (animationTimerRef.current) {
        clearTimeout(animationTimerRef.current);
      }
    };
  }, [generateArray]);

  // Get current step data with fallback
  const getCurrentStepData = (): SortStep => {
    if (currentStep >= 0 && currentStep < steps.length) {
      return steps[currentStep];
    }
    return {
      array: array,
      comparingIndices: [],
      swappedIndices: [],
      sortedIndices: []
    };
  };

  const isCompleted = currentStep >= steps.length - 1 && steps.length > 0;
  const progressPercent = steps.length > 0 ? Math.max(0, Math.min(100, (currentStep / (steps.length - 1)) * 100)) : 0;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-gray-900 dark:to-slate-800">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(59,130,246,0.15)_1px,transparent_0)] [background-size:24px_24px] dark:opacity-30"></div>
      
      {/* Header */}
      <header className="relative z-10 border-b border-white/10 backdrop-blur-md bg-white/5 dark:bg-black/5 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    QuickSort Visualizer
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Interactive Algorithm Learning
                    {arraySource === 'custom' && (
                      <span className="ml-2 px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded-full">
                        Custom Array
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowCode(!showCode)}
                className={`p-2 rounded-lg transition-colors ${
                  showCode 
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' 
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                }`}
                title="Toggle Code View"
              >
                <Code className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2 rounded-lg transition-colors ${
                  showSettings 
                    ? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' 
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                }`}
                title="Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 min-h-0">
        {/* Visualization Workspace */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Array Info Banner */}
          {array.length > 0 && (
            <div className="px-8 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-b border-blue-200 dark:border-blue-800 flex-shrink-0">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-4">
                  <span className="text-blue-700 dark:text-blue-300">
                    <strong>Array:</strong> [{array.join(', ')}]
                  </span>
                  <span className="text-blue-600 dark:text-blue-400">
                    Length: {array.length}
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  {arraySource === 'custom' && (
                    <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded-full font-medium">
                      Custom Input
                    </span>
                  )}
                  <span className="text-blue-600 dark:text-blue-400">
                    Min: {Math.min(...array)} | Max: {Math.max(...array)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Main Visualization Area - Scrollable */}
          <div className="flex-1 overflow-auto">
            <div className="min-h-full flex flex-col justify-center p-8">
              <PremiumVisualization
                step={getCurrentStepData()}
                isPlaying={isPlaying}
                isCompleted={isCompleted}
                onBarClick={(index) => console.log('Bar clicked:', index)}
              />
              
              {/* Integrated Timeline with Controls */}
              <div className="mt-8 space-y-6">
                <InteractiveTimeline
                  currentStep={currentStep}
                  totalSteps={steps.length}
                  onStepChange={jumpToStep}
                  isPlaying={isPlaying}
                  progressPercent={progressPercent}
                />
                
                {/* Consolidated Media Controls */}
                <MediaControls
                  isPlaying={isPlaying}
                  onPlayPause={togglePlayback}
                  onReset={resetVisualization}
                  onShuffle={() => generateArray()}
                  animationSpeed={animationSpeed}
                  onSpeedChange={setAnimationSpeed}
                  arraySize={arraySize}
                  onArraySizeChange={setArraySize}
                  maxValue={maxValue}
                  onMaxValueChange={setMaxValue}
                  onGenerate={generateArray}
                  showSettings={showSettings}
                  disabled={false}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Smart Sidebar - Scrollable */}
        {showCode && (
          <div className="w-96 border-l border-white/10 backdrop-blur-md bg-white/5 dark:bg-black/5 flex flex-col min-h-0">
            <SmartSidebar
              currentStep={currentStep}
              steps={steps}
              stepData={getCurrentStepData()}
              isPlaying={isPlaying}
              progressPercent={progressPercent}
              arraySource={arraySource}
            />
          </div>
        )}
      </div>
    </div>
  );
}