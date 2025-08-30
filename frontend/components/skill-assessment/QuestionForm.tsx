"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AssessmentQuestion } from "@/lib/actions/skill-assessment.action";

interface QuestionFormProps {
  assessmentId: string;
  initialData?: AssessmentQuestion;
  onSuccess?: () => void;
  onSubmit?: (data: Partial<AssessmentQuestion>) => Promise<void>;
  mode?: "create" | "edit";
}

export default function QuestionForm({
  assessmentId,
  initialData,
  onSuccess,
  onSubmit,
  mode = "create"
}: QuestionFormProps) {
  const [formData, setFormData] = useState<Partial<AssessmentQuestion>>({
    question: "",
    type: "multiple-choice",
    options: [],
    points: 1,
    assessmentId
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleOptionChange = (index: number, field: string, value: string | boolean) => {
    const newOptions = [...(formData.options || [])];
    if (!newOptions[index]) {
      newOptions[index] = { id: Date.now().toString(), text: "", isCorrect: false };
    }
    newOptions[index] = {
      ...newOptions[index],
      [field]: value
    };
    setFormData({ ...formData, options: newOptions });
  };

  const addOption = () => {
    setFormData({
      ...formData,
      options: [
        ...(formData.options || []),
        { id: Date.now().toString(), text: "", isCorrect: false }
      ]
    });
  };

  const removeOption = (index: number) => {
    const newOptions = [...(formData.options || [])];
    newOptions.splice(index, 1);
    setFormData({ ...formData, options: newOptions });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (onSubmit) {
        await onSubmit(formData);
      }
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError("Failed to save question. Please try again.");
      console.error("Error saving question:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Question Type
        </label>
        <select
          title="Select Question Type"
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
          className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[200px]"
        >
          <option value="multiple-choice">Multiple Choice</option>
          <option value="coding">Coding</option>
          <option value="text">Text</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Question Text
        </label>
        <textarea
          title="Enter Question Text"
          value={formData.question}
          onChange={(e) => setFormData({ ...formData, question: e.target.value })}
          className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          required
        />
      </div>

      {formData.type === "multiple-choice" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-medium text-gray-300">
              Options
            </label>
            <button
              type="button"
              onClick={addOption}
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              Add Option
            </button>
          </div>
          {(formData.options || []).map((option, index) => (
            <div key={option.id} className="flex items-center space-x-4">
              <input
                type="text"
                value={option.text}
                onChange={(e) => handleOptionChange(index, "text", e.target.value)}
                className="flex-1 bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={`Option ${index + 1}`}
                required
              />
              <input
                title="Is Correct"
                type="checkbox"
                checked={option.isCorrect}
                onChange={(e) => handleOptionChange(index, "isCorrect", e.target.checked)}
                className="h-5 w-5 text-blue-500 focus:ring-blue-500 border-gray-600 rounded"
              />
              <button
                type="button"
                onClick={() => removeOption(index)}
                className="text-red-400 hover:text-red-300"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {formData.type === "coding" && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Code Snippet
          </label>
          <textarea
            value={formData.codeSnippet || ""}
            onChange={(e) => setFormData({ ...formData, codeSnippet: e.target.value })}
            className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            rows={5}
            placeholder="Enter the code snippet here..."
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Points
        </label>
        <input
          title="Enter Points"
          type="number"
          value={formData.points}
          onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
          className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          min="1"
          required
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? "Saving..." : mode === "edit" ? "Update Question" : "Create Question"}
        </button>
      </div>
    </form>
  );
} 