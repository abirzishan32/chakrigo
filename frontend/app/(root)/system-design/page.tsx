"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { SystemDesignInput } from "@/components/system-design/SystemDesignInput";
import { DiagramViewer } from "@/components/system-design/DiagramViewer";
import { LoadingDiagram } from "@/components/system-design/LoadingDiagram";
import { InteractiveDiagram } from "@/components/system-design/InteractiveDiagram";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
interface SystemDesignProgress {
  status: "in_progress" | "complete" | "error";
  progress: number;
  stage: string;
  stage_description: string;
  error?: string;
  analysis?: any;
  plantuml_code?: string;
  explanation?: string;
  diagram_url?: string;
  d3_components?: any;
  diagram_id?: string;
}

interface DiagramData {
  id: string;
  prompt: string;
  plantuml_code: string;
  diagram_url: string;
  explanation: string;
  analysis?: any;
  d3_components?: any;
  timestamp: Date;
}

interface ConversationItem {
  type: "prompt" | "response";
  content: string;
  diagramData?: DiagramData;
  analysis?: any;
  timestamp: Date;
}



export default function SystemDesignPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [designProgress, setDesignProgress] = useState<SystemDesignProgress | null>(null);
  const [conversations, setConversations] = useState<Array<{
    type: "prompt" | "response";
    content: string;
    timestamp: Date;
    diagramData?: DiagramData | null;
    analysis?: any;
  }>>([]);
  const [currentViewMode, setCurrentViewMode] = useState<"plantuml" | "interactive">("plantuml");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversations]);

  const generateSystemDesignWithStreaming = async (prompt: string) => {
    setIsLoading(true);
    setDesignProgress(null);

    setConversations(prev => [
      ...prev,
      {
        type: "prompt",
        content: prompt,
        timestamp: new Date()
      }
    ]);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiUrl}/system-design/generate-stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error("Failed to start system design generation");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No response stream available");
      }

      let finalResult: SystemDesignProgress | null = null;

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              setDesignProgress(data);
              finalResult = data;

              // Update loading with current stage
              if (data.stage_description) {
                console.log(`Stage: ${data.stage} - ${data.stage_description}`);
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e);
            }
          }
        }
      }

      // Add final result to conversations
      if (finalResult) {
        const diagramData: DiagramData | null = finalResult.status === "complete" ? {
          id: finalResult.diagram_id || Date.now().toString(),
          prompt,
          plantuml_code: finalResult.plantuml_code || "",
          diagram_url: finalResult.diagram_url || "",
          explanation: finalResult.explanation || "",
          analysis: finalResult.analysis,
          d3_components: finalResult.d3_components,
          timestamp: new Date()
        } : null;

        setConversations(prev => [
          ...prev,
          {
            type: "response",
            content: finalResult.explanation || "System design generation completed",
            diagramData,
            analysis: finalResult.analysis,
            timestamp: new Date()
          }
        ]);

        if (finalResult.status === "error") {
          toast.error(finalResult.error || "System design generation failed");
        } else {
          toast.success("System design generated successfully!");
        }
      }

    } catch (error) {
      console.error("Error generating system design:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate system design");

      setConversations(prev => [
        ...prev,
        {
          type: "response",
          content: "I encountered an error while generating your system design. Please try again.",
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
      setDesignProgress(null);
    }
  };

  const handleDiagramEdit = (diagramData: DiagramData, updatedPlantUML: string) => {
    // Update the diagram with edited PlantUML
    const updatedData = {
      ...diagramData,
      plantuml_code: updatedPlantUML,
      // Regenerate URL with updated code
      diagram_url: `https://www.plantuml.com/plantuml/img/${btoa(updatedPlantUML)}`
    };

    // Update the conversation with the edited diagram
    setConversations(prev =>
      prev.map(conv =>
        conv.diagramData?.id === diagramData.id
          ? { ...conv, diagramData: updatedData }
          : conv
      )
    );
  };

  return (
    <div className="relative flex flex-col h-screen overflow-hidden bg-gradient-to-b from-gray-900 to-black">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Fixed Header with Progress */}
      {isLoading && designProgress && (
        <div className="absolute top-4 right-4 z-20">
          <div className="flex flex-col items-end text-right bg-black/60 backdrop-blur-sm rounded-lg p-3">
            <div className="flex items-center text-blue-400 text-sm font-medium mb-2">
              <span className="animate-pulse mr-2">●</span>
              {designProgress.stage_description}
            </div>
            <div className="w-32 bg-gray-800 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.max(0, designProgress.progress)}%` }}
              />
            </div>
            <span className="text-xs text-gray-500 mt-1">
              {designProgress.progress}% complete
            </span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative z-10 min-h-0">
        {/* Conversation Area */}
        <div className="flex-1 overflow-y-auto p-4 pb-2 space-y-6 custom-scrollbar">
          {conversations.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-md bg-gray-900/50 backdrop-blur-sm p-8 rounded-xl border border-gray-800/50"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <span className="text-2xl">🏗️</span>
                </div>
                <h2 className="text-xl font-medium mb-3 text-white">System Design Studio</h2>
                <p className="text-gray-300 mb-6">
                  Describe any system architecture you want to design.
                  Our AI will analyze requirements, generate PlantUML diagrams, and provide interactive visualizations.
                </p>
                <div className="flex flex-col gap-3">
                  {[
                    "Design a video streaming platform like YouTube",
                    "Create a microservices e-commerce architecture",
                    "Build a real-time chat application system"
                  ].map(suggestion => (
                    <button
                      key={suggestion}
                      onClick={() => generateSystemDesignWithStreaming(suggestion)}
                      disabled={isLoading}
                      className="bg-gray-800/80 hover:bg-gray-700/80 px-4 py-2 rounded-full text-sm font-medium transition-all border border-gray-700/70 disabled:opacity-50"
                    >
                      "{suggestion}"
                    </button>
                  ))}
                </div>
              </motion.div>
            </div>
          ) : (
            <AnimatePresence>
              {conversations.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`${item.type === "prompt" ? "flex justify-end" : "flex justify-start"}`}
                >
                  <div 
                    className={`max-w-[90%] rounded-2xl p-4 shadow-lg ${
                      item.type === "prompt" 
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium" 
                        : "bg-gray-800/90 backdrop-blur-sm border border-gray-700/50 text-gray-100"
                    }`}
                  >
                    {/* Use MarkdownRenderer for response content */}
                    {item.type === "response" ? (
                      <div className="mb-4">
                        <MarkdownRenderer 
                          content={item.content} 
                          className="text-gray-100"
                        />
                      </div>
                    ) : (
                      <p className="text-sm mb-4">{item.content}</p>
                    )}
                    
                    {/* Diagram Display */}
                    {item.type === "response" && item.diagramData && (
                      <div className="mt-6">
                        {/* View Mode Toggle */}
                        <div className="flex items-center gap-2 mb-4">
                          <button
                            onClick={() => setCurrentViewMode("plantuml")}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                              currentViewMode === "plantuml"
                                ? "bg-blue-500 text-white"
                                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                            }`}
                          >
                            PlantUML View
                          </button>
                          <button
                            onClick={() => setCurrentViewMode("interactive")}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                              currentViewMode === "interactive"
                                ? "bg-purple-500 text-white"
                                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                            }`}
                          >
                            Interactive View
                          </button>
                        </div>

                        {/* Diagram Content */}
                        {currentViewMode === "plantuml" ? (
                          <DiagramViewer 
                            diagram={item.diagramData}
                            onEdit={(updatedCode) => handleDiagramEdit(item.diagramData!, updatedCode)}
                          />
                        ) : (
                          <InteractiveDiagram
                            plantUML={item.diagramData.plantuml_code}
                            d3Components={item.diagramData.d3_components}
                            onSave={(updatedComponents) => {
                              console.log("Saved D3 components:", updatedComponents);
                              toast.success("Diagram saved successfully!");
                            }}
                            onEdit={(nodeId, newLabel) => {
                              console.log("Edited node:", nodeId, newLabel);
                              toast.success("Node updated successfully!");
                            }}
                          />
                        )}
                      </div>
                    )}
                    
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Fixed Input Area at Bottom */}
        <div className="flex-shrink-0 p-4">
          <SystemDesignInput
            onSubmit={generateSystemDesignWithStreaming}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Enhanced loading overlay */}
      {isLoading && (
        <LoadingDiagram
          progress={designProgress?.progress || 0}
          stage={designProgress?.stage || "starting"}
          stageDescription={designProgress?.stage_description || "Initializing..."}
        />
      )}
    </div>
  );
}