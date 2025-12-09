"use client";

import React from "react";
import { useResume } from "@/app/(root)/resume-builder/contexts/ResumeContext";
import { useTheme } from "@/app/(root)/resume-builder/contexts/ThemeContext";
import { useEditMode } from "../ResumePreview";
import EditableText from "../../ui/EditableText";
import { Mail, Phone, MapPin, Globe, Linkedin, Github } from "lucide-react";

export default function GeneralInfoPreview() {
  const { resumeData, updateGeneralInfo } = useResume();
  const { theme, getElementStyles } = useTheme();
  const { selectedElement, setSelectedElement, setToolbarPosition } = useEditMode();
  const { generalInfo } = resumeData;

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
    <div className="relative pb-6 mb-6 border-b border-gray-300">
      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center mb-4">
        <div className="flex-1">
          <EditableText
            value={generalInfo.fullName}
            onChange={(value) => updateGeneralInfo({ fullName: value })}
            onSelect={(e) => handleSelect("fullName", e as any)}
            isSelected={selectedElement === "fullName"}
            placeholder="Your Name"
            as="h1"
            className="text-3xl font-bold text-gray-900"
            style={{ color: theme.colors.primary }}
            customStyles={getElementStyles("fullName")}
          />
          <EditableText
            value={generalInfo.title}
            onChange={(value) => updateGeneralInfo({ title: value })}
            onSelect={(e) => handleSelect("title", e as any)}
            isSelected={selectedElement === "title"}
            placeholder="Professional Title"
            as="p"
            className="text-xl text-gray-600 mt-1"
            customStyles={getElementStyles("title")}
          />
        </div>

        <div className="flex flex-wrap gap-4 mt-3 md:mt-0">
          {generalInfo.email && (
            <div className="flex items-center gap-1.5 text-gray-600">
              <Mail size={16} className="text-gray-500" />
              <span>{generalInfo.email}</span>
            </div>
          )}
          {generalInfo.phone && (
            <div className="flex items-center gap-1.5 text-gray-600">
              <Phone size={16} className="text-gray-500" />
              <span>{generalInfo.phone}</span>
            </div>
          )}
          {generalInfo.location && (
            <div className="flex items-center gap-1.5 text-gray-600">
              <MapPin size={16} className="text-gray-500" />
              <span>{generalInfo.location}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-4">
        {generalInfo.website && (
          <div className="flex items-center gap-1.5 text-gray-600">
            <Globe size={16} style={{ color: theme.colors.primary }} />
            <span>{generalInfo.website}</span>
          </div>
        )}
        {generalInfo.linkedin && (
          <div className="flex items-center gap-1.5 text-gray-600">
            <Linkedin size={16} style={{ color: theme.colors.primary }} />
            <span>{generalInfo.linkedin}</span>
          </div>
        )}
        {generalInfo.github && (
          <div className="flex items-center gap-1.5 text-gray-600">
            <Github size={16} style={{ color: theme.colors.primary }} />
            <span>{generalInfo.github}</span>
          </div>
        )}
      </div>

      {generalInfo.summary && (
        <EditableText
          value={generalInfo.summary}
          onChange={(value) => updateGeneralInfo({ summary: value })}
          onSelect={(e) => handleSelect("summary", e as any)}
          isSelected={selectedElement === "summary"}
          placeholder="Professional summary"
          as="p"
          className="text-gray-700"
          customStyles={getElementStyles("summary")}
        />
      )}
    </div>
  );
} 