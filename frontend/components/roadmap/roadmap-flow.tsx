"use client";

import { useCallback, useMemo, useEffect } from "react";
import ReactFlow, {
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Controls,
  Background,
  MiniMap,
  MarkerType,
  ConnectionLineType,
  BackgroundVariant,
} from "reactflow";
import "reactflow/dist/style.css";
import { RoadmapNode } from "./roadmap-node";

interface RoadmapFlowProps {
  nodes: any[];
  edges: any[];
  phases?: any[];
}

const nodeTypes = {
  roadmapNode: RoadmapNode,
};

// Advanced tree layout algorithm with roadmap.sh-style positioning and professional spacing
const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
  if (nodes.length === 0) return [];

  // Create comprehensive dependency graph for tree structure
  const nodeMap = new Map();
  const inDegree = new Map();
  const outDegree = new Map();
  const children = new Map();
  const parents = new Map();
  
  // Initialize all data structures
  nodes.forEach(node => {
    nodeMap.set(node.id, node);
    inDegree.set(node.id, 0);
    outDegree.set(node.id, 0);
    children.set(node.id, []);
    parents.set(node.id, []);
  });
  
  // Build complete dependency graph
  edges.forEach(edge => {
    inDegree.set(edge.target, inDegree.get(edge.target) + 1);
    outDegree.set(edge.source, outDegree.get(edge.source) + 1);
    children.get(edge.source).push(edge.target);
    parents.get(edge.target).push(edge.source);
  });
  
  // Find root nodes (foundation/starting points)
  let roots = nodes.filter(node => inDegree.get(node.id) === 0);
  
  // Fallback: if no clear roots, use foundation type nodes
  if (roots.length === 0) {
    roots = nodes.filter(node => node.data?.type === "foundation");
  }
  
  // Final fallback: use first few nodes
  if (roots.length === 0) {
    roots = nodes.slice(0, Math.min(3, nodes.length));
  }
  
  // Enhanced layout configuration for roadmap.sh style with increased spacing
  const layoutConfig = {
    nodeWidth: 400,              // Updated to match new node width
    nodeHeight: 260,             // Slightly increased height
    horizontalSpacing: 900,      // Further increased horizontal spacing
    verticalSpacing: 650,        // Increased vertical spacing for better clarity
    branchSpacing: 600,          // Increased spacing for specialization branches
    levelHeight: 600,            // Increased fixed height per level
    centerX: 0,                  // Center alignment point
    startY: 150,                 // Starting Y position
    maxNodesPerLevel: 4,         // Max nodes per level for better spacing
  };
  
  const layoutedNodes: Node[] = [];
  const levels: string[][] = [];
  const levelMap = new Map();
  const visited = new Set();
  
  // Perform BFS to assign nodes to levels (tree structure)
  const queue = [...roots.map(node => ({ id: node.id, level: 0 }))];
  
  while (queue.length > 0) {
    const { id: currentId, level: currentLevel } = queue.shift()!;
    if (visited.has(currentId)) continue;
    
    visited.add(currentId);
    levelMap.set(currentId, currentLevel);
    
    // Initialize level array if needed
    while (levels.length <= currentLevel) {
      levels.push([]);
    }
    levels[currentLevel].push(currentId);
    
    // Add children to next level
    const nodeChildren = children.get(currentId) || [];
    nodeChildren.forEach(childId => {
      if (!visited.has(childId)) {
        queue.push({ id: childId, level: currentLevel + 1 });
      }
    });
  }
  
  // Handle orphaned nodes by type
  nodes.forEach(node => {
    if (!visited.has(node.id)) {
      const nodeType = node.data?.type || "core";
      let targetLevel = levels.length;
      
      // Assign level based on node type
      switch (nodeType) {
        case "foundation":
          targetLevel = 0;
          break;
        case "core":
          targetLevel = Math.min(2, levels.length);
          break;
        case "advanced":
          targetLevel = Math.min(3, levels.length);
          break;
        case "project":
          targetLevel = Math.min(4, levels.length);
          break;
        case "milestone":
          targetLevel = levels.length;
          break;
      }
      
      while (levels.length <= targetLevel) {
        levels.push([]);
      }
      levels[targetLevel].push(node.id);
      levelMap.set(node.id, targetLevel);
    }
  });
  
  // Calculate positions for roadmap.sh style layout with enhanced spacing
  levels.forEach((levelNodes, levelIndex) => {
    const y = layoutConfig.startY + (levelIndex * layoutConfig.levelHeight);
    const nodeCount = levelNodes.length;
    
    if (nodeCount === 0) return;
    
    if (nodeCount === 1) {
      // Center single node
      const nodeId = levelNodes[0];
      const node = nodeMap.get(nodeId);
      if (node) {
        layoutedNodes.push({
          ...node,
          position: { x: layoutConfig.centerX, y }
        });
      }
    } else {
      // Distribute multiple nodes with enhanced roadmap.sh branching style
      const totalWidth = (nodeCount - 1) * layoutConfig.horizontalSpacing;
      const startX = layoutConfig.centerX - (totalWidth / 2);
      
      levelNodes.forEach((nodeId, index) => {
        const node = nodeMap.get(nodeId);
        if (node) {
          let x = startX + (index * layoutConfig.horizontalSpacing);
          
          // Enhanced branching effect for specializations (levels 2+)
          if (levelIndex >= 2 && nodeCount > 2) {
            const branchFactor = (index - (nodeCount - 1) / 2) * 0.6;
            x += branchFactor * layoutConfig.branchSpacing;
          }
          
          // Enhanced staggering for better visual hierarchy
          const stagger = (index % 2) * 60; // Increased stagger amount
          const microStagger = (index % 3) * 20; // Additional micro-stagger
          
          layoutedNodes.push({
            ...node,
            position: { x, y: y + stagger + microStagger }
          });
        }
      });
    }
  });
  
  return layoutedNodes;
};

export function RoadmapFlow({ nodes: initialNodes, edges: initialEdges, phases }: RoadmapFlowProps) {
  // Convert backend nodes to React Flow format
  const initialFlowNodes: Node[] = useMemo(() => {
    return initialNodes.map((node, index) => ({
      id: node.id,
      type: "roadmapNode",
      position: node.position || { x: (index % 3) * 400, y: Math.floor(index / 3) * 300 },
      data: {
        title: node.title,
        description: node.description,
        type: node.type || "core",
        duration: node.duration,
        skills_gained: node.skills_gained,
        projects: node.projects,
      },
    }));
  }, [initialNodes]);

  // Convert backend edges to React Flow format with professional styling
  const flowEdges: Edge[] = useMemo(() => {
    return initialEdges.map((edge, index) => {
      // Determine edge color based on connection type or use gradient
      const edgeColor = "#64748B"; // Professional slate color for better readability
      
      return {
        id: edge.id || `edge-${index}`,
        source: edge.source,
        target: edge.target,
        type: "smoothstep", // Smooth curved connections
        animated: false,    // Disable animation for cleaner look
        style: { 
          stroke: edgeColor,
          strokeWidth: 2.5,         // Optimal thickness for visibility
          strokeDasharray: "0",     // Solid line
          opacity: 0.8,             // Slight transparency for elegance
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
          color: edgeColor,
        },
        label: edge.label,
        labelStyle: {
          fill: "#374151",          // Darker text for better readability
          fontSize: 11,
          fontWeight: 600,
          textShadow: "0 1px 2px rgba(255, 255, 255, 0.8)",
        },
        labelBgStyle: {
          fill: "#FFFFFF",
          fillOpacity: 0.9,
          rx: 4,                    // Rounded corners
          ry: 4,
        },
        labelBgPadding: [8, 12],    // Better padding for labels
        labelBgBorderRadius: 4,
        zIndex: 5,
      };
    });
  }, [initialEdges]);

  // Apply layout algorithm
  const layoutedNodes = useMemo(() => {
    if (initialFlowNodes.length === 0) return [];
    return getLayoutedElements(initialFlowNodes, flowEdges);
  }, [initialFlowNodes, flowEdges]);

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(flowEdges);

  // Update nodes when layoutedNodes changes
  useEffect(() => {
    setNodes(layoutedNodes);
  }, [layoutedNodes, setNodes]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  if (!initialNodes.length) {
    return (
      <div className="h-96 flex items-center justify-center border-2 border-dashed border-gray-600 rounded-lg bg-gray-800">
        <p className="text-gray-400">No roadmap data available</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full border border-gray-700 rounded-lg overflow-hidden bg-gray-900">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        connectionLineType={ConnectionLineType.SmoothStep}
        fitView
        fitViewOptions={{
          padding: 0.2,              // Increased padding for better overview
          includeHiddenNodes: false,
          maxZoom: 1.0,              // Reduced max zoom for better overall view
          minZoom: 0.2,              // Lower min zoom to see larger roadmaps
        }}
        minZoom={0.15}               // Even lower min zoom for very large roadmaps
        maxZoom={1.5}                // Moderate max zoom
        defaultViewport={{ x: 0, y: 0, zoom: 0.5 }} // Lower default zoom for better overview
        style={{ background: '#111827' }}
        proOptions={{ hideAttribution: true }}
        elementsSelectable={true}
        nodesConnectable={false}
        nodesDraggable={true}
        panOnDrag={true}
        zoomOnScroll={true}
        zoomOnPinch={true}
        selectNodesOnDrag={false}
      >
        <Controls 
          position="top-left"
          showInteractive={false}
          style={{
            backgroundColor: '#374151',
            border: '1px solid #6B7280',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          }}
        />
        <Background 
          gap={25} 
          size={1.5}
          color="#374151"
          style={{ backgroundColor: '#111827' }}
          variant={BackgroundVariant.Dots}
        />
        <MiniMap 
          position="bottom-right"
          nodeColor="#3B82F6"
          maskColor="rgba(0, 0, 0, 0.2)"
          style={{
            backgroundColor: "#1F2937",
            border: "1px solid #6B7280",
            borderRadius: "8px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          }}
          pannable={true}
          zoomable={true}
        />
      </ReactFlow>
    </div>
  );
}