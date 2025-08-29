"use client";

import React from "react";
import dynamic from "next/dynamic";

// Dynamically import DFSVisualizer to avoid SSR issues with WebGL
const DFSVisualizer = dynamic(
    () => import("@/components/algo-visualizer/dfs/DFSVisualizer"),
    { ssr: false }
);

export default function DFSVisualizerPage() {
    return <DFSVisualizer />;
}
