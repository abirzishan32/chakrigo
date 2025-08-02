"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Network, 
  Sparkles, 
  BookOpen, 
  Cpu,
  PlayCircle,
  Brain,
  Zap,
  GitBranch,
  Play
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const stockAlgorithms = [
  {
    id: "bfs",
    name: "Breadth-First Search",
    description: "Explores graph nodes level by level, guaranteeing shortest path discovery in unweighted networks.",
    visualization: "network-traverse",
    href: "/algo-visualizer/bfs",
    difficulty: "Beginner",
    category: "Graph Traversal",
    accentColor: "from-blue-400 to-cyan-300",
    glowColor: "shadow-blue-500/30"
  },
  {
    id: "dfs",
    name: "Depth-First Search", 
    description: "Dives deep into graph branches before backtracking, perfect for pathfinding and cycle detection.",
    visualization: "depth-traverse",
    href: "/algo-visualizer/dfs",
    difficulty: "Beginner",
    category: "Graph Traversal",
    accentColor: "from-purple-400 to-pink-300",
    glowColor: "shadow-purple-500/30"
  },
  {
    id: "quicksort",
    name: "Quick Sort",
    description: "Divide-and-conquer sorting with intelligent pivot selection for optimal O(n log n) performance.",
    visualization: "partition-sort",
    href: "/algo-visualizer/quicksort",
    difficulty: "Intermediate",
    category: "Sorting",
    accentColor: "from-green-400 to-emerald-300",
    glowColor: "shadow-green-500/30"
  },
  {
    id: "dijkstra",
    name: "Dijkstra's Algorithm",
    description: "Discovers shortest weighted paths through systematic exploration of connected vertices.",
    visualization: "weighted-path",
    href: "/algo-visualizer/dijkstra",
    difficulty: "Advanced", 
    category: "Graph Algorithms",
    accentColor: "from-orange-400 to-yellow-300",
    glowColor: "shadow-orange-500/30"
  }
];

const AlgorithmVisualization = ({ type, accentColor }: { 
  type: string; 
  accentColor: string;
}) => {
  switch (type) {
    case "network-traverse":
      return (
        <div className="relative w-full h-32">
          <svg className="w-full h-full" viewBox="0 0 200 120">
            {/* Network nodes */}
            <circle cx="40" cy="30" r="6" className="fill-gray-600" />
            <circle cx="80" cy="20" r="6" className="fill-gray-600" />
            <circle cx="120" cy="35" r="6" className="fill-gray-600" />
            <circle cx="160" cy="25" r="6" className="fill-gray-600" />
            <circle cx="60" cy="70" r="6" className="fill-gray-600" />
            <circle cx="100" cy="80" r="6" className="fill-gray-600" />
            <circle cx="140" cy="75" r="6" className="fill-gray-600" />
            
            {/* Connections */}
            <line x1="40" y1="30" x2="80" y2="20" className="stroke-gray-700 stroke-2" />
            <line x1="80" y1="20" x2="120" y2="35" className="stroke-gray-700 stroke-2" />
            <line x1="120" y1="35" x2="160" y2="25" className="stroke-gray-700 stroke-2" />
            <line x1="40" y1="30" x2="60" y2="70" className="stroke-gray-700 stroke-2" />
            <line x1="80" y1="20" x2="100" y2="80" className="stroke-gray-700 stroke-2" />
            <line x1="120" y1="35" x2="140" y2="75" className="stroke-gray-700 stroke-2" />
            
            {/* Animated traversal path */}
            <circle cx="40" cy="30" r="8" className={`fill-gradient-to-r ${accentColor} animate-pulse`}>
              <animate attributeName="opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx="80" cy="20" r="8" className={`fill-gradient-to-r ${accentColor} animate-pulse`}>
              <animate attributeName="opacity" values="0;0.8;1;0.8;0" dur="2s" begin="0.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="60" cy="70" r="8" className={`fill-gradient-to-r ${accentColor} animate-pulse`}>
              <animate attributeName="opacity" values="0;0.8;1;0.8;0" dur="2s" begin="0.5s" repeatCount="indefinite" />
            </circle>
          </svg>
        </div>
      );
      
    case "depth-traverse":
      return (
        <div className="relative w-full h-32">
          <svg className="w-full h-full" viewBox="0 0 200 120">
            {/* Tree structure */}
            <line x1="100" y1="20" x2="60" y2="60" className="stroke-gray-700 stroke-2" />
            <line x1="100" y1="20" x2="140" y2="60" className="stroke-gray-700 stroke-2" />
            <line x1="60" y1="60" x2="40" y2="100" className="stroke-gray-700 stroke-2" />
            <line x1="60" y1="60" x2="80" y2="100" className="stroke-gray-700 stroke-2" />
            <line x1="140" y1="60" x2="120" y2="100" className="stroke-gray-700 stroke-2" />
            <line x1="140" y1="60" x2="160" y2="100" className="stroke-gray-700 stroke-2" />
            
            <circle cx="100" cy="20" r="6" className="fill-gray-600" />
            <circle cx="60" cy="60" r="6" className="fill-gray-600" />
            <circle cx="140" cy="60" r="6" className="fill-gray-600" />
            <circle cx="40" cy="100" r="6" className="fill-gray-600" />
            <circle cx="80" cy="100" r="6" className="fill-gray-600" />
            <circle cx="120" cy="100" r="6" className="fill-gray-600" />
            <circle cx="160" cy="100" r="6" className="fill-gray-600" />
            
            {/* Animated DFS path */}
            <circle cx="100" cy="20" r="8" className={`fill-gradient-to-r ${accentColor}`}>
              <animate attributeName="opacity" values="1;0.5;1" dur="1s" repeatCount="indefinite" />
            </circle>
            <circle cx="60" cy="60" r="8" className={`fill-gradient-to-r ${accentColor}`}>
              <animate attributeName="opacity" values="0;1;0.5;1;0" dur="3s" begin="0.3s" repeatCount="indefinite" />
            </circle>
            <circle cx="40" cy="100" r="8" className={`fill-gradient-to-r ${accentColor}`}>
              <animate attributeName="opacity" values="0;1;0.5;1;0" dur="3s" begin="0.6s" repeatCount="indefinite" />
            </circle>
          </svg>
        </div>
      );
      
    case "partition-sort":
      return (
        <div className="relative w-full h-32 flex items-end justify-center gap-1 p-4">
          {[60, 40, 80, 20, 100, 30, 70, 50].map((height, i) => (
            <div
              key={i}
              className={`w-4 bg-gradient-to-t ${accentColor} rounded-t transition-all duration-1000`}
              style={{
                height: `${height}%`,
                animationDelay: `${i * 0.2}s`,
                animation: 'pulse 2s infinite'
              }}
            />
          ))}
        </div>
      );
      
    case "weighted-path":
      return (
        <div className="relative w-full h-32">
          <svg className="w-full h-full" viewBox="0 0 200 120">
            {/* Weighted graph */}
            <line x1="30" y1="30" x2="70" y2="20" className="stroke-gray-700 stroke-2" />
            <line x1="70" y1="20" x2="130" y2="40" className="stroke-gray-700 stroke-2" />
            <line x1="130" y1="40" x2="170" y2="30" className="stroke-gray-700 stroke-2" />
            <line x1="30" y1="30" x2="60" y2="80" className="stroke-gray-700 stroke-2" />
            <line x1="70" y1="20" x2="100" y2="90" className="stroke-gray-700 stroke-2" />
            <line x1="130" y1="40" x2="140" y2="85" className="stroke-gray-700 stroke-2" />
            
            {/* Weight labels */}
            <text x="50" y="20" className="fill-gray-400 text-xs font-mono">3</text>
            <text x="100" y="25" className="fill-gray-400 text-xs font-mono">5</text>
            <text x="150" y="30" className="fill-gray-400 text-xs font-mono">2</text>
            
            <circle cx="30" cy="30" r="6" className="fill-gray-600" />
            <circle cx="70" cy="20" r="6" className="fill-gray-600" />
            <circle cx="130" cy="40" r="6" className="fill-gray-600" />
            <circle cx="170" cy="30" r="6" className="fill-gray-600" />
            <circle cx="60" cy="80" r="6" className="fill-gray-600" />
            <circle cx="100" cy="90" r="6" className="fill-gray-600" />
            <circle cx="140" cy="85" r="6" className="fill-gray-600" />
            
            {/* Glowing path */}
            <line x1="30" y1="30" x2="70" y2="20" className={`stroke-gradient-to-r ${accentColor} stroke-3`}>
              <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
            </line>
            <line x1="130" y1="40" x2="170" y2="30" className={`stroke-gradient-to-r ${accentColor} stroke-3`}>
              <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" begin="0.5s" repeatCount="indefinite" />
            </line>
          </svg>
        </div>
      );
      
    default:
      return <div className="w-full h-32 bg-gradient-to-br from-gray-800 to-gray-900 rounded" />;
  }
};

export default function AlgoVisualizerPage() {
  const [activeTab, setActiveTab] = useState("stock");

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
      {/* Noise texture overlay */}
      <div className="fixed inset-0 opacity-[0.02] pointer-events-none bg-noise" />
      
      <div className="relative container mx-auto py-16 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-20">
            <h1 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight">
              <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                Algorithm
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Visualizer
              </span>
            </h1>
            <p className="text-xl text-gray-400 max-w-4xl mx-auto leading-relaxed font-light">
              Master computational thinking through immersive visualizations. 
              Explore curated algorithms or create custom animations with AI assistance.
            </p>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex justify-center mb-16">
              <TabsList className="grid grid-cols-2 bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-2 shadow-2xl">
                <TabsTrigger 
                  value="stock" 
                  className="flex items-center gap-3 px-8 py-4 rounded-xl font-medium transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/30 text-gray-400 hover:text-gray-200"
                >
                  <BookOpen className="h-5 w-5" />
                  Curated Collection
                </TabsTrigger>
                <TabsTrigger 
                  value="ai" 
                  className="flex items-center gap-3 px-8 py-4 rounded-xl font-medium transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-purple-500/30 text-gray-400 hover:text-gray-200"
                >
                  <Sparkles className="h-5 w-5" />
                  AI Studio
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Stock Algorithms Tab */}
            <TabsContent value="stock" className="space-y-12">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-white mb-4">Interactive Algorithm Library</h2>
                <p className="text-gray-400 text-lg font-light max-w-2xl mx-auto">
                  Step through fundamental algorithms with real-time visualization and detailed explanations
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {stockAlgorithms.map((algo) => (
                  <Link key={algo.id} href={algo.href}>
                    <div
                      className={`group relative bg-gradient-to-br from-gray-900/80 to-gray-950/80 backdrop-blur-xl border border-gray-800/50 rounded-3xl overflow-hidden transition-all duration-500 hover:border-gray-700/50 hover:transform hover:scale-[1.02] hover:${algo.glowColor} hover:shadow-2xl cursor-pointer`}
                    >
                      {/* Background gradient effect */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${algo.accentColor} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                      
                      {/* Visualization area */}
                      <div className="relative p-8 pb-6">
                        <AlgorithmVisualization 
                          type={algo.visualization} 
                          accentColor={algo.accentColor}
                        />
                        
                        {/* Play button for all algorithms */}
                        <div className="absolute bottom-4 right-4 w-12 h-12 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110">
                          <Play className="h-5 w-5 text-white ml-0.5" fill="currentColor" />
                        </div>
                      </div>

                      {/* Content area */}
                      <div className="p-8 pt-4">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">
                              {algo.name}
                            </h3>
                            <div className="flex items-center gap-3 mb-4">
                              <span className="text-xs font-medium text-gray-500 tracking-wider uppercase">
                                {algo.difficulty}
                              </span>
                              <span className="w-1 h-1 bg-gray-600 rounded-full" />
                              <span className="text-xs font-medium text-gray-500 tracking-wider uppercase">
                                {algo.category}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-gray-400 leading-relaxed font-light">
                          {algo.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </TabsContent>

            {/* AI Animation Builder Tab */}
            <TabsContent value="ai" className="space-y-12">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-white mb-4">AI Animation Studio</h2>
                <p className="text-gray-400 text-lg font-light max-w-2xl mx-auto">
                  Transform ideas into interactive visualizations using artificial intelligence
                </p>
              </div>

              {/* Hero AI Card */}
              <div className="relative bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-pink-900/20 backdrop-blur-xl border border-purple-500/20 rounded-3xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-blue-600/10" />
                
                <div className="relative p-12 text-center">
                  <div className="flex justify-center mb-8">
                    <div className="relative">
                      <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-500/30">
                        <Brain className="h-12 w-12 text-white" />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-blue-400 rounded-3xl animate-pulse opacity-20" />
                    </div>
                  </div>
                  
                  <h3 className="text-3xl font-bold text-white mb-6">Create with Intelligence</h3>
                  <p className="text-gray-400 text-lg font-light mb-10 max-w-3xl mx-auto leading-relaxed">
                    Describe any algorithm or computational concept in natural language. 
                    Our AI will generate interactive visualizations complete with code explanations 
                    and step-by-step breakdowns.
                  </p>
                  
                  <Link href="/algo-visualizer/ai-animation">
                    <button className="group relative px-10 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold rounded-2xl transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/30 hover:scale-105">
                      <span className="flex items-center gap-3">
                        <Sparkles className="h-5 w-5" />
                        Launch AI Studio
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    </button>
                  </Link>
                </div>
              </div>

              {/* Feature grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  {
                    icon: <Network className="h-8 w-8" />,
                    title: "Natural Language Input",
                    description: "Describe algorithms in plain English and watch them come to life"
                  },
                  {
                    icon: <Zap className="h-8 w-8" />,
                    title: "Real-time Generation", 
                    description: "Instant visualization creation with dynamic parameter adjustment"
                  },
                  {
                    icon: <PlayCircle className="h-8 w-8" />,
                    title: "Export & Share",
                    description: "Save animations as videos or share interactive demos"
                  }
                ].map((feature, index) => (
                  <div
                    key={index}
                    className="group p-8 bg-gradient-to-br from-gray-900/50 to-gray-950/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl hover:border-gray-700/50 transition-all duration-300 hover:transform hover:scale-105"
                  >
                    <div className="text-blue-400 mb-4 group-hover:text-blue-300 transition-colors duration-300">
                      {feature.icon}
                    </div>
                    <h4 className="text-lg font-semibold text-white mb-3">{feature.title}</h4>
                    <p className="text-gray-400 font-light leading-relaxed">{feature.description}</p>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}