"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { VideoVisualization } from "@/components/ai-animation/VideoVisualization";
import { PromptInput } from "@/components/ai-animation/PromptInput";
import { LoadingAnimation } from "@/components/ai-animation/LoadingAnimation";

interface AnimationProgress {
  status: "in_progress" | "complete" | "error";
  progress: number;
  stage: string;
  stage_description: string;
  error?: string;
  analysis?: any;
  code?: string;
  explanation?: string;
  video_url?: string;
  animation_id?: string;
}

export default function AIAnimationPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [animationProgress, setAnimationProgress] = useState<AnimationProgress | null>(null);
  const [conversations, setConversations] = useState<Array<{
    type: "prompt" | "response";
    content: string;
    timestamp: Date;
    videoUrl?: string | null;
    analysis?: any;
    code?: string;
  }>>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversations]);

  const generateAnimationWithStreaming = async (prompt: string) => {
    setIsLoading(true);
    setAnimationProgress(null);
    
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
      const response = await fetch(`${apiUrl}/ai-animation/generate-stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error("Failed to start animation generation");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No response stream available");
      }

      let finalResult: AnimationProgress | null = null;

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              setAnimationProgress(data);
              finalResult = data;
              
              // Update loading animation with current stage
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
        setConversations(prev => [
          ...prev, 
          { 
            type: "response", 
            content: finalResult.explanation || "Animation generation completed", 
            videoUrl: finalResult.video_url,
            analysis: finalResult.analysis,
            code: finalResult.code,
            timestamp: new Date() 
          }
        ]);

        if (finalResult.status === "error") {
          toast.error(finalResult.error || "Animation generation failed");
        } else {
          toast.success("Animation generated successfully!");
        }
      }

    } catch (error) {
      console.error("Error generating animation:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate animation");
      
      setConversations(prev => [
        ...prev, 
        { 
          type: "response", 
          content: "I encountered an error while generating your animation. Please try again.", 
          timestamp: new Date() 
        }
      ]);
    } finally {
      setIsLoading(false);
      setAnimationProgress(null);
    }
  };

  return (
    <div className="relative flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-gradient-to-b from-gray-900 to-black">
      {/* Background effects */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px] pointer-events-none" />
      <div className="absolute pointer-events-none inset-0 flex items-center justify-center bg-black/40 [mask-image:radial-gradient(ellipse_at_center,transparent_50%,black)]"></div>
      
      {/* Glowing orbs */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl opacity-15 animate-pulse" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl opacity-15 animate-pulse" />

      {/* Content area */}
      <div className="flex-1 flex flex-col p-4 overflow-hidden relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600 drop-shadow-sm">
              AI Animation Studio
            </h1>
            <p className="text-gray-400 text-sm mt-1">Powered by LangGraph & Manim</p>
          </div>
          
          {isLoading && animationProgress && (
            <div className="flex flex-col items-end text-right">
              <div className="flex items-center text-blue-400 text-sm font-medium mb-1">
                <span className="animate-pulse mr-2">●</span>
                {animationProgress.stage_description}
              </div>
              <div className="w-32 bg-gray-800 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(0, animationProgress.progress)}%` }}
                />
              </div>
              <span className="text-xs text-gray-500 mt-1">
                {animationProgress.progress}% complete
              </span>
            </div>
          )}
        </div>
        
        {/* Conversation Area */}
        <div className="flex-1 overflow-y-auto pr-4 space-y-6 pb-4 custom-scrollbar">
          {conversations.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-md bg-gray-900/50 backdrop-blur-sm p-8 rounded-xl border border-gray-800/50"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <span className="text-2xl">🎬</span>
                </div>
                <h2 className="text-xl font-medium mb-3 text-white">AI Animation Studio</h2>
                <p className="text-gray-300 mb-6">
                  Describe any concept, algorithm, or idea you want to visualize.
                  Our AI will analyze, generate, and render professional animations.
                </p>
                <div className="flex flex-col gap-3">
                  {[
                    "Visualize quicksort algorithm",
                    "Show how neural networks learn", 
                    "Animate the solar system"
                  ].map(suggestion => (
                    <button 
                      key={suggestion}
                      onClick={() => generateAnimationWithStreaming(suggestion)}
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
                    className={`max-w-[80%] rounded-2xl p-4 shadow-lg ${
                      item.type === "prompt" 
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium" 
                        : "bg-gray-800/90 backdrop-blur-sm border border-gray-700/50 text-gray-100"
                    }`}
                  >
                    <p className="text-sm mb-4">{item.content}</p>
                    
                    {item.type === "response" && item.videoUrl && (
                      <div className="mt-4">
                        <VideoVisualization videoUrl={item.videoUrl} />
                      </div>
                    )}
                    
                    {item.type === "response" && item.analysis && (
                      <details className="mt-4 text-xs">
                        <summary className="cursor-pointer text-blue-400 hover:text-blue-300">
                          View Analysis Details
                        </summary>
                        <pre className="mt-2 p-2 bg-gray-900/50 rounded text-green-400 overflow-auto">
                          {JSON.stringify(item.analysis, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Enhanced loading overlay with workflow progress */}
      {isLoading && (
        <LoadingAnimation 
          progress={animationProgress?.progress || 0}
          stage={animationProgress?.stage || "starting"}
          stageDescription={animationProgress?.stage_description || "Initializing..."}
        />
      )}
      
      {/* Prompt input */}
      <div className="w-full p-4 relative z-10 bg-gradient-to-t from-gray-900 to-transparent pt-8">
        <PromptInput 
          onSubmit={generateAnimationWithStreaming} 
          isLoading={isLoading} 
        />
      </div>
    </div>
  );
}