"use client";

import React, { useRef, useState, createContext, useContext } from "react";
import { useReactToPrint } from "react-to-print";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import { useResume } from "@/app/(root)/resume-builder/contexts/ResumeContext";
import { useTheme, ElementStyles } from "@/app/(root)/resume-builder/contexts/ThemeContext";
import GeneralInfoPreview from "./sections/GeneralInfoPreview";
import WorkExperiencePreview from "./sections/WorkExperiencePreview";
import EducationPreview from "./sections/EducationPreview";
import ProjectsPreview from "./sections/ProjectsPreview";
import SkillsPreview from "./sections/SkillsPreview";
import CertificationsPreview from "./sections/CertificationsPreview";
import FloatingToolbar from "../ui/FloatingToolbar";
import { SectionKey } from "@/app/(root)/resume-builder/types";

interface EditModeContextType {
  selectedElement: string | null;
  setSelectedElement: (id: string | null) => void;
  toolbarPosition: { x: number; y: number };
  setToolbarPosition: (pos: { x: number; y: number }) => void;
}

const EditModeContext = createContext<EditModeContextType>({
  selectedElement: null,
  setSelectedElement: () => {},
  toolbarPosition: { x: 0, y: 0 },
  setToolbarPosition: () => {},
});

export const useEditMode = () => useContext(EditModeContext);

const ResumePreview: React.FC = () => {
  const { resumeData, visibleSections = [] } = useResume();
  const { 
    theme, 
    getFontSizeClass, 
    getLineHeightClass,
    updateElementStyles,
    resetElementStyles,
    getElementStyles,
  } = useTheme();
  const resumeRef = useRef<HTMLDivElement>(null);
  
  // Edit mode state
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [toolbarPosition, setToolbarPosition] = useState({ x: 0, y: 0 });

  const handlePrint = useReactToPrint({
    documentTitle: `${resumeData?.generalInfo?.fullName || "Resume"}_${new Date().toLocaleDateString()}`,
    onBeforeGetContent: () => {
      return new Promise<void>((resolve) => {
        resolve();
      });
    },
    contentRef: resumeRef,
    removeAfterPrint: true,
  });

  const handleStyleChange = (styles: Partial<ElementStyles>) => {
    if (selectedElement) {
      updateElementStyles(selectedElement, styles);
    }
  };

  const handleResetStyles = () => {
    if (selectedElement) {
      resetElementStyles(selectedElement);
    }
  };

  const handleElementSelect = (elementId: string, event: React.MouseEvent) => {
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // Position toolbar above element, or below if not enough space
    const toolbarHeight = 200; // Approximate toolbar height
    const spaceAbove = rect.top;
    const yPosition = spaceAbove > toolbarHeight 
      ? rect.top + scrollTop - toolbarHeight - 10
      : rect.bottom + scrollTop + 10;
    
    setToolbarPosition({
      x: Math.min(rect.left, window.innerWidth - 400), // Keep toolbar in viewport
      y: yPosition,
    });
    setSelectedElement(elementId);
  };

  const handleBackgroundClick = () => {
    setSelectedElement(null);
  };

  const currentStyles = selectedElement 
    ? {
        fontSize: getElementStyles(selectedElement).fontSize || theme.typography.fontSize,
        color: getElementStyles(selectedElement).color || theme.colors.text,
        fontWeight: getElementStyles(selectedElement).fontWeight || "normal",
        fontStyle: getElementStyles(selectedElement).fontStyle || "normal",
        textAlign: getElementStyles(selectedElement).textAlign || "left",
      }
    : {
        fontSize: theme.typography.fontSize,
        color: theme.colors.text,
        fontWeight: "normal",
        fontStyle: "normal",
        textAlign: "left",
      };

  // Apply typography and spacing classes
  const fontSizeClass = getFontSizeClass();
  const lineHeightClass = getLineHeightClass();
  
  // Determine if any sections are visible
  const hasVisibleSections = visibleSections && visibleSections.length > 0;

  // Map section keys to their respective components
  const renderSection = (sectionKey: SectionKey) => {
    switch (sectionKey) {
      case "workExperiences":
        return <WorkExperiencePreview key={sectionKey} />;
      case "education":
        return <EducationPreview key={sectionKey} />;
      case "projects":
        return <ProjectsPreview key={sectionKey} />;
      case "skills":
        return <SkillsPreview key={sectionKey} />;
      case "certifications":
        return <CertificationsPreview key={sectionKey} />;
      default:
        return null;
    }
  };

  // Get sections in the correct order
  const orderedSections = resumeData.sections
    .filter(section => section.enabled)
    .map(section => section.id);

  return (
    <EditModeContext.Provider
      value={{
        selectedElement,
        setSelectedElement,
        toolbarPosition,
        setToolbarPosition,
      }}
    >
      <div className="flex flex-col h-full">
        {/* Action Buttons Bar */}
        <div className="bg-[#1A1F2E] px-6 py-3 flex justify-between items-center border-b border-gray-800">
          <h2 className="text-white font-medium text-sm">Preview</h2>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
              onClick={handlePrint}
            >
              <Printer size={16} className="mr-2" />
              Print
            </Button>
            <Button 
              size="sm" 
              onClick={handlePrint}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Download size={16} className="mr-2" />
              Export PDF
            </Button>
          </div>
        </div>
        
        {/* Resume Card Container - Full width white background */}
        <div className="flex-1 overflow-auto bg-white" onClick={handleBackgroundClick}>
          <div className="max-w-[850px] mx-auto">
            <div
              ref={resumeRef}
              className={`bg-white p-8 w-full ${fontSizeClass} ${lineHeightClass}`}
              style={{ color: "#333" }}
            >
              {hasVisibleSections ? (
                <>
                  <GeneralInfoPreview />
                  
                  <div className="space-y-6" style={{ marginTop: `${theme.spacing.sectionGap}px` }}>
                    {orderedSections.map(sectionKey => renderSection(sectionKey))}
                  </div>
                </>
              ) : (
                <div className="text-center py-16 text-gray-500">
                  <p>No sections are currently visible.</p>
                  <p className="text-sm">Enable sections in the Design tab to display content.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Floating Toolbar */}
        <FloatingToolbar
          isVisible={selectedElement !== null}
          position={toolbarPosition}
          currentStyles={currentStyles}
          onStyleChange={handleStyleChange}
          onReset={handleResetStyles}
        />
      </div>
    </EditModeContext.Provider>
  );
};

export default ResumePreview; 