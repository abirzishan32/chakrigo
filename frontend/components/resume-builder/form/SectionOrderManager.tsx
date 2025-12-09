"use client";

import React from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import DraggableSection from "../ui/DraggableSection";
import { useResume } from "@/app/(root)/resume-builder/contexts/ResumeContext";

export default function SectionOrderManager() {
  const { resumeData, updateSectionOrder, toggleSectionVisibility } = useResume();
  const { sections } = resumeData;

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = sections.findIndex((section) => section.id === active.id);
      const newIndex = sections.findIndex((section) => section.id === over.id);
      
      const newSections = arrayMove(sections, oldIndex, newIndex);
      updateSectionOrder(newSections);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white mb-2">Section Order & Visibility</h2>
      <p className="text-sm text-gray-400 mb-4">
        Drag and drop to reorder sections. Click the eye icon to toggle visibility.
      </p>
      
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {sections.map((section) => (
              <DraggableSection
                key={section.id}
                section={section}
                toggleVisibility={toggleSectionVisibility}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
} 