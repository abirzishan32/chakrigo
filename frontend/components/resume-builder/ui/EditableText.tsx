"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

interface EditableTextProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (event: React.MouseEvent) => void;
  isSelected: boolean;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  customStyles?: {
    fontSize?: number;
    color?: string;
    fontWeight?: string;
    fontStyle?: string;
    textAlign?: string;
  };
}

export default function EditableText({
  value,
  onChange,
  onSelect,
  isSelected,
  placeholder = "Click to edit",
  className = "",
  style = {},
  as: Component = "p",
  customStyles = {},
}: EditableTextProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(e);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (localValue !== value) {
      onChange(localValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleBlur();
    }
    if (e.key === "Escape") {
      setLocalValue(value);
      setIsEditing(false);
    }
  };

  const mergedStyles: React.CSSProperties = {
    ...style,
    fontSize: customStyles.fontSize ? `${customStyles.fontSize}px` : style.fontSize,
    color: customStyles.color || style.color,
    fontWeight: customStyles.fontWeight || style.fontWeight,
    fontStyle: customStyles.fontStyle || style.fontStyle,
    textAlign: (customStyles.textAlign as any) || style.textAlign,
    transition: "all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
  };

  const displayValue = localValue || placeholder;
  const showPlaceholder = !localValue;

  return (
    <motion.div
      ref={containerRef}
      className={`relative group cursor-pointer ${className}`}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      animate={isSelected ? {
        scale: 1.01,
      } : {
        scale: 1,
      }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 25,
      }}
    >
      {isEditing ? (
        Component === "p" || Component === "span" ? (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="text"
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className={`w-full bg-transparent border-none outline-none ${className}`}
            style={mergedStyles}
          />
        ) : (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className={`w-full bg-transparent border-none outline-none resize-none ${className}`}
            style={mergedStyles}
            rows={3}
          />
        )
      ) : (
        <Component
          className={`${showPlaceholder ? "text-gray-400 italic" : ""}`}
          style={mergedStyles}
        >
          {displayValue}
        </Component>
      )}

      {/* Glowing Border on Selection */}
      {isSelected && !isEditing && (
        <motion.div
          className="absolute inset-0 rounded pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            border: "2px solid #3b82f6",
            boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.2), 0 0 12px rgba(59, 130, 246, 0.4)",
          }}
        />
      )}

      {/* Hover Indicator */}
      {!isSelected && !isEditing && (
        <div className="absolute inset-0 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-blue-300/50" />
      )}
    </motion.div>
  );
}
