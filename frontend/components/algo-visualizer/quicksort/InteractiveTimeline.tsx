"use client";

import { useState, useRef, useEffect } from 'react';

interface InteractiveTimelineProps {
  currentStep: number;
  totalSteps: number;
  onStepChange: (step: number) => void;
  isPlaying: boolean;
  progressPercent: number;
}

export default function InteractiveTimeline({
  currentStep,
  totalSteps,
  onStepChange,
  isPlaying,
  progressPercent
}: InteractiveTimelineProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [hoverStep, setHoverStep] = useState<number | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (totalSteps <= 1) return;
    
    setIsDragging(true);
    updateStepFromEvent(e);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || totalSteps <= 1) return;
    updateStepFromEvent(e);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const updateStepFromEvent = (e: React.MouseEvent) => {
    if (!timelineRef.current) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    const newStep = Math.round(percentage * (totalSteps - 1));
    
    onStepChange(newStep);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (totalSteps <= 1) return;

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        onStepChange(Math.max(0, currentStep - 1));
        break;
      case 'ArrowRight':
        e.preventDefault();
        onStepChange(Math.min(totalSteps - 1, currentStep + 1));
        break;
      case 'Home':
        e.preventDefault();
        onStepChange(0);
        break;
      case 'End':
        e.preventDefault();
        onStepChange(totalSteps - 1);
        break;
    }
  };

  // Global mouse events for dragging
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDragging || !timelineRef.current || totalSteps <= 1) return;
      
      const rect = timelineRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(1, x / rect.width));
      const newStep = Math.round(percentage * (totalSteps - 1));
      
      onStepChange(newStep);
    };

    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, totalSteps, onStepChange]);

  const isDisabled = totalSteps <= 1;

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Step Info */}
      <div className="flex justify-between items-center mb-3">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Step {Math.max(0, currentStep)} of {Math.max(0, totalSteps - 1)}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {isDisabled ? 'Generate array to begin' : `${progressPercent.toFixed(0)}% Complete`}
        </div>
      </div>

      {/* Timeline Track */}
      <div
        ref={timelineRef}
        className={`relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner ${
          isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        }`}
        onMouseDown={!isDisabled ? handleMouseDown : undefined}
        onMouseMove={!isDisabled ? handleMouseMove : undefined}
        onMouseUp={!isDisabled ? handleMouseUp : undefined}
        onKeyDown={!isDisabled ? handleKeyDown : undefined}
        tabIndex={isDisabled ? -1 : 0}
        role="slider"
        aria-valuemin={0}
        aria-valuemax={totalSteps - 1}
        aria-valuenow={currentStep}
        aria-label="Algorithm step timeline"
      >
        {/* Progress Fill */}
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-300 ease-out"
          style={{ width: `${isDisabled ? 0 : progressPercent}%` }}
        />

        {/* Animated Progress (when playing) */}
        {isPlaying && !isDisabled && (
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-400 to-cyan-400 opacity-50 animate-pulse"
            style={{ width: `${progressPercent}%` }}
          />
        )}

        {/* Step Markers */}
        {!isDisabled && totalSteps > 1 && (
          <div className="absolute inset-0">
            {Array.from({ length: Math.min(totalSteps, 20) }, (_, i) => {
              const step = Math.round((i / Math.min(19, totalSteps - 1)) * (totalSteps - 1));
              const position = (step / (totalSteps - 1)) * 100;
              
              return (
                <div
                  key={step}
                  className="absolute top-1/2 transform -translate-y-1/2 w-0.5 h-2 bg-white/50 dark:bg-gray-800/50"
                  style={{ left: `${position}%` }}
                />
              );
            })}
          </div>
        )}

        {/* Scrubber Handle */}
        {!isDisabled && (
          <div
            className={`absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-6 h-6 bg-white dark:bg-gray-200 rounded-full shadow-lg border-2 border-blue-500 transition-all duration-200 ${
              isDragging ? 'scale-125 shadow-xl' : 'hover:scale-110'
            }`}
            style={{ left: `${progressPercent}%` }}
          >
            <div className="absolute inset-1 bg-blue-500 rounded-full"></div>
          </div>
        )}
      </div>

      {/* Keyboard Instructions */}
      {!isDisabled && (
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
          Use ← → arrow keys, Home, End, or drag to navigate
        </div>
      )}
    </div>
  );
}