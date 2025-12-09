"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bold, 
  Italic, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  RotateCcw,
  Type
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface FloatingToolbarProps {
  isVisible: boolean;
  position: { x: number; y: number };
  currentStyles: {
    fontSize: number;
    color: string;
    fontWeight: string;
    fontStyle: string;
    textAlign: string;
  };
  onStyleChange: (styles: Partial<FloatingToolbarProps['currentStyles']>) => void;
  onReset: () => void;
}

const PRESET_COLORS = [
  "#333333", // Default text
  "#3b82f6", // Blue
  "#8b5cf6", // Purple
  "#10b981", // Green
  "#f59e0b", // Amber
  "#ef4444", // Red
  "#6b7280", // Gray
];

export default function FloatingToolbar({
  isVisible,
  position,
  currentStyles,
  onStyleChange,
  onReset,
}: FloatingToolbarProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ 
            type: "spring", 
            stiffness: 400, 
            damping: 25,
            duration: 0.2 
          }}
          className="fixed z-50 bg-[#1A1F2E] border border-gray-700 rounded-lg shadow-2xl p-3"
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
            minWidth: "380px",
          }}
        >
          {/* Font Size Section */}
          <div className="mb-3 pb-3 border-b border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-gray-300 text-sm">
                <Type size={14} />
                <span>Font Size</span>
              </div>
              <span className="text-xs text-gray-400 font-mono bg-gray-800 px-2 py-0.5 rounded">
                {currentStyles.fontSize}px
              </span>
            </div>
            <Slider
              value={[currentStyles.fontSize]}
              onValueChange={(value) => onStyleChange({ fontSize: value[0] })}
              min={12}
              max={24}
              step={1}
              className="w-full"
            />
          </div>

          {/* Text Formatting Controls */}
          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-700">
            <Button
              size="sm"
              variant="ghost"
              className={`h-8 w-8 p-0 ${
                currentStyles.fontWeight === "bold" 
                  ? "bg-blue-600 text-white hover:bg-blue-700" 
                  : "text-gray-400 hover:text-white hover:bg-gray-700"
              }`}
              onClick={() => 
                onStyleChange({ 
                  fontWeight: currentStyles.fontWeight === "bold" ? "normal" : "bold" 
                })
              }
            >
              <Bold size={16} />
            </Button>

            <Button
              size="sm"
              variant="ghost"
              className={`h-8 w-8 p-0 ${
                currentStyles.fontStyle === "italic" 
                  ? "bg-blue-600 text-white hover:bg-blue-700" 
                  : "text-gray-400 hover:text-white hover:bg-gray-700"
              }`}
              onClick={() => 
                onStyleChange({ 
                  fontStyle: currentStyles.fontStyle === "italic" ? "normal" : "italic" 
                })
              }
            >
              <Italic size={16} />
            </Button>

            <div className="w-px h-6 bg-gray-700 mx-1" />

            <Button
              size="sm"
              variant="ghost"
              className={`h-8 w-8 p-0 ${
                currentStyles.textAlign === "left" 
                  ? "bg-purple-600 text-white hover:bg-purple-700" 
                  : "text-gray-400 hover:text-white hover:bg-gray-700"
              }`}
              onClick={() => onStyleChange({ textAlign: "left" })}
            >
              <AlignLeft size={16} />
            </Button>

            <Button
              size="sm"
              variant="ghost"
              className={`h-8 w-8 p-0 ${
                currentStyles.textAlign === "center" 
                  ? "bg-purple-600 text-white hover:bg-purple-700" 
                  : "text-gray-400 hover:text-white hover:bg-gray-700"
              }`}
              onClick={() => onStyleChange({ textAlign: "center" })}
            >
              <AlignCenter size={16} />
            </Button>

            <Button
              size="sm"
              variant="ghost"
              className={`h-8 w-8 p-0 ${
                currentStyles.textAlign === "right" 
                  ? "bg-purple-600 text-white hover:bg-purple-700" 
                  : "text-gray-400 hover:text-white hover:bg-gray-700"
              }`}
              onClick={() => onStyleChange({ textAlign: "right" })}
            >
              <AlignRight size={16} />
            </Button>
          </div>

          {/* Color Picker */}
          <div className="mb-3 pb-3 border-b border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-300 text-sm">Text Color</span>
              <div 
                className="w-6 h-6 rounded border-2 border-gray-600 cursor-pointer"
                style={{ backgroundColor: currentStyles.color }}
                onClick={() => setShowColorPicker(!showColorPicker)}
              />
            </div>
            
            <AnimatePresence>
              {showColorPicker && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="overflow-hidden"
                >
                  <div className="flex gap-2 flex-wrap mt-2">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        className={`w-8 h-8 rounded border-2 transition-transform hover:scale-110 ${
                          currentStyles.color === color 
                            ? "border-blue-400 ring-2 ring-blue-400/30" 
                            : "border-gray-600"
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => {
                          onStyleChange({ color });
                          setShowColorPicker(false);
                        }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Reset Button */}
          <Button
            size="sm"
            variant="outline"
            className="w-full border-gray-700 text-gray-300 hover:bg-red-600/20 hover:text-red-400 hover:border-red-600"
            onClick={onReset}
          >
            <RotateCcw size={14} className="mr-2" />
            Reset to Template
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
