"use client";

import { SortStep } from './visualizer-adapter';

interface AlgorithmExplanationProps {
  currentStep: number;
  steps: SortStep[];
}

export default function AlgorithmExplanation({
  currentStep,
  steps
}: AlgorithmExplanationProps) {
  const getCurrentExplanation = () => {
    if (currentStep === -1 || steps.length === 0) {
      return "Quick Sort is a highly efficient sorting algorithm that uses a divide-and-conquer approach. It works by selecting a 'pivot' element and partitioning the array around the pivot.";
    }
    
    if (currentStep >= steps.length) {
      return "Sorting complete! The array is now fully sorted.";
    }
    
    const step = steps[currentStep];
    
    if (step.swappedIndices?.length === 2) {
      const [i, j] = step.swappedIndices;
      if (step.pivotIndex === i || step.pivotIndex === j) {
        return `Swapping the pivot element to its correct sorted position (index ${i < j ? i : j}).`;
      }
      return `Swapping elements at indices ${i} and ${j} because one is smaller than the pivot.`;
    }
    
    if (step.comparingIndices?.length === 2) {
      const [i, j] = step.comparingIndices;
      if (j === step.pivotIndex) {
        const value = step.array[i];
        const pivotValue = step.array[j];
        return `Comparing element ${value} at index ${i} with pivot value ${pivotValue} at index ${j}.${value < pivotValue ? ' Element is smaller than pivot.' : ' Element is greater than pivot.'}`;
      }
      return `Comparing elements at indices ${i} and ${j}.`;
    }
    
    if (step.pivotIndex !== undefined && step.partitionRange) {
      return `Selected pivot element ${step.array[step.pivotIndex]} at index ${step.pivotIndex}. Working on partition from index ${step.partitionRange[0]} to ${step.partitionRange[1]}.`;
    }
    
    if (step.sortedIndices?.length === step.array.length) {
      return "Quick Sort complete! All elements are in their sorted positions.";
    }
    
    if (step.partitionRange && step.partitionRange[0] > step.partitionRange[1]) {
      return `Finished processing subarray because start index (${step.partitionRange[0]}) is greater than end index (${step.partitionRange[1]}).`;
    }
    
    return "Processing...";
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Quick Sort Algorithm</h2>
      
      <div className="mb-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
        <p className="text-blue-800 dark:text-blue-300">
          {getCurrentExplanation()}
        </p>
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Pseudocode</h3>
        <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-md text-sm font-mono overflow-x-auto">
{`function quickSort(arr, low, high) {
  if (low < high) {
    // pi is partitioning index
    let pi = partition(arr, low, high);
    
    // Recursively sort elements
    quickSort(arr, low, pi - 1);  // Before pi
    quickSort(arr, pi + 1, high); // After pi
  }
}

function partition(arr, low, high) {
  // Select rightmost element as pivot
  let pivot = arr[high];
  
  // Index of smaller element
  let i = low - 1;
  
  for (let j = low; j < high; j++) {
    // If current element is smaller than pivot
    if (arr[j] < pivot) {
      i++;
      // Swap arr[i] and arr[j]
      swap(arr, i, j);
    }
  }
  
  // Swap arr[i+1] and arr[high] (pivot)
  swap(arr, i + 1, high);
  
  // Return the partition index
  return i + 1;
}`}
        </pre>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-2">Characteristics</h3>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li><strong>Time Complexity:</strong> 
            <ul className="pl-5 mt-1">
              <li>Average case: O(n log n)</li>
              <li>Worst case: O(n²) - when already sorted or all elements are same</li>
              <li>Best case: O(n log n)</li>
            </ul>
          </li>
          <li><strong>Space Complexity:</strong> O(log n) due to recursion stack</li>
          <li><strong>Stable:</strong> No - relative order of equal elements may change</li>
          <li><strong>In-place:</strong> Yes - requires O(log n) extra space for recursion stack</li>
          <li><strong>Advantages:</strong> Usually very fast in practice, good cache performance</li>
        </ul>
      </div>
    </div>
  );
}