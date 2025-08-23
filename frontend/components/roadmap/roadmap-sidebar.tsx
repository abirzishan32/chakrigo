"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, Clock, Target, Users } from "lucide-react";

interface RoadmapSidebarProps {
  metadata: any;
  phases: any[];
  analysis: any;
}

export function RoadmapSidebar({ metadata, phases, analysis }: RoadmapSidebarProps) {
  if (!metadata && !phases?.length && !analysis) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Roadmap Info */}
      {metadata && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2 text-white">
              <Target className="h-4 w-4" />
              Roadmap Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Duration</span>
                <span className="font-medium text-gray-200">{metadata.total_duration}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Difficulty</span>
                <Badge variant="outline" className="text-xs bg-gray-700 text-gray-200 border-gray-600">
                  {metadata.difficulty}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total Steps</span>
                <span className="font-medium text-gray-200">{metadata.total_nodes}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Learning Phases */}
      {analysis?.learning_phases && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2 text-white">
              <BookOpen className="h-4 w-4" />
              Learning Phases
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analysis.learning_phases.map((phase: any, index: number) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-xs text-gray-200">{phase.phase}</h4>
                    <Badge variant="secondary" className="text-xs bg-gray-700 text-gray-200 border-gray-600">
                      {phase.duration}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">{phase.focus}</p>
                  <Progress value={(index + 1) * 25} className="h-1" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Career Progression */}
      {analysis?.career_progression && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2 text-white">
              <Users className="h-4 w-4" />
              Career Path
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {analysis.career_progression.map((level: string, index: number) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                  <span className="text-xs text-gray-300">{level}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Prerequisites */}
      {analysis?.prerequisites && analysis.prerequisites.length > 0 && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2 text-white">
              <Clock className="h-4 w-4" />
              Prerequisites
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {analysis.prerequisites.map((prereq: string, index: number) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-gray-500"></div>
                  <span className="text-xs text-gray-300">{prereq}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}