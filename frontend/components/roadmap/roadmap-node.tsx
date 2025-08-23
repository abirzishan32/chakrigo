"use client";

import { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, BookOpen, Code, Target, Lightbulb, Trophy, Star, Zap, Briefcase, Rocket } from "lucide-react";

interface RoadmapNodeData {
  title: string;
  description: string;
  type: "foundation" | "core" | "advanced" | "project" | "milestone";
  duration: string;
  skills_gained?: string[];
  projects?: string[];
}

const nodeTypeConfig = {
  foundation: {
    background: "bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800",
    border: "border-blue-400",
    shadow: "shadow-lg shadow-blue-500/25",
    icon: BookOpen,
    iconColor: "text-blue-200",
    badge: "Foundation",
    badgeStyle: "bg-blue-500 text-blue-50 border-blue-300",
    textColor: "text-blue-50",
    titleColor: "text-white",
    accentColor: "bg-blue-500/20",
    hoverEffect: "hover:shadow-xl hover:shadow-blue-500/30 hover:scale-105"
  },
  core: {
    background: "bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800",
    border: "border-emerald-400",
    shadow: "shadow-lg shadow-emerald-500/25",
    icon: Code,
    iconColor: "text-emerald-200",
    badge: "Core Skills",
    badgeStyle: "bg-emerald-500 text-emerald-50 border-emerald-300",
    textColor: "text-emerald-50",
    titleColor: "text-white",
    accentColor: "bg-emerald-500/20",
    hoverEffect: "hover:shadow-xl hover:shadow-emerald-500/30 hover:scale-105"
  },
  advanced: {
    background: "bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800",
    border: "border-purple-400",
    shadow: "shadow-lg shadow-purple-500/25",
    icon: Lightbulb,
    iconColor: "text-purple-200",
    badge: "Advanced",
    badgeStyle: "bg-purple-500 text-purple-50 border-purple-300",
    textColor: "text-purple-50",
    titleColor: "text-white",
    accentColor: "bg-purple-500/20",
    hoverEffect: "hover:shadow-xl hover:shadow-purple-500/30 hover:scale-105"
  },
  project: {
    background: "bg-gradient-to-br from-orange-600 via-orange-700 to-orange-800",
    border: "border-orange-400",
    shadow: "shadow-lg shadow-orange-500/25",
    icon: Rocket,
    iconColor: "text-orange-200",
    badge: "Project",
    badgeStyle: "bg-orange-500 text-orange-50 border-orange-300",
    textColor: "text-orange-50",
    titleColor: "text-white",
    accentColor: "bg-orange-500/20",
    hoverEffect: "hover:shadow-xl hover:shadow-orange-500/30 hover:scale-105"
  },
  milestone: {
    background: "bg-gradient-to-br from-amber-600 via-amber-700 to-amber-800",
    border: "border-amber-400",
    shadow: "shadow-lg shadow-amber-500/25",
    icon: Trophy,
    iconColor: "text-amber-200",
    badge: "Milestone",
    badgeStyle: "bg-amber-500 text-amber-50 border-amber-300",
    textColor: "text-amber-50",
    titleColor: "text-white",
    accentColor: "bg-amber-500/20",
    hoverEffect: "hover:shadow-xl hover:shadow-amber-500/30 hover:scale-105"
  }
};

export const RoadmapNode = memo(({ data }: NodeProps<RoadmapNodeData>) => {
  const config = nodeTypeConfig[data.type] || nodeTypeConfig.core;
  const Icon = config.icon;

  return (
    <div className="min-w-[380px] max-w-[420px] group"> {/* Increased node width for better spacing */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-5 h-5 !bg-white !border-3 !border-gray-300 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        style={{ top: -10 }}
      />
      
      <Card className={`
        ${config.background} 
        ${config.border} 
        ${config.shadow} 
        ${config.hoverEffect}
        border-2 transition-all duration-300 transform-gpu
        backdrop-blur-sm relative overflow-hidden
      `}>
        {/* Subtle pattern overlay for texture */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
        </div>
        
        <CardHeader className="pb-4 relative z-10">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1">
              <div className={`
                p-2 rounded-lg ${config.accentColor} 
                border border-white/20 backdrop-blur-sm
              `}>
                <Icon className={`h-5 w-5 ${config.iconColor}`} />
              </div>
              <div className="flex-1">
                <CardTitle className={`
                  text-lg font-bold leading-tight ${config.titleColor} 
                  drop-shadow-sm mb-1
                `}>
                  {data.title}
                </CardTitle>
                <Badge className={`
                  ${config.badgeStyle} text-xs font-medium px-2 py-1
                  border backdrop-blur-sm
                `}>
                  {config.badge}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4 relative z-10">
          <p className={`
            text-sm leading-relaxed ${config.textColor} 
            font-medium opacity-95 line-clamp-3
          `}>
            {data.description}
          </p>
          
          <div className={`
            flex items-center gap-2 text-sm ${config.textColor} 
            ${config.accentColor} rounded-lg px-3 py-2 
            border border-white/10 backdrop-blur-sm
          `}>
            <Clock className="h-4 w-4 flex-shrink-0" />
            <span className="font-semibold">{data.duration}</span>
          </div>
          
          {data.skills_gained && data.skills_gained.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Star className={`h-4 w-4 ${config.iconColor}`} />
                <p className={`text-sm font-semibold ${config.titleColor}`}>
                  Key Skills
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {data.skills_gained.slice(0, 3).map((skill, index) => (
                  <Badge 
                    key={index} 
                    variant="outline" 
                    className={`
                      text-xs px-2 py-1 bg-white/10 ${config.textColor} 
                      border-white/20 hover:bg-white/20 transition-colors
                      backdrop-blur-sm font-medium
                    `}
                  >
                    {skill}
                  </Badge>
                ))}
                {data.skills_gained.length > 3 && (
                  <Badge 
                    variant="outline" 
                    className={`
                      text-xs px-2 py-1 bg-white/10 ${config.textColor} 
                      border-white/20 hover:bg-white/20 transition-colors
                      backdrop-blur-sm font-medium
                    `}
                  >
                    +{data.skills_gained.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}
          
          {data.projects && data.projects.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Briefcase className={`h-4 w-4 ${config.iconColor}`} />
                <p className={`text-sm font-semibold ${config.titleColor}`}>
                  Featured Project
                </p>
              </div>
              <div className={`
                text-sm leading-relaxed ${config.textColor} 
                ${config.accentColor} rounded-lg px-3 py-2.5
                border border-white/10 backdrop-blur-sm
                italic font-medium
              `}>
                "{data.projects[0]}"
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-5 h-5 !bg-white !border-3 !border-gray-300 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        style={{ bottom: -10 }}
      />
    </div>
  );
});

RoadmapNode.displayName = "RoadmapNode";