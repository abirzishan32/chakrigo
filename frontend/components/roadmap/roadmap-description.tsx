"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { TrendingUp, Clock, BarChart3, ChevronDown, ChevronUp, BookOpen, DollarSign } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";


interface RoadmapDescriptionProps {
  analysis: any;
  description: string;
  metadata: any;
  compact?: boolean;
}

export function RoadmapDescription({ analysis, description, metadata, compact = false }: RoadmapDescriptionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!analysis && !description) {
    return null;
  }

  if (compact) {
    return (
      <div className="space-y-3">
        {/* Compact Career Overview */}
        {analysis && (
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-white">
                <TrendingUp className="h-4 w-4" />
                Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Title:</span>
                  <span className="font-medium text-gray-200">{analysis.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Duration:</span>
                  <span className="font-medium text-gray-200">{analysis.estimated_duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Level:</span>
                  <Badge variant="secondary" className="text-xs bg-gray-700 text-gray-200 border-gray-600">
                    {analysis.difficulty_level}
                  </Badge>
                </div>
              </div>

              {analysis.core_skills && (
                <>
                  <Separator className="bg-gray-600" />
                  <div className="space-y-1">
                    <h4 className="font-medium text-xs text-white">Key Skills</h4>
                    <div className="flex flex-wrap gap-1">
                      {analysis.core_skills.slice(0, 3).map((skill: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs px-1 py-0 bg-gray-700 text-gray-200 border-gray-600">
                          {skill}
                        </Badge>
                      ))}
                      {analysis.core_skills.length > 3 && (
                        <Badge variant="outline" className="text-xs px-1 py-0 bg-gray-700 text-gray-200 border-gray-600">
                          +{analysis.core_skills.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Compact Description Preview */}
        {description && (
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-white">
                <BookOpen className="h-4 w-4" />
                Learning Guide
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AnimatePresence mode="wait">
                {!isExpanded ? (
                  <motion.div
                    key="preview"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-xs text-gray-300 leading-relaxed"
                  >
                    {description.length > 200 
                      ? `${description.substring(0, 200)}...` 
                      : description
                    }
                  </motion.div>
                ) : (
                  <motion.div
                    key="full"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="prose prose-xs prose-invert max-w-none"
                  >
                    <ReactMarkdown
                      components={{
                        h1: ({ children }) => <h1 className="text-sm font-bold text-white mb-2">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-xs font-semibold text-gray-200 mb-1">{children}</h2>,
                        p: ({ children }) => <p className="text-xs text-gray-300 mb-2 leading-relaxed">{children}</p>,
                        ul: ({ children }) => <ul className="text-xs text-gray-300 mb-2 pl-3 list-disc">{children}</ul>,
                        li: ({ children }) => <li className="text-xs mb-1">{children}</li>,
                        strong: ({ children }) => <strong className="font-semibold text-gray-200">{children}</strong>,
                        code: ({ children }) => <code className="bg-gray-700 px-1 py-0.5 rounded text-xs text-blue-200">{children}</code>,
                      }}
                    >
                      {description}
                    </ReactMarkdown>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {description.length > 200 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-xs text-blue-400 hover:text-blue-300 hover:bg-gray-700/50 p-1 h-auto mt-2"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="h-3 w-3 mr-1" />
                      Show less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3 w-3 mr-1" />
                      Read full guide
                    </>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Career Overview */}
      {analysis && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-white">
              <TrendingUp className="h-4 w-4" />
              Career Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-400">Title:</span>
                <p className="font-medium text-white">{analysis.title}</p>
              </div>
              <div>
                <span className="text-gray-400">Duration:</span>
                <p className="font-medium text-white">{analysis.estimated_duration}</p>
              </div>
            </div>

            {analysis.core_skills && (
              <>
                <Separator className="bg-gray-600" />
                <div>
                  <h4 className="text-sm font-medium mb-2 text-white">Core Skills</h4>
                  <div className="flex flex-wrap gap-1">
                    {analysis.core_skills.map((skill: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs bg-gray-700 text-gray-200 border-gray-600">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Learning Guide */}
      {description && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-white">
              <BookOpen className="h-4 w-4" />
              Learning Guide
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm prose-invert max-w-none">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => <h1 className="text-lg font-bold text-white mb-3">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-base font-semibold text-gray-200 mb-2">{children}</h2>,
                  p: ({ children }) => <p className="text-sm text-gray-300 mb-3 leading-relaxed">{children}</p>,
                  ul: ({ children }) => <ul className="text-sm text-gray-300 mb-3 pl-4 list-disc">{children}</ul>,
                  li: ({ children }) => <li className="mb-1">{children}</li>,
                  strong: ({ children }) => <strong className="font-semibold text-gray-200">{children}</strong>,
                  code: ({ children }) => <code className="bg-gray-700 px-1 py-0.5 rounded text-xs text-blue-200">{children}</code>,
                }}
              >
                {description}
              </ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}