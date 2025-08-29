"use client";

import dynamic from "next/dynamic";

// Dynamically import DijkstraVisualizer to avoid SSR issues with WebGL
const DijkstraVisualizer = dynamic(
    () => import("@/components/algo-visualizer/dijkstra/DijkstraVisualizer"),
    { ssr: false }
);

export default function DijkstraPage() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4">
            <DijkstraVisualizer />
        </div>
    );
}
