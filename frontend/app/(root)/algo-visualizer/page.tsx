import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { AlignJustify, Code, Network } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Algorithm Visualizer | ChakriGO",
  description: "Interactive visualizations of various algorithms",
};

const algorithms = [
  {
    id: "bfs",
    name: "Breadth-First Search",
    description: "Learn how BFS explores a graph level by level, finding shortest paths in unweighted graphs.",
    icon: <Network className="h-10 w-10 text-blue-500" />,
    href: "/algo-visualizer/bfs",
  },
  // Future algorithms can be added here
  {
    id: "dfs",
    name: "Depth-First Search",
    description: "Coming soon - Explore how DFS traverses deeply into a graph before backtracking.",
    icon: <AlignJustify className="h-10 w-10 text-purple-500" />,
    href: "#",
    disabled: true,
  },
];

export default function AlgoVisualizerPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Algorithm Visualizer</h1>
        <p className="text-muted-foreground mb-8">
          Interactive visualizations to help you understand algorithms through step-by-step execution.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {algorithms.map((algo) => (
            <div 
              key={algo.id}
              className="border rounded-lg overflow-hidden bg-card"
            >
              <div className="p-6 flex flex-col h-full">
                <div className="bg-muted/20 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  {algo.icon}
                </div>
                <h2 className="text-xl font-semibold mb-2">{algo.name}</h2>
                <p className="text-muted-foreground mb-4 flex-grow">
                  {algo.description}
                </p>
                <Button 
                  asChild={!algo.disabled}
                  variant="default"
                  disabled={algo.disabled}
                  className="w-full"
                >
                  {algo.disabled ? (
                    <span>Coming Soon</span>
                  ) : (
                    <Link href={algo.href}>
                      Launch Visualizer
                    </Link>
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}