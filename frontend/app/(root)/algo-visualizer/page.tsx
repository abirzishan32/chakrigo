"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Metadata } from "next";
import { 
  AlignJustify, 
  Code, 
  Network, 
  Sparkles, 
  BookOpen, 
  Cpu,
  PlayCircle,
  Brain,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const stockAlgorithms = [
  {
    id: "bfs",
    name: "Breadth-First Search",
    description: "Learn how BFS explores a graph level by level, finding shortest paths in unweighted graphs.",
    icon: <Network className="h-8 w-8 text-blue-500" />,
    href: "/algo-visualizer/stock/bfs",
    difficulty: "Beginner",
    category: "Graph Traversal"
  },
  {
    id: "dfs",
    name: "Depth-First Search",
    description: "Explore how DFS traverses deeply into a graph before backtracking.",
    icon: <AlignJustify className="h-8 w-8 text-purple-500" />,
    href: "/algo-visualizer/stock/dfs",
    difficulty: "Beginner",
    category: "Graph Traversal"
  },
  // Add more stock algorithms here
  {
    id: "quicksort",
    name: "Quick Sort",
    description: "Coming soon - Divide and conquer sorting algorithm with average O(n log n) complexity.",
    icon: <Zap className="h-8 w-8 text-green-500" />,
    href: "#",
    disabled: true,
    difficulty: "Intermediate",
    category: "Sorting"
  },
  {
    id: "dijkstra",
    name: "Dijkstra's Algorithm",
    description: "Coming soon - Find shortest paths from a source vertex to all other vertices.",
    icon: <Cpu className="h-8 w-8 text-orange-500" />,
    href: "#",
    disabled: true,
    difficulty: "Advanced",
    category: "Graph Algorithms"
  }
];

const aiFeatures = [
  {
    title: "AI Algorithm Generator",
    description: "Generate custom algorithm visualizations using AI prompts",
    icon: <Brain className="h-12 w-12 text-blue-400" />,
    href: "/algo-visualizer/ai-animation"
  },
  {
    title: "Interactive Learning",
    description: "AI-powered explanations and step-by-step breakdowns",
    icon: <Sparkles className="h-12 w-12 text-purple-400" />,
    href: "/algo-visualizer/ai-animation"
  },
  {
    title: "Custom Scenarios",
    description: "Create algorithm visualizations for your specific use cases",
    icon: <PlayCircle className="h-12 w-12 text-green-400" />,
    href: "/algo-visualizer/ai-animation"
  }
];

export default function AlgoVisualizerPage() {
  const [activeTab, setActiveTab] = useState("stock");

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "Intermediate": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "Advanced": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Algorithm Visualizer
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Master algorithms through interactive visualizations. Choose from our curated collection 
              or create custom animations with AI assistance.
            </p>
          </div>


          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-white dark:bg-gray-800 shadow-lg">
              <TabsTrigger 
                value="stock" 
                className="flex items-center gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white"
              >
                <BookOpen className="h-4 w-4" />
                Stock Algorithms
              </TabsTrigger>
              <TabsTrigger 
                value="ai" 
                className="flex items-center gap-2 data-[state=active]:bg-purple-500 data-[state=active]:text-white"
              >
                <Sparkles className="h-4 w-4" />
                AI Animation Builder
              </TabsTrigger>
            </TabsList>

            {/* Stock Algorithms Tab */}
            <TabsContent value="stock" className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold mb-2">Pre-built Algorithm Visualizations</h2>
                <p className="text-muted-foreground">
                  Interactive step-by-step visualizations of fundamental algorithms
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {stockAlgorithms.map((algo) => (
                  <Card 
                    key={algo.id}
                    className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-white dark:bg-gray-800 border-2"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-full w-16 h-16 flex items-center justify-center mb-3">
                          {algo.icon}
                        </div>
                        <div className="flex flex-col gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(algo.difficulty)}`}>
                            {algo.difficulty}
                          </span>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                            {algo.category}
                          </span>
                        </div>
                      </div>
                      <CardTitle className="text-xl">{algo.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="mb-4 text-sm leading-relaxed">
                        {algo.description}
                      </CardDescription>
                      <Button 
                        asChild={!algo.disabled}
                        variant="default"
                        disabled={algo.disabled}
                        className="w-full"
                      >
                        {algo.disabled ? (
                          <span className="flex items-center gap-2">
                            <Code className="h-4 w-4" />
                            Coming Soon
                          </span>
                        ) : (
                          <Link href={algo.href} className="flex items-center gap-2">
                            <PlayCircle className="h-4 w-4" />
                            Launch Visualizer
                          </Link>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* AI Animation Builder Tab */}
            <TabsContent value="ai" className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold mb-2">AI-Powered Algorithm Animation</h2>
                <p className="text-muted-foreground">
                  Create custom algorithm visualizations using AI assistance
                </p>
              </div>

              {/* AI Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {aiFeatures.map((feature, index) => (
                  <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex justify-center mb-4">
                        {feature.icon}
                      </div>
                      <h3 className="font-semibold mb-2">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Main AI Animation Card */}
              <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-2 border-blue-200 dark:border-blue-800">
                <CardContent className="p-8 text-center">
                  <div className="flex justify-center mb-6">
                    <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-full w-20 h-20 flex items-center justify-center">
                      <Sparkles className="h-10 w-10 text-white" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Start Creating with AI</h3>
                  <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                    Describe any algorithm or computational concept, and our AI will generate 
                    interactive visualizations with code explanations and step-by-step breakdowns.
                  </p>
                  <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    <Link href="/algo-visualizer/ai-animation" className="flex items-center gap-2">
                      <Brain className="h-5 w-5" />
                      Launch AI Animation Builder
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Additional Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Code className="h-5 w-5" />
                      What You Can Create
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Custom sorting algorithm animations</li>
                      <li>• Graph traversal visualizations</li>
                      <li>• Data structure operations</li>
                      <li>• Mathematical algorithm demonstrations</li>
                      <li>• Interview preparation scenarios</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      AI Features
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Natural language algorithm descriptions</li>
                      <li>• Automatic code generation</li>
                      <li>• Step-by-step explanations</li>
                      <li>• Interactive parameter tuning</li>
                      <li>• Export animations as videos</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}