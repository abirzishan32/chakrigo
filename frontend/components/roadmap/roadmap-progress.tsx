"use client";

import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";

interface RoadmapProgressProps {
  progress: number;
  stage: string;
  stageDescription: string;
  status: "in_progress" | "complete" | "error";
}

export function RoadmapProgress({ progress, stage, stageDescription, status }: RoadmapProgressProps) {
  const getIcon = () => {
    switch (status) {
      case "complete":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-blue-600 animate-spin" />;
    }
  };

  const getProgressColor = () => {
    switch (status) {
      case "complete":
        return "bg-green-600";
      case "error":
        return "bg-red-600";
      default:
        return "bg-blue-600";
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            {getIcon()}
            <div className="flex-1">
              <h3 className="font-medium capitalize">{stage.replace('_', ' ')}</h3>
              <p className="text-sm text-gray-600">{stageDescription}</p>
            </div>
            <div className="text-sm font-medium">
              {progress >= 0 ? `${progress}%` : "Error"}
            </div>
          </div>
          
          <Progress 
            value={progress >= 0 ? progress : 0} 
            className="w-full"
          />
        </div>
      </CardContent>
    </Card>
  );
}