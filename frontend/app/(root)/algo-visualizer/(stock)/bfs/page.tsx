"use client";

import React from "react";
import dynamic from "next/dynamic";

// Dynamically import BFSVisualizer to avoid SSR issues with WebGL
const BFSVisualizer = dynamic(
    () => import("@/components/algo-visualizer/bfs/BFSVisualizer"),
    { ssr: false }
);

export default function BFSVisualizerPage() {
    return <BFSVisualizer />;
}
