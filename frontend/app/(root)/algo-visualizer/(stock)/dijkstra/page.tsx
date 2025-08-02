import DijkstraVisualizer from "@/components/algo-visualizer/dijkstra/DijkstraVisualizer";

export const metadata = {
  title: "Dijkstra's Algorithm Visualization",
  description: "Interactive visualization of Dijkstra's shortest path algorithm",
};

export default function DijkstraPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4">
      <DijkstraVisualizer />
    </div>
  );
}