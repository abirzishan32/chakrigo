"use client";

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResumeProvider } from "./contexts/ResumeContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import GeneralInfoForm from "@/components/resume-builder/form/GeneralInfoForm";
import WorkExperienceForm from "@/components/resume-builder/form/WorkExperienceForm";
import EducationForm from "@/components/resume-builder/form/EducationForm";
import ProjectsForm from "@/components/resume-builder/form/ProjectsForm";
import SkillsForm from "@/components/resume-builder/form/SkillsForm";
import CertificationsForm from "@/components/resume-builder/form/CertificationsForm";
import ResumePreview from "@/components/resume-builder/preview/ResumePreview";
import ThemeCustomizer from "@/components/resume-builder/form/ThemeCustomizer";
import SectionOrderManager from "@/components/resume-builder/form/SectionOrderManager";
import { Palette, Layers, User, Briefcase, GraduationCap, FolderGit2, Code, Award, FileText, PenTool, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ResumeBuilder() {
  const [editorMode, setEditorMode] = useState<"content" | "design">("content");
  const [contentTab, setContentTab] = useState("personal");

  return (
    <ResumeProvider>
      <ThemeProvider>
        {/* Full viewport seamless split-screen layout */}
        <div className="flex h-screen w-screen overflow-hidden bg-[#0F1419]">
          
          {/* LEFT PANEL - Resume Editor (50% width) */}
          <div className="w-1/2 h-full flex flex-col bg-[#0F1419] border-r border-gray-800">
            
            {/* Editor Header */}
            <div className="bg-[#1A1F2E] px-6 py-4 border-b border-gray-800 flex items-center justify-between flex-shrink-0">
              <h2 className="text-lg font-semibold flex items-center text-white">
                <FileText size={18} className="mr-2 text-blue-400" />
                Resume Editor
              </h2>
              
              <span className={`text-xs font-medium ${editorMode === "content" ? "text-blue-400" : "text-purple-400"}`}>
                {editorMode === "content" ? "Content Editing" : "Design"}
              </span>
            </div>

            {/* Mode Toggle Tabs */}
            <Tabs 
              value={editorMode} 
              onValueChange={(value) => setEditorMode(value as "content" | "design")} 
              defaultValue="content"
              className="flex-1 flex flex-col overflow-hidden"
            >
              <TabsList className="w-full grid grid-cols-2 bg-[#1A1F2E] rounded-none h-12 p-0 m-0 flex-shrink-0 border-b border-gray-800">
                <TabsTrigger 
                  value="content" 
                  className="rounded-none data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all duration-200 h-full flex gap-2 items-center justify-center text-gray-400 data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-blue-500"
                >
                  <FileText size={16} />
                  <span>Content</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="design" 
                  className="rounded-none data-[state=active]:bg-purple-600 data-[state=active]:text-white transition-all duration-200 h-full flex gap-2 items-center justify-center text-gray-400 data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-purple-500"
                >
                  <PenTool size={16} />
                  <span>Design</span>
                </TabsTrigger>
              </TabsList>

              {/* Content Tab Panel */}
              <AnimatePresence mode="wait">
                {editorMode === "content" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="flex-1 overflow-hidden"
                  >
                    <TabsContent value="content" className="m-0 h-full flex flex-col">
                      <Tabs 
                        value={contentTab} 
                        onValueChange={setContentTab} 
                        defaultValue="personal"
                        className="flex-1 flex flex-col overflow-hidden"
                      >
                        {/* Section Navigation */}
                        <div className="bg-[#1A1F2E] px-4 py-2 overflow-x-auto flex-shrink-0 border-b border-gray-800">
                          <TabsList className="bg-transparent p-0 w-auto flex gap-1">
                            <TabsTrigger 
                              value="personal" 
                              className="px-3 py-2 rounded-md data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300 flex items-center gap-1.5 transition-all text-gray-400 text-sm"
                            >
                              <User size={14} />
                              <span>Personal</span>
                            </TabsTrigger>
                            <TabsTrigger 
                              value="work" 
                              className="px-3 py-2 rounded-md data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300 flex items-center gap-1.5 transition-all text-gray-400 text-sm"
                            >
                              <Briefcase size={14} />
                              <span>Work</span>
                            </TabsTrigger>
                            <TabsTrigger 
                              value="education" 
                              className="px-3 py-2 rounded-md data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300 flex items-center gap-1.5 transition-all text-gray-400 text-sm"
                            >
                              <GraduationCap size={14} />
                              <span>Education</span>
                            </TabsTrigger>
                            <TabsTrigger 
                              value="projects" 
                              className="px-3 py-2 rounded-md data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300 flex items-center gap-1.5 transition-all text-gray-400 text-sm"
                            >
                              <FolderGit2 size={14} />
                              <span>Projects</span>
                            </TabsTrigger>
                            <TabsTrigger 
                              value="skills" 
                              className="px-3 py-2 rounded-md data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300 flex items-center gap-1.5 transition-all text-gray-400 text-sm"
                            >
                              <Code size={14} />
                              <span>Skills</span>
                            </TabsTrigger>
                            <TabsTrigger 
                              value="certifications" 
                              className="px-3 py-2 rounded-md data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300 flex items-center gap-1.5 transition-all text-gray-400 text-sm"
                            >
                              <Award size={14} />
                              <span>Certifications</span>
                            </TabsTrigger>
                          </TabsList>
                        </div>

                        {/* Form Content Area */}
                        <div className="flex-1 overflow-y-auto px-6 py-6">
                          <AnimatePresence mode="wait">
                            <motion.div
                              key={contentTab}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.1 }}
                            >
                              <TabsContent value="personal" className="m-0">
                                <GeneralInfoForm />
                              </TabsContent>
                              
                              <TabsContent value="work" className="m-0">
                                <WorkExperienceForm />
                              </TabsContent>
                              
                              <TabsContent value="education" className="m-0">
                                <EducationForm />
                              </TabsContent>
                              
                              <TabsContent value="projects" className="m-0">
                                <ProjectsForm />
                              </TabsContent>
                              
                              <TabsContent value="skills" className="m-0">
                                <SkillsForm />
                              </TabsContent>
                              
                              <TabsContent value="certifications" className="m-0">
                                <CertificationsForm />
                              </TabsContent>
                            </motion.div>
                          </AnimatePresence>
                        </div>
                      </Tabs>
                    </TabsContent>
                  </motion.div>
                )}

                {/* Design Tab Panel */}
                {editorMode === "design" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="flex-1 overflow-hidden"
                  >
                    <TabsContent value="design" className="m-0 h-full">
                      <div className="h-full overflow-y-auto px-6 py-6">
                        <div className="mb-6 p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                          <div className="flex items-center mb-4">
                            <Palette className="mr-2 text-purple-400" size={20} />
                            <h3 className="text-base font-medium text-white">Theme & Styling</h3>
                          </div>
                          <ThemeCustomizer />
                        </div>
                        
                        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                          <div className="flex items-center mb-4">
                            <Layers className="mr-2 text-amber-400" size={20} />
                            <h3 className="text-base font-medium text-white">Section Order</h3>
                          </div>
                          <SectionOrderManager />
                        </div>
                      </div>
                    </TabsContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Tabs>
          </div>

          {/* RIGHT PANEL - Live Preview (50% width) */}
          <div className="w-1/2 h-full flex flex-col bg-[#1F2937]">
            
            {/* Preview Header */}
            <div className="bg-[#1A1F2E] px-6 py-4 border-b border-gray-800 flex items-center justify-between flex-shrink-0">
              <h3 className="text-lg font-semibold flex items-center text-white">
                <Eye size={18} className="text-purple-400 mr-2" />
                Live Preview
              </h3>
              <span className="text-xs text-gray-400">Updates in real-time</span>
            </div>
            
            {/* Preview Content Area */}
            <div className="flex-1 overflow-auto bg-[#2D3748] p-8">
              <ResumePreview />
            </div>
          </div>
        </div>
      </ThemeProvider>
    </ResumeProvider>
  );
}
