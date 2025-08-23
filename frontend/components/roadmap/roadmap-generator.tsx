"use client";

import { useState, useCallback } from "react";
import { CareerInput } from "./career-input";
import { RoadmapProgress } from "./roadmap-progress";
import { RoadmapFlow } from "./roadmap-flow";
import { RoadmapDescription } from "./roadmap-description";
import { RoadmapSidebar } from "./roadmap-sidebar";
import { RoadmapLoading } from "./roadmap-loading";
import { SavedRoadmaps } from "./saved-roadmaps";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Share, Save, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { saveRoadmap } from "@/lib/actions/roadmap.action";

interface RoadmapData {
  analysis: any;
  roadmap_structure: {
    nodes: any[];
    edges: any[];
    phases: any[];
  };
  detailed_description: string;
  roadmap_id: string;
  metadata: any;
  title?: string;
  careerPath?: string;
}

interface GenerationState {
  isGenerating: boolean;
  progress: number;
  stage: string;
  stageDescription: string;
  status: "in_progress" | "complete" | "error";
  error?: string;
}

type ViewState = "input" | "saved" | "generating" | "viewing";

export function RoadmapGenerator() {
  const [roadmapData, setRoadmapData] = useState<RoadmapData | null>(null);
  const [viewState, setViewState] = useState<ViewState>("saved");
  const [currentCareerPath, setCurrentCareerPath] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [generationState, setGenerationState] = useState<GenerationState>({
    isGenerating: false,
    progress: 0,
    stage: "",
    stageDescription: "",
    status: "in_progress"
  });

  const handleGenerateRoadmap = useCallback(async (careerPath: string) => {
    setCurrentCareerPath(careerPath);
    setViewState("generating");
    setGenerationState({
      isGenerating: true,
      progress: 0,
      stage: "starting",
      stageDescription: "Initializing roadmap generation...",
      status: "in_progress"
    });

    try {
      const response = await fetch("http://localhost:8000/roadmap/generate-stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ career_path: careerPath }),
      });

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              
              setGenerationState({
                isGenerating: data.status !== "complete" && data.status !== "error",
                progress: data.progress || 0,
                stage: data.stage || "",
                stageDescription: data.stage_description || "",
                status: data.status || "in_progress",
                error: data.error
              });

              // If complete, set the roadmap data
              if (data.status === "complete") {
                setRoadmapData({
                  analysis: data.analysis,
                  roadmap_structure: data.roadmap_structure || { nodes: [], edges: [], phases: [] },
                  detailed_description: data.detailed_description || "",
                  roadmap_id: data.roadmap_id || "",
                  metadata: data.metadata || {},
                  title: data.analysis?.title || currentCareerPath,
                  careerPath: currentCareerPath,
                });
                setViewState("viewing");
                toast.success("Roadmap generated successfully!");
              } else if (data.status === "error") {
                toast.error(data.error || "Failed to generate roadmap");
              }
            } catch (e) {
              console.error("Error parsing SSE data:", e);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error generating roadmap:", error);
      setGenerationState({
        isGenerating: false,
        progress: -1,
        stage: "error",
        stageDescription: "Failed to generate roadmap",
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error"
      });
      toast.error("Failed to generate roadmap. Please try again.");
    }
  }, []);

  const handleReset = () => {
    setRoadmapData(null);
    setCurrentCareerPath("");
    setViewState("input");
    setGenerationState({
      isGenerating: false,
      progress: 0,
      stage: "",
      stageDescription: "",
      status: "in_progress"
    });
  };

  const handleSaveRoadmap = async () => {
    if (!roadmapData) return;

    setIsSaving(true);
    try {
      const result = await saveRoadmap({
        title: roadmapData.title || roadmapData.careerPath || "Untitled Roadmap",
        careerPath: roadmapData.careerPath || "",
        analysis: roadmapData.analysis,
        roadmapStructure: roadmapData.roadmap_structure,
        detailedDescription: roadmapData.detailed_description,
        metadata: roadmapData.metadata,
      });

      if (result.success) {
        toast.success("Roadmap saved successfully!");
      } else {
        toast.error(result.message || "Failed to save roadmap");
      }
    } catch (error) {
      console.error("Error saving roadmap:", error);
      toast.error("Failed to save roadmap. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadRoadmap = (savedRoadmap: any) => {
    setRoadmapData({
      analysis: savedRoadmap.analysis,
      roadmap_structure: savedRoadmap.roadmapStructure,
      detailed_description: savedRoadmap.detailedDescription,
      roadmap_id: savedRoadmap.id,
      metadata: savedRoadmap.metadata,
      title: savedRoadmap.title,
      careerPath: savedRoadmap.careerPath,
    });
    setCurrentCareerPath(savedRoadmap.careerPath);
    setViewState("viewing");
  };

  const handleShowSaved = () => {
    setViewState("saved");
  };

  const handleNewRoadmap = () => {
    setViewState("input");
  };

  const handleDownload = () => {
    if (roadmapData) {
      const dataStr = JSON.stringify(roadmapData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `roadmap-${roadmapData.roadmap_id || 'export'}.json`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Roadmap downloaded successfully!");
    }
  };

  const handleShare = () => {
    if (roadmapData) {
      const shareUrl = `${window.location.origin}/roadmap/${roadmapData.roadmap_id}`;
      navigator.clipboard.writeText(shareUrl);
      toast.success("Roadmap link copied to clipboard!");
    }
  };

  // Show saved roadmaps by default
  if (viewState === "saved") {
    return (
      <SavedRoadmaps 
        onLoadRoadmap={handleLoadRoadmap}
        onNewRoadmap={handleNewRoadmap}
      />
    );
  }

  // Show input form
  if (viewState === "input") {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="w-full max-w-2xl">
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={handleShowSaved}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              My Saved Roadmaps
            </Button>
          </div>
          <CareerInput 
            onGenerate={handleGenerateRoadmap}
            isGenerating={generationState.isGenerating}
          />
        </div>
      </div>
    );
  }

  // Show loading screen if generating
  if (viewState === "generating") {
    return (
      <RoadmapLoading
        progress={generationState.progress}
        stage={generationState.stage}
        stageDescription={generationState.stageDescription}
        status={generationState.status}
      />
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header with actions */}
      <div className="flex items-center justify-between p-6 border-b border-gray-700 bg-gray-900">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={handleReset}
            className="flex items-center gap-2 border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            <ArrowLeft className="h-4 w-4" />
            New Roadmap
          </Button>
          
          <Button
            variant="outline"
            onClick={handleShowSaved}
            className="flex items-center gap-2 border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            <BookOpen className="h-4 w-4" />
            My Roadmaps
          </Button>
        </div>
        
        {roadmapData && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleSaveRoadmap}
              disabled={isSaving}
              className="flex items-center gap-2 border-green-600 text-green-400 hover:bg-green-600 hover:text-white"
            >
              <Save className="h-4 w-4" />
              {isSaving ? "Saving..." : "Save Roadmap"}
            </Button>
            
            <Button
              variant="outline"
              onClick={handleShare}
              className="flex items-center gap-2 border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              <Share className="h-4 w-4" />
              Share
            </Button>
            <Button
              variant="outline"
              onClick={handleDownload}
              className="flex items-center gap-2 border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
          </div>
        )}
      </div>

      {/* Show roadmap if data available */}
      {roadmapData && (
        <div className="flex flex-1 min-h-0">
          {/* Left Sidebar */}
          <div className="w-80 flex-shrink-0 overflow-y-auto border-r border-gray-700 bg-gray-900/50 p-6">
            <div className="space-y-6">
              {/* Roadmap Title */}
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white">
                  {roadmapData.analysis?.title || "Career Roadmap"}
                </h2>
                <p className="text-gray-400 text-sm">
                  Interactive learning roadmap for your career path
                </p>
              </div>

              {/* Sidebar Content */}
              <RoadmapSidebar
                metadata={roadmapData.metadata}
                phases={roadmapData.roadmap_structure.phases}
                analysis={roadmapData.analysis}
              />

              {/* Compact Description */}
              <RoadmapDescription
                analysis={roadmapData.analysis}
                description={roadmapData.detailed_description}
                metadata={roadmapData.metadata}
                compact={true}
              />
            </div>
          </div>

          {/* Right Content - React Flow */}
          <div className="flex-1 flex flex-col min-w-0 p-6">
            <div className="flex-1">
              <RoadmapFlow
                nodes={roadmapData.roadmap_structure.nodes}
                edges={roadmapData.roadmap_structure.edges}
                phases={roadmapData.roadmap_structure.phases}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}