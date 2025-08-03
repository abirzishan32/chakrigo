"use client";

import { useState, useEffect, useRef } from 'react';
import { getQuickSortSteps, SortStep } from './visualizer-adapter';
import ArrayControls from './ArrayControls';
import SortingAnimation from './SortingAnimation';
import AlgorithmExplanation from './AlgorithmExplanation';

export default function QuickSortVisualizer() {
  const [array, setArray] = useState<number[]>([]);
  const [steps, setSteps] = useState<SortStep[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(-1);
  const [isSorting, setIsSorting] = useState<boolean>(false);
  const [sortingSpeed, setSortingSpeed] = useState<number>(500); // ms per step
  
  const animationTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Generate a random array
  const generateArray = (size: number, maxValue: number) => {
    const newArray: number[] = [];
    for (let i = 0; i < size; i++) {
      newArray.push(Math.floor(Math.random() * maxValue) + 1);
    }
    setArray(newArray);
    setSteps([]);
    setCurrentStep(-1);
    setIsSorting(false);
  };
  
  // Start the sorting animation
  const startSorting = () => {
    if (array.length === 0) return;
    
    if (steps.length === 0) {
      const sortingSteps = getQuickSortSteps([...array]);
      setSteps(sortingSteps);
      setCurrentStep(0);
    } else {
      setCurrentStep(currentStep < 0 ? 0 : currentStep);
    }
    
    setIsSorting(true);
  };
  
  // Stop the sorting animation
  const stopSorting = () => {
    setIsSorting(false);
    if (animationTimerRef.current) {
      clearTimeout(animationTimerRef.current);
      animationTimerRef.current = null;
    }
  };
  
  // Reset the animation
  const resetSorting = () => {
    stopSorting();
    setCurrentStep(-1);
  };
  
  // Change the sorting speed
  const changeSpeed = (speed: number) => {
    setSortingSpeed(speed);
  };
  
  // Calculate steps when array changes
  useEffect(() => {
    if (array.length > 0) {
      const sortingSteps = getQuickSortSteps([...array]);
      setSteps(sortingSteps);
      setCurrentStep(-1);
    }
  }, [array]);
  
  // Handle animation stepping
  useEffect(() => {
    if (isSorting && currentStep >= 0 && currentStep < steps.length - 1) {
      animationTimerRef.current = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, sortingSpeed);
    } else if (isSorting && currentStep >= steps.length - 1) {
      setIsSorting(false);
    }
    
    return () => {
      if (animationTimerRef.current) {
        clearTimeout(animationTimerRef.current);
      }
    };
  }, [isSorting, currentStep, steps, sortingSpeed]);
  
  // Generate initial array on first render
  useEffect(() => {
    generateArray(10, 100);
    
    return () => {
      if (animationTimerRef.current) {
        clearTimeout(animationTimerRef.current);
      }
    };
  }, []);
  
  // Get current step data
  const getCurrentStepData = (): SortStep => {
    if (currentStep >= 0 && currentStep < steps.length) {
      return steps[currentStep];
    }
    return {
      array,
      comparingIndices: [],
      swappedIndices: [],
      sortedIndices: []
    };
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Quick Sort Visualization</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ArrayControls 
            onGenerate={generateArray} 
            onStart={startSorting}
            onStop={stopSorting}
            onReset={resetSorting}
            onSpeedChange={changeSpeed}
            sortingSpeed={sortingSpeed}
            disabled={isSorting}
          />
          
          <SortingAnimation 
            step={getCurrentStepData()}
            isSorting={isSorting}
          />
          
          <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Progress</h3>
            <div className="h-2 w-full bg-gray-300 dark:bg-gray-600 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-200"
                style={{ 
                  width: `${currentStep >= 0 && steps.length > 0 ? (currentStep / (steps.length - 1)) * 100 : 0}%` 
                }}
              ></div>
            </div>
            <p className="text-sm mt-2 text-center">
              {currentStep >= 0 && steps.length > 0
                ? `Step ${currentStep + 1} of ${steps.length}` 
                : 'Ready to start'}
            </p>
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <AlgorithmExplanation 
            currentStep={currentStep}
            steps={steps}
          />
        </div>
      </div>
    </div>
  );
}