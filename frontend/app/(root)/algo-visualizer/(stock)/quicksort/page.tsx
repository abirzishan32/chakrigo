import QuickSortVisualizer from "@/components/algo-visualizer/quicksort/QuickSortVisualizer";

export const metadata = {
  title: "QuickSort Interactive Visualization",
  description: "Premium interactive visualization of the QuickSort algorithm - Learn through doing",
};

export default function QuickSortPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-gray-900 dark:to-slate-800">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(59,130,246,0.15)_1px,transparent_0)] [background-size:24px_24px] dark:opacity-30"></div>
      <QuickSortVisualizer />
    </div>
  );
}