"use client";

import React from "react";
import { useResume } from "@/app/(root)/resume-builder/contexts/ResumeContext";
import { useTheme } from "@/app/(root)/resume-builder/contexts/ThemeContext";
import { useEditMode } from "../ResumePreview";
import EditableText from "../../ui/EditableText";
import { Briefcase } from "lucide-react";

const WorkExperiencePreview: React.FC = () => {
  const { resumeData, visibleSections = [], updateWorkExperience } = useResume();
  const { theme, getElementStyles } = useTheme();
  const { selectedElement, setSelectedElement, setToolbarPosition } = useEditMode();

  if (!visibleSections?.includes("workExperiences") || !resumeData?.workExperiences || resumeData.workExperiences.length === 0) {
    return null;
  }

  const handleSelect = (elementId: string, event: React.MouseEvent) => {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    const toolbarHeight = 200;
    const spaceAbove = rect.top;
    const yPosition = spaceAbove > toolbarHeight 
      ? rect.top + scrollTop - toolbarHeight - 10
      : rect.bottom + scrollTop + 10;
    
    setToolbarPosition({
      x: Math.min(rect.left, window.innerWidth - 400),
      y: yPosition,
    });
    setSelectedElement(elementId);
  };

  return (
    <div className="mb-6">
      <div className="flex items-center mb-2">
        <Briefcase size={16} className="mr-2 text-gray-700" />
        <EditableText
          value="Work Experience"
          onChange={() => {}} // Section headers are static
          onSelect={(e) => handleSelect("workExperienceHeader", e)}
          isSelected={selectedElement === "workExperienceHeader"}
          as="h2"
          className="text-lg font-bold text-gray-800"
          customStyles={getElementStyles("workExperienceHeader")}
        />
      </div>

      <div className="space-y-4">
        {resumeData.workExperiences.map((experience) => (
          <div key={experience.id} className="border-l-2 pl-4 py-2" style={{ borderColor: theme.colors?.primary || "#3b82f6" }}>
            <div className="mb-1">
              <EditableText
                value={experience.title}
                onChange={(value) => updateWorkExperience(experience.id, { title: value })}
                onSelect={(e) => handleSelect(`workTitle-${experience.id}`, e)}
                isSelected={selectedElement === `workTitle-${experience.id}`}
                placeholder="Position"
                as="h3"
                className="font-semibold text-gray-800"
                customStyles={getElementStyles(`workTitle-${experience.id}`)}
              />
              <div className="flex flex-wrap justify-between text-sm">
                <p className="text-gray-700">
                  {experience.company || "Company"}
                  {experience.location ? ` • ${experience.location}` : ""}
                </p>
                <p className="text-gray-500">
                  {experience.startDate || "Start Date"} - {experience.current ? "Present" : experience.endDate || "End Date"}
                </p>
              </div>
            </div>

            {experience.description && (
              <EditableText
                value={experience.description}
                onChange={(value) => updateWorkExperience(experience.id, { description: value })}
                onSelect={(e) => handleSelect(`workDesc-${experience.id}`, e)}
                isSelected={selectedElement === `workDesc-${experience.id}`}
                placeholder="Job description"
                as="p"
                className="text-sm text-gray-600 mt-1"
                customStyles={getElementStyles(`workDesc-${experience.id}`)}
              />
            )}

            {experience.highlights && experience.highlights.length > 0 && (
              <ul className="list-disc list-inside text-sm mt-2 space-y-1 text-gray-700">
                {experience.highlights.map((highlight, index) => (
                  <li key={index} className="ml-1">{highlight}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkExperiencePreview; 