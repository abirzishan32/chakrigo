"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Search, Sparkles } from "lucide-react";

interface CareerInputProps {
  onGenerate: (careerPath: string) => void;
  isGenerating: boolean;
}

const popularCareers = [
  "Frontend Developer",
  "Backend Developer", 
  "Data Scientist",
  "DevOps Engineer",
  "UI/UX Designer",
  "Mobile Developer",
  "Blockchain Developer",
  "SQA Engineer",
  "Cybersecurity Specialist",
  "Machine Learning Engineer",
  "Cloud Architect",
  "Product Manager"
];

export function CareerInput({ onGenerate, isGenerating }: CareerInputProps) {
  const [careerPath, setCareerPath] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (careerPath.trim()) {
      onGenerate(careerPath.trim());
    }
  };

  const handleCareerSelect = (career: string) => {
    setCareerPath(career);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-gray-900 border-none">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-white">
          <Sparkles className="h-6 w-6 text-blue-400" />
          Career Roadmap Generator
        </CardTitle>
        <CardDescription className="text-gray-300">
          Enter a career path or skill to get a personalized learning roadmap
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="career-path" className="text-gray-200">Career Path or Skill</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="career-path"
                placeholder="e.g., Frontend Developer, Data Scientist, UI/UX Designer..."
                value={careerPath}
                onChange={(e) => setCareerPath(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
                disabled={isGenerating}
              />
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            disabled={!careerPath.trim() || isGenerating}
          >
            {isGenerating ? "Generating Roadmap..." : "Generate Roadmap"}
          </Button>
        </form>

        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-200">Popular Career Paths</Label>
          <div className="flex flex-wrap gap-2">
            {popularCareers.map((career) => (
              <Badge
                key={career}
                variant="secondary"
                className="cursor-pointer hover:bg-blue-600 hover:text-white transition-colors bg-gray-800 text-gray-200 border-gray-700"
                onClick={() => handleCareerSelect(career)}
              >
                {career}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}