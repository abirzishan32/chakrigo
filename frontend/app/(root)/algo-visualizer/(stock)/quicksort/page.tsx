import QuickSortVisualizer from "@/components/algo-visualizer/quicksort/QuickSortVisualizer";

export const metadata = {
  title: "Quick Sort Algorithm Visualization",
  description: "Interactive visualization of the quick sort algorithm",
};

export default function QuickSortPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <QuickSortVisualizer />
    </div>
  );
}