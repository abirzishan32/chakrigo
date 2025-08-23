"use client";

import { useRef, useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Clock, AlertCircle, BookOpen, Code, Lightbulb, Target, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface RoadmapLoadingProps {
  progress: number;
  stage: string;
  stageDescription: string;
  status: "in_progress" | "complete" | "error";
}

export function RoadmapLoading({ 
  progress = 0, 
  stage = "starting", 
  stageDescription = "Initializing..." 
}: RoadmapLoadingProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(null);
  const [animationTime, setAnimationTime] = useState(0);
  const [currentTip, setCurrentTip] = useState(0);

  // Career tips that rotate during loading
  const careerTips = [
    "💡 Consistent daily practice is more effective than intense weekend sessions",
    "🎯 Focus on building projects while learning - they showcase your skills best",
    "🤝 Join developer communities and contribute to open source projects",
    "📚 Learn the fundamentals deeply before jumping to advanced frameworks",
    "🔄 Stay updated with industry trends but don't chase every new technology",
    "⚡ Practice coding problems regularly to sharpen your problem-solving skills",
    "🌟 Build a portfolio that tells a story of your learning journey",
    "🎓 Consider mentorship - both having a mentor and mentoring others",
  ];

  // Map stages to phase indices and get appropriate messages
  const getPhaseFromStage = (stage: string): number => {
    switch (stage) {
      case "starting":
      case "career_analyzed":
        return 0;
      case "roadmap_generated":
        return 1;
      case "description_generated":
        return 2;
      case "roadmap_complete":
        return 3;
      default:
        return 0;
    }
  };

  const getPhaseMessages = (stage: string): string[] => {
    switch (stage) {
      case "starting":
        return ["Analyzing Career Path", "🎯", "Understanding your goals and market requirements..."];
      case "career_analyzed":
        return ["Building Learning Structure", "🏗️", "Creating personalized learning phases..."];
      case "roadmap_generated":
        return ["Generating Content", "📝", "Crafting detailed descriptions and resources..."];
      case "description_generated":
        return ["Finalizing Roadmap", "✨", "Adding finishing touches to your roadmap..."];
      case "roadmap_complete":
        return ["Complete!", "🎉", "Your personalized roadmap is ready!"];
      default:
        return ["Processing...", "⚙️", "Working on your roadmap..."];
    }
  };

  const phase = getPhaseFromStage(stage);
  const [phaseMessage, phaseIcon, phaseSubtext] = getPhaseMessages(stage);

  // Use provided stageDescription if available, otherwise fall back to our mapping
  const displayMessage = stageDescription !== "Initializing..." ? stageDescription : phaseMessage;

  // Rotate tips every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % careerTips.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [careerTips.length]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const setCanvasSize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    // Animation loop
    const animate = (time: number) => {
      setAnimationTime(time);
      
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      
      // Clear canvas with subtle gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, 'rgba(17, 24, 39, 0.95)');
      gradient.addColorStop(1, 'rgba(31, 41, 55, 0.95)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Draw animated roadmap elements
      drawRoadmapAnimation(ctx, width, height, time);

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', setCanvasSize);
    };
  }, []);

  const drawRoadmapAnimation = (ctx: CanvasRenderingContext2D, width: number, height: number, time: number) => {
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Draw animated learning path
    drawLearningPath(ctx, width, height, time);
    
    // Draw skill nodes
    drawSkillNodes(ctx, centerX, centerY, time);
    
    // Draw progress indicators
    drawProgressFlow(ctx, width, height, time);
  };

  const drawLearningPath = (ctx: CanvasRenderingContext2D, width: number, height: number, time: number) => {
    const pathOpacity = 0.3 + Math.sin(time * 0.001) * 0.1;
    
    // Draw winding learning path
    ctx.strokeStyle = `rgba(96, 165, 250, ${pathOpacity})`;
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 5]);
    
    ctx.beginPath();
    for (let i = 0; i < width; i += 10) {
      const y = height / 2 + Math.sin((i + time * 0.05) * 0.01) * 60;
      if (i === 0) {
        ctx.moveTo(i, y);
      } else {
        ctx.lineTo(i, y);
      }
    }
    ctx.stroke();
    ctx.setLineDash([]);
  };

  const drawSkillNodes = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, time: number) => {
    const skillNodes = [
      { x: centerX - 150, y: centerY - 100, type: 'foundation', icon: '📚' },
      { x: centerX + 50, y: centerY - 120, type: 'core', icon: '💻' },
      { x: centerX - 50, y: centerY + 60, type: 'advanced', icon: '🚀' },
      { x: centerX + 120, y: centerY + 80, type: 'project', icon: '🏗️' },
      { x: centerX + 200, y: centerY, type: 'milestone', icon: '🏆' },
    ];

    skillNodes.forEach((node, index) => {
      const pulse = 1 + Math.sin(time * 0.003 + index * 0.5) * 0.2;
      const size = 40 * pulse;
      
      // Node progress based on overall progress
      const nodeProgress = Math.max(0, Math.min(1, (progress - index * 20) / 20));
      
      // Node glow
      const gradient = ctx.createRadialGradient(
        node.x, node.y, 0,
        node.x, node.y, size
      );
      
      if (nodeProgress > 0) {
        gradient.addColorStop(0, `rgba(96, 165, 250, ${0.8 * nodeProgress})`);
        gradient.addColorStop(0.7, `rgba(59, 130, 246, ${0.4 * nodeProgress})`);
        gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
      } else {
        gradient.addColorStop(0, 'rgba(75, 85, 99, 0.3)');
        gradient.addColorStop(1, 'rgba(75, 85, 99, 0)');
      }

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(node.x, node.y, size / 2, 0, Math.PI * 2);
      ctx.fill();

      // Node icon (simplified representation)
      ctx.fillStyle = nodeProgress > 0 ? '#ffffff' : '#9CA3AF';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(node.icon, node.x, node.y + 5);
    });
  };

  const drawProgressFlow = (ctx: CanvasRenderingContext2D, width: number, height: number, time: number) => {
    const flowProgress = ((time * 0.002) + progress * 0.01) % 1;
    
    // Draw animated progress particles
    for (let i = 0; i < 5; i++) {
      const particleProgress = (flowProgress + i * 0.2) % 1;
      const x = particleProgress * width;
      const y = height / 2 + Math.sin((x + time * 0.05) * 0.01) * 60;
      
      const opacity = Math.sin(particleProgress * Math.PI) * 0.8;
      const size = 3 + Math.sin(particleProgress * Math.PI) * 2;
      
      ctx.fillStyle = `rgba(34, 197, 94, ${opacity})`;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  // Map stage to status indicators
  const getStatusSteps = (currentStage: string) => {
    const steps = [
      { name: 'Career Analysis', stages: ['starting', 'career_analyzed'], icon: Users },
      { name: 'Roadmap Structure', stages: ['roadmap_generated'], icon: Target },
      { name: 'Content Generation', stages: ['description_generated'], icon: BookOpen },
      { name: 'Finalization', stages: ['roadmap_complete'], icon: CheckCircle }
    ];

    return steps.map((step, index) => {
      const isActive = step.stages.includes(currentStage);
      const isCompleted = index < getPhaseFromStage(currentStage);
      const Icon = step.icon;
      
      return {
        ...step,
        isActive,
        isCompleted,
        icon: Icon
      };
    });
  };

  const statusSteps = getStatusSteps(stage);

  return (
    <div className="absolute inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center z-20">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ filter: 'contrast(1.1) saturate(1.2)' }}
      />
      
      <div className="relative z-10 max-w-2xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-8"
        >
          {/* Main Progress Card */}
          <Card className="bg-gray-900/90 border-gray-700 backdrop-blur-lg">
            <CardContent className="pt-6 space-y-6">
              {/* Current Phase */}
              <div className="space-y-3">
                <motion.div 
                  className="text-4xl"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {phaseIcon}
                </motion.div>
                <h2 className="text-xl font-semibold text-white">{displayMessage}</h2>
                <p className="text-sm text-gray-400">{phaseSubtext}</p>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Progress</span>
                  <span className="text-white font-medium">{progress}%</span>
                </div>
                <Progress 
                  value={progress} 
                  className="w-full h-2 bg-gray-700"
                />
              </div>

              {/* Status Steps */}
              <div className="flex justify-between items-center">
                {statusSteps.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <motion.div
                      key={step.name}
                      className="flex flex-col items-center space-y-1"
                      initial={{ scale: 0.8, opacity: 0.5 }}
                      animate={{ 
                        scale: step.isActive ? 1.1 : step.isCompleted ? 1 : 0.8,
                        opacity: step.isActive || step.isCompleted ? 1 : 0.5
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className={`p-2 rounded-full ${
                        step.isCompleted 
                          ? 'bg-green-600' 
                          : step.isActive 
                          ? 'bg-blue-600' 
                          : 'bg-gray-600'
                      }`}>
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-xs text-gray-400">{step.name}</span>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Career Tips */}
          <motion.div
            className="bg-gray-800/80 border border-gray-600 rounded-lg p-4 backdrop-blur-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="h-4 w-4 text-yellow-400" />
              <span className="text-sm font-medium text-gray-300">Career Tip</span>
            </div>
            <AnimatePresence mode="wait">
              <motion.p
                key={currentTip}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5 }}
                className="text-sm text-gray-400 leading-relaxed"
              >
                {careerTips[currentTip]}
              </motion.p>
            </AnimatePresence>
          </motion.div>

          {/* Fun fact about roadmap generation */}
          <motion.div
            className="text-xs text-gray-500 space-y-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
          >
            <p>🤖 AI is analyzing industry trends and learning patterns</p>
            <p>📊 Processing {Math.floor(progress * 12 + 50)}+ data points for your roadmap</p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
