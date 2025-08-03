// Create a wrapper for sorting algorithms that works with React
export interface SortStep {
  array: number[];
  comparingIndices: number[];
  swappedIndices: number[];
  pivotIndex?: number;
  partitionRange?: [number, number];
  sortedIndices?: number[];
}

export function getBubbleSortSteps(array: number[]): SortStep[] {
  const steps: SortStep[] = [];
  const arrayCopy = [...array];

  // Track each step of the bubble sort process
  const n = arrayCopy.length;
  
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      // Record the comparison
      steps.push({
        array: [...arrayCopy],
        comparingIndices: [j, j + 1],
        swappedIndices: []
      });
      
      // Check and swap if needed
      if (arrayCopy[j] > arrayCopy[j + 1]) {
        // Swap elements
        const temp = arrayCopy[j];
        arrayCopy[j] = arrayCopy[j + 1];
        arrayCopy[j + 1] = temp;
        
        // Record the swap
        steps.push({
          array: [...arrayCopy],
          comparingIndices: [],
          swappedIndices: [j, j + 1]
        });
      }
    }
  }
  
  // Add the final sorted array
  steps.push({
    array: [...arrayCopy],
    comparingIndices: [],
    swappedIndices: []
  });
  
  return steps;
}

export function getQuickSortSteps(array: number[]): SortStep[] {
  const steps: SortStep[] = [];
  const arrayCopy = [...array];
  const sortedIndices = new Set<number>();

  // Initial state
  steps.push({
    array: [...arrayCopy],
    comparingIndices: [],
    swappedIndices: [],
    partitionRange: [0, arrayCopy.length - 1],
    sortedIndices: []
  });

  // Helper function to perform partition and track steps
  function partition(arr: number[], low: number, high: number): number {
    // Choose the rightmost element as pivot
    const pivot = arr[high];
    
    // Record pivot selection
    steps.push({
      array: [...arr],
      comparingIndices: [],
      swappedIndices: [],
      pivotIndex: high,
      partitionRange: [low, high],
      sortedIndices: Array.from(sortedIndices)
    });
    
    let i = low - 1;
    
    // Compare all elements with pivot
    for (let j = low; j < high; j++) {
      // Record comparison with pivot
      steps.push({
        array: [...arr],
        comparingIndices: [j, high],
        swappedIndices: [],
        pivotIndex: high,
        partitionRange: [low, high],
        sortedIndices: Array.from(sortedIndices)
      });
      
      // If current element is less than the pivot
      if (arr[j] < pivot) {
        i++;
        
        // Only swap if i and j are different
        if (i !== j) {
          // Swap elements
          [arr[i], arr[j]] = [arr[j], arr[i]];
          
          // Record the swap
          steps.push({
            array: [...arr],
            comparingIndices: [],
            swappedIndices: [i, j],
            pivotIndex: high,
            partitionRange: [low, high],
            sortedIndices: Array.from(sortedIndices)
          });
        }
      }
    }
    
    // Swap the pivot element to its correct position
    const pivotNewIndex = i + 1;
    if (pivotNewIndex !== high) {
      [arr[pivotNewIndex], arr[high]] = [arr[high], arr[pivotNewIndex]];
      
      // Record the pivot swap
      steps.push({
        array: [...arr],
        comparingIndices: [],
        swappedIndices: [pivotNewIndex, high],
        pivotIndex: pivotNewIndex,
        partitionRange: [low, high],
        sortedIndices: Array.from(sortedIndices)
      });
    }
    
    // Mark the pivot as sorted
    sortedIndices.add(pivotNewIndex);
    
    // Record the sorted pivot
    steps.push({
      array: [...arr],
      comparingIndices: [],
      swappedIndices: [],
      pivotIndex: pivotNewIndex,
      partitionRange: [low, high],
      sortedIndices: Array.from(sortedIndices)
    });
    
    return pivotNewIndex;
  }

  // Helper function to perform quick sort recursively
  function quickSort(arr: number[], low: number, high: number): void {
    if (low < high) {
      // Find pivot element
      const pi = partition(arr, low, high);
      
      // Recursively sort elements before and after partition
      quickSort(arr, low, pi - 1);
      quickSort(arr, pi + 1, high);
    } else if (low === high && low >= 0) {
      // Single element is automatically sorted
      sortedIndices.add(low);
      
      steps.push({
        array: [...arr],
        comparingIndices: [],
        swappedIndices: [],
        partitionRange: [low, high],
        sortedIndices: Array.from(sortedIndices)
      });
    }
  }

  // Start the quick sort
  if (arrayCopy.length > 0) {
    quickSort(arrayCopy, 0, arrayCopy.length - 1);
  }

  // Add a final step showing the fully sorted array
  steps.push({
    array: [...arrayCopy],
    comparingIndices: [],
    swappedIndices: [],
    sortedIndices: Array.from({ length: arrayCopy.length }, (_, i) => i)
  });

  return steps;
}

// Helper method to directly sort an array using bubble sort
export function bubbleSort(array: number[]): number[] {
  const arr = [...array];
  const n = arr.length;
  
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        // Swap elements
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  
  return arr;
}

// Helper method to directly sort an array using quick sort
export function quickSort(array: number[]): number[] {
  const arr = [...array];
  
  function quickSortRecursive(arr: number[], low: number, high: number): void {
    if (low < high) {
      const pi = partitionForSort(arr, low, high);
      quickSortRecursive(arr, low, pi - 1);
      quickSortRecursive(arr, pi + 1, high);
    }
  }
  
  function partitionForSort(arr: number[], low: number, high: number): number {
    const pivot = arr[high];
    let i = low - 1;
    
    for (let j = low; j < high; j++) {
      if (arr[j] < pivot) {
        i++;
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
    }
    
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    return i + 1;
  }
  
  quickSortRecursive(arr, 0, arr.length - 1);
  return arr;
}

// Extend the SortStep interface for merge sort specific properties
export interface MergeSortStep extends SortStep {
  mergingIndices?: number[]; // Indices being merged
  subArrayRanges?: Array<[number, number]>; // All active subarrays
  mergeArrays?: {
    left: number[];
    right: number[];
    mergeIndex: number;
    leftIndex: number;
    rightIndex: number;
  }; // Details about the merge operation
}

export function getMergeSortSteps(array: number[]): MergeSortStep[] {
  const steps: MergeSortStep[] = [];
  const arrayCopy = [...array];
  
  // Initial state
  steps.push({
    array: [...arrayCopy],
    comparingIndices: [],
    swappedIndices: [],
    subArrayRanges: [[0, arrayCopy.length - 1]],
    mergingIndices: []
  });
  
  function mergeSort(arr: number[], left: number, right: number): void {
    if (left < right) {
      const mid = Math.floor((left + right) / 2);
      
      // Record the division
      steps.push({
        array: [...arr],
        comparingIndices: [],
        swappedIndices: [],
        subArrayRanges: [[left, mid], [mid + 1, right]],
        mergingIndices: []
      });
      
      // Recursively sort first and second halves
      mergeSort(arr, left, mid);
      mergeSort(arr, mid + 1, right);
      
      // Record before merge
      steps.push({
        array: [...arr],
        comparingIndices: [],
        swappedIndices: [],
        subArrayRanges: [[left, right]],
        mergingIndices: Array.from({ length: right - left + 1 }, (_, i) => left + i)
      });
      
      // Merge the sorted halves
      merge(arr, left, mid, right);
    }
  }
  
  function merge(arr: number[], left: number, mid: number, right: number): void {
    // Create copies of the subarrays
    const leftArray = arr.slice(left, mid + 1);
    const rightArray = arr.slice(mid + 1, right + 1);
    
    let i = 0; // Initial index of left subarray
    let j = 0; // Initial index of right subarray
    let k = left; // Initial index of merged subarray
    
    // Record the start of merge with subarray details
    steps.push({
      array: [...arr],
      comparingIndices: [],
      swappedIndices: [],
      subArrayRanges: [[left, right]],
      mergingIndices: Array.from({ length: right - left + 1 }, (_, idx) => left + idx),
      mergeArrays: {
        left: [...leftArray],
        right: [...rightArray],
        mergeIndex: k,
        leftIndex: i,
        rightIndex: j
      }
    });
    
    // Merge the subarrays
    while (i < leftArray.length && j < rightArray.length) {
      // Compare elements from both subarrays
      steps.push({
        array: [...arr],
        comparingIndices: [left + i, mid + 1 + j],
        swappedIndices: [],
        subArrayRanges: [[left, right]],
        mergingIndices: Array.from({ length: right - left + 1 }, (_, idx) => left + idx),
        mergeArrays: {
          left: [...leftArray],
          right: [...rightArray],
          mergeIndex: k,
          leftIndex: i,
          rightIndex: j
        }
      });
      
      if (leftArray[i] <= rightArray[j]) {
        arr[k] = leftArray[i];
        i++;
      } else {
        arr[k] = rightArray[j];
        j++;
      }
      
      // Record after placing an element
      steps.push({
        array: [...arr],
        comparingIndices: [],
        swappedIndices: [k],
        subArrayRanges: [[left, right]],
        mergingIndices: Array.from({ length: right - left + 1 }, (_, idx) => left + idx),
        mergeArrays: {
          left: [...leftArray],
          right: [...rightArray],
          mergeIndex: k + 1, // Next position
          leftIndex: i,
          rightIndex: j
        }
      });
      
      k++;
    }
    
    // Copy remaining elements of leftArray
    while (i < leftArray.length) {
      arr[k] = leftArray[i];
      
      // Record copying from left
      steps.push({
        array: [...arr],
        comparingIndices: [],
        swappedIndices: [k],
        subArrayRanges: [[left, right]],
        mergingIndices: Array.from({ length: right - left + 1 }, (_, idx) => left + idx),
        mergeArrays: {
          left: [...leftArray],
          right: [...rightArray],
          mergeIndex: k + 1,
          leftIndex: i + 1,
          rightIndex: j
        }
      });
      
      i++;
      k++;
    }
    
    // Copy remaining elements of rightArray
    while (j < rightArray.length) {
      arr[k] = rightArray[j];
      
      // Record copying from right
      steps.push({
        array: [...arr],
        comparingIndices: [],
        swappedIndices: [k],
        subArrayRanges: [[left, right]],
        mergingIndices: Array.from({ length: right - left + 1 }, (_, idx) => left + idx),
        mergeArrays: {
          left: [...leftArray],
          right: [...rightArray],
          mergeIndex: k + 1,
          leftIndex: i,
          rightIndex: j + 1
        }
      });
      
      j++;
      k++;
    }
    
    // Record completed merge
    steps.push({
      array: [...arr],
      comparingIndices: [],
      swappedIndices: [],
      subArrayRanges: [[left, right]],
      mergingIndices: [],
      sortedIndices: Array.from({ length: right - left + 1 }, (_, idx) => left + idx)
    });
  }
  
  // Start the merge sort
  if (arrayCopy.length > 0) {
    mergeSort(arrayCopy, 0, arrayCopy.length - 1);
  }
  
  // Add final step with all elements sorted
  steps.push({
    array: [...arrayCopy],
    comparingIndices: [],
    swappedIndices: [],
    subArrayRanges: [[0, arrayCopy.length - 1]],
    mergingIndices: [],
    sortedIndices: Array.from({ length: arrayCopy.length }, (_, i) => i)
  });
  
  return steps;
}

// Helper method to directly sort an array using merge sort
export function mergeSort(array: number[]): number[] {
  const arr = [...array];
  
  function mergeSortRecursive(arr: number[], left: number, right: number): void {
    if (left < right) {
      const mid = Math.floor((left + right) / 2);
      mergeSortRecursive(arr, left, mid);
      mergeSortRecursive(arr, mid + 1, right);
      mergeForSort(arr, left, mid, right);
    }
  }
  
  function mergeForSort(arr: number[], left: number, mid: number, right: number): void {
    const leftArray = arr.slice(left, mid + 1);
    const rightArray = arr.slice(mid + 1, right + 1);
    
    let i = 0, j = 0, k = left;
    
    while (i < leftArray.length && j < rightArray.length) {
      if (leftArray[i] <= rightArray[j]) {
        arr[k] = leftArray[i];
        i++;
      } else {
        arr[k] = rightArray[j];
        j++;
      }
      k++;
    }
    
    while (i < leftArray.length) {
      arr[k] = leftArray[i];
      i++;
      k++;
    }
    
    while (j < rightArray.length) {
      arr[k] = rightArray[j];
      j++;
      k++;
    }
  }
  
  mergeSortRecursive(arr, 0, arr.length - 1);
  return arr;
}

// For logging/debugging
export function logVisualization(array: number[]): void {
  console.log('Bubble sort visualization complete for array:', array);
}

export function logQuickSortVisualization(array: number[]): void {
  console.log('Quick sort visualization complete for array:', array);
}

export function logMergeSortVisualization(array: number[]): void {
  console.log('Merge sort visualization complete for array:', array);
}