"use client";

import { useState, useEffect } from 'react';
import { SortStep } from './visualizer-adapter';
import { 
  Code, 
  BookOpen, 
  Activity, 
  ChevronRight, 
  ChevronDown, 
  Zap, 
  Target,
  BarChart3,
  Clock,
  TrendingUp,
  Edit3
} from 'lucide-react';

interface SmartSidebarProps {
  currentStep: number;
  steps: SortStep[];
  stepData: SortStep;
  isPlaying: boolean;
  progressPercent: number;
  arraySource?: 'random' | 'custom';
}

export default function SmartSidebar({
  currentStep,
  steps,
  stepData,
  isPlaying,
  progressPercent,
  arraySource = 'random'
}: SmartSidebarProps) {
  const [activeTab, setActiveTab] = useState<'explanation' | 'code' | 'analysis'>('explanation');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Get current explanation based on step
  const getCurrentExplanation = () => {
    if (currentStep === -1 || steps.length === 0) {
      return {
        title: "QuickSort Algorithm",
        content: arraySource === 'custom' 
          ? "QuickSort will now sort your custom array using the divide-and-conquer approach. Watch how it selects pivots and partitions your specific data!"
          : "QuickSort is a highly efficient divide-and-conquer sorting algorithm. It works by selecting a 'pivot' element and partitioning the array around it.",
        phase: "Ready"
      };
    }
    
    if (currentStep >= steps.length) {
      return {
        title: "Sorting Complete!",
        content: arraySource === 'custom'
          ? "Your custom array has been successfully sorted using QuickSort! Notice how the algorithm adapted to your specific data patterns."
          : "The array has been successfully sorted using the QuickSort algorithm. All elements are now in ascending order.",
        phase: "Complete"
      };
    }
    
    const step = stepData;
    
    // Analyze current step
    if (step.swappedIndices?.length === 2) {
      const [i, j] = step.swappedIndices;
      if (step.pivotIndex === i || step.pivotIndex === j) {
        return {
          title: "Pivot Placement",
          content: `Moving the pivot element ${step.array[step.pivotIndex!]} to its final sorted position. This ensures all smaller elements are to the left and larger elements are to the right.`,
          phase: "Partitioning"
        };
      } else {
        return {
          title: "Element Swap",
          content: `Swapping elements ${step.array[i]} and ${step.array[j]} to maintain the partition invariant: elements smaller than pivot on the left, larger on the right.`,
          phase: "Partitioning"
        };
      }
    }
    
    if (step.comparingIndices?.length === 2) {
      const [i, j] = step.comparingIndices;
      return {
        title: "Comparison",
        content: `Comparing element ${step.array[i]} at index ${i} with pivot ${step.array[j]} at index ${j}. Deciding whether to place it in the left or right partition.`,
        phase: "Comparing"
      };
    }
    
    if (step.pivotIndex !== undefined && step.partitionRange) {
      const [start, end] = step.partitionRange;
      return {
        title: "Pivot Selection",
        content: `Selected ${step.array[step.pivotIndex]} as pivot for range [${start}, ${end}]. Now partitioning elements around this pivot value.`,
        phase: "Pivot Selection"
      };
    }
    
    if (step.sortedIndices?.length === step.array.length) {
      return {
        title: "Algorithm Complete",
        content: "All elements have been sorted! QuickSort has successfully arranged the array in ascending order.",
        phase: "Complete"
      };
    }
    
    return {
      title: "Processing",
      content: "QuickSort is processing the array, dividing it into smaller subarrays and sorting them recursively.",
      phase: "Processing"
    };
  };

  // Calculate algorithm statistics
  const getAnalytics = () => {
    const totalElements = stepData.array.length;
    const sortedElements = stepData.sortedIndices?.length || 0;
    const remainingElements = totalElements - sortedElements;
    const currentPartitionSize = stepData.partitionRange 
      ? stepData.partitionRange[1] - stepData.partitionRange[0] + 1 
      : totalElements;

    // Array characteristics analysis
    const originalArray = stepData.array;
    const uniqueValues = new Set(originalArray).size;
    const duplicates = totalElements - uniqueValues;
    const range = Math.max(...originalArray) - Math.min(...originalArray);

    return {
      totalElements,
      sortedElements,
      remainingElements,
      currentPartitionSize,
      efficiency: sortedElements / totalElements,
      estimatedComplexity: `O(n log n) - O(n²)`,
      uniqueValues,
      duplicates,
      range,
      isCustomArray: arraySource === 'custom'
    };
  };

  const explanation = getCurrentExplanation();
  const analytics = getAnalytics();

  // QuickSort pseudocode with highlighting
  const quickSortCode = `function quickSort(arr, low, high) {
    if (low < high) {
        // Select pivot and partition
        pivotIndex = partition(arr, low, high);
        
        // Recursively sort left partition
        quickSort(arr, low, pivotIndex - 1);
        
        // Recursively sort right partition  
        quickSort(arr, pivotIndex + 1, high);
    }
}

function partition(arr, low, high) {
    pivot = arr[high];  // Choose rightmost as pivot
    i = low - 1;        // Index of smaller element
    
    for (j = low; j < high; j++) {
        if (arr[j] < pivot) {
            i++;
            swap(arr[i], arr[j]);
        }
    }
    swap(arr[i + 1], arr[high]);
    return i + 1;
}`;

  const getHighlightedCode = () => {
    const lines = quickSortCode.split('\n');
    return lines.map((line, index) => {
      let isHighlighted = false;
      let highlightClass = '';

      // Highlight based on current step
      if (stepData.pivotIndex !== undefined && line.includes('pivot = arr[high]')) {
        isHighlighted = true;
        highlightClass = 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300';
      } else if (stepData.comparingIndices?.length && line.includes('if (arr[j] < pivot)')) {
        isHighlighted = true;
        highlightClass = 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
      } else if (stepData.swappedIndices?.length && line.includes('swap(')) {
        isHighlighted = true;
        highlightClass = 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
      }

      return (
        <div
          key={index}
          className={`px-3 py-1 text-sm font-mono transition-all duration-300 ${
            isHighlighted ? `${highlightClass} border-l-2 border-current` : 'text-gray-700 dark:text-gray-300'
          }`}
        >
          <span className="text-gray-400 dark:text-gray-600 mr-3 select-none">
            {String(index + 1).padStart(2, '0')}
          </span>
          {line}
        </div>
      );
    });
  };

  const tabs = [
    { id: 'explanation', label: 'Explanation', icon: BookOpen },
    { id: 'code', label: 'Code', icon: Code },
    { id: 'analysis', label: 'Analysis', icon: BarChart3 }
  ] as const;

  return (
    <div className="h-full flex flex-col min-h-0">
      {/* Header - Fixed */}
      <div className="p-6 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Activity className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Algorithm Insights
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
              Step {Math.max(0, currentStep)} of {Math.max(0, steps.length - 1)}
              {analytics.isCustomArray && (
                <span className="ml-2 inline-flex items-center space-x-1">
                  <Edit3 className="w-3 h-3" />
                  <span>Custom data</span>
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="pb-6"> {/* Add bottom padding for safe scrolling */}
          {activeTab === 'explanation' && (
            <div className="p-6 space-y-6">
              {/* Current Phase */}
              <div className="flex items-center space-x-3 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800">
                <div className={`w-3 h-3 rounded-full ${
                  isPlaying ? 'bg-green-400 animate-pulse' : 'bg-gray-400'
                }`}></div>
                <div>
                  <div className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    {explanation.phase}
                  </div>
                  <div className="text-xs text-blue-600 dark:text-blue-400">
                    {Math.round(progressPercent)}% Complete
                  </div>
                </div>
              </div>

              {/* Main Explanation */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  {explanation.title}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {explanation.content}
                </p>
              </div>

              {/* Current Step Details */}
              {currentStep >= 0 && (
                <div className="space-y-3">
                  <h4 className="text-md font-semibold text-gray-900 dark:text-white flex items-center">
                    <Target className="w-4 h-4 mr-2 text-indigo-500" />
                    Current Action
                  </h4>
                  
                  <div className="grid grid-cols-1 gap-3 text-sm">
                    {stepData.pivotIndex !== undefined && (
                      <div className="flex justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <span className="text-purple-700 dark:text-purple-300 font-medium">Pivot</span>
                        <span className="text-purple-900 dark:text-purple-100 font-bold">
                          {stepData.array[stepData.pivotIndex]} (index {stepData.pivotIndex})
                        </span>
                      </div>
                    )}
                    
                    {stepData.partitionRange && (
                      <div className="flex justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <span className="text-blue-700 dark:text-blue-300 font-medium">Range</span>
                        <span className="text-blue-900 dark:text-blue-100 font-bold">
                          [{stepData.partitionRange[0]}, {stepData.partitionRange[1]}]
                        </span>
                      </div>
                    )}
                    
                    {stepData.comparingIndices && stepData.comparingIndices.length > 0 && (
                      <div className="flex justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <span className="text-yellow-700 dark:text-yellow-300 font-medium">Comparing</span>
                        <span className="text-yellow-900 dark:text-yellow-100 font-bold">
                          Indices {stepData.comparingIndices.join(', ')}
                        </span>
                      </div>
                    )}
                    
                    {stepData.swappedIndices && stepData.swappedIndices.length > 0 && (
                      <div className="flex justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <span className="text-red-700 dark:text-red-300 font-medium">Swapped</span>
                        <span className="text-red-900 dark:text-red-100 font-bold">
                          Indices {stepData.swappedIndices.join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Algorithm Properties */}
              <div>
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center w-full text-left text-gray-900 dark:text-white font-semibold mb-3 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  {showAdvanced ? <ChevronDown className="w-4 h-4 mr-2" /> : <ChevronRight className="w-4 h-4 mr-2" />}
                  Algorithm Properties
                </button>
                
                {showAdvanced && (
                  <div className="space-y-3 text-sm">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="text-gray-600 dark:text-gray-400">Time Complexity</div>
                        <div className="font-bold text-gray-900 dark:text-white">O(n log n)</div>
                        <div className="text-xs text-gray-500">Average case</div>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="text-gray-600 dark:text-gray-400">Space Complexity</div>
                        <div className="font-bold text-gray-900 dark:text-white">O(log n)</div>
                        <div className="text-xs text-gray-500">Recursive stack</div>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="text-green-700 dark:text-green-300 font-medium mb-1">Key Advantages</div>
                      <ul className="text-green-600 dark:text-green-400 text-xs space-y-1">
                        <li>• In-place sorting (minimal memory)</li>
                        <li>• Excellent average-case performance</li>
                        <li>• Cache-friendly data access patterns</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'code' && (
            <div className="p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  QuickSort Implementation
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Highlighted lines show current execution
                </p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="overflow-y-auto">
                  {getHighlightedCode()}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analysis' && (
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Real-time Analytics
                  {analytics.isCustomArray && (
                    <span className="ml-2 text-sm font-normal text-purple-600 dark:text-purple-400">
                      (Custom Array)
                    </span>
                  )}
                </h3>
                
                {/* Progress Overview */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-blue-700 dark:text-blue-300 font-medium">Progress</span>
                      <TrendingUp className="w-4 h-4 text-blue-500" />
                    </div>
                    <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                      {Math.round(progressPercent)}%
                    </div>
                    <div className="text-xs text-blue-600 dark:text-blue-400">
                      {analytics.sortedElements} of {analytics.totalElements} sorted
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-green-700 dark:text-green-300 font-medium">Efficiency</span>
                      <Zap className="w-4 h-4 text-green-500" />
                    </div>
                    <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                      {Math.round(analytics.efficiency * 100)}%
                    </div>
                    <div className="text-xs text-green-600 dark:text-green-400">
                      Elements in place
                    </div>
                  </div>
                </div>

                {/* Array Characteristics (for custom arrays) */}
                {analytics.isCustomArray && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                    <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-3 flex items-center">
                      <Edit3 className="w-4 h-4 mr-2" />
                      Your Array Characteristics
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-purple-700 dark:text-purple-300">Unique Values</span>
                        <span className="font-bold text-purple-900 dark:text-purple-100">{analytics.uniqueValues}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-purple-700 dark:text-purple-300">Duplicates</span>
                        <span className="font-bold text-purple-900 dark:text-purple-100">{analytics.duplicates}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-purple-700 dark:text-purple-300">Value Range</span>
                        <span className="font-bold text-purple-900 dark:text-purple-100">{analytics.range}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-purple-700 dark:text-purple-300">Data Type</span>
                        <span className="font-bold text-purple-900 dark:text-purple-100">
                          {analytics.duplicates > 0 ? 'With duplicates' : 'All unique'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Detailed Statistics */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 dark:text-white">Detailed Statistics</h4>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="text-gray-600 dark:text-gray-400">Total Elements</span>
                      <span className="font-bold text-gray-900 dark:text-white">{analytics.totalElements}</span>
                    </div>
                    
                    <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="text-gray-600 dark:text-gray-400">Sorted Elements</span>
                      <span className="font-bold text-green-600 dark:text-green-400">{analytics.sortedElements}</span>
                    </div>
                    
                    <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="text-gray-600 dark:text-gray-400">Remaining</span>
                      <span className="font-bold text-orange-600 dark:text-orange-400">{analytics.remainingElements}</span>
                    </div>
                    
                    <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="text-gray-600 dark:text-gray-400">Current Partition Size</span>
                      <span className="font-bold text-blue-600 dark:text-blue-400">{analytics.currentPartitionSize}</span>
                    </div>
                    
                    <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="text-gray-600 dark:text-gray-400">Complexity</span>
                      <span className="font-bold text-purple-600 dark:text-purple-400">{analytics.estimatedComplexity}</span>
                    </div>
                  </div>
                </div>

                {/* Performance Insights */}
                <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                  <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
                    Performance Insight
                  </h4>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    {analytics.isCustomArray
                      ? analytics.efficiency > 0.8 
                        ? "Excellent! QuickSort is handling your custom data very efficiently."
                        : analytics.efficiency > 0.5
                        ? "Good progress. QuickSort is systematically sorting your custom array."
                        : "QuickSort is analyzing your data patterns and will accelerate as it creates smaller partitions."
                      : analytics.efficiency > 0.8 
                        ? "Excellent progress! QuickSort is efficiently partitioning the array."
                        : analytics.efficiency > 0.5
                        ? "Good progress. The algorithm is working through the partitions systematically."
                        : "Just getting started. QuickSort will accelerate as partitions get smaller."
                    }
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}