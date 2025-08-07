"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { TagInput } from "@/components/ui/tag-input";
import CodeEditor from "./CodeEditor";
import { createSnippet, updateSnippet } from "@/lib/actions/code-snippet.action";

interface SnippetFormProps {
  snippet?: CodeSnippet;
  folderId: string | null;
  onCancel: () => void;
}

export default function SnippetForm({ snippet, folderId, onCancel }: SnippetFormProps) {
  const router = useRouter();
  const isEditing = !!snippet;
  
  const [title, setTitle] = useState(snippet?.title || "");
  const [description, setDescription] = useState(snippet?.description || "");
  const [code, setCode] = useState(snippet?.code || "");
  const [language, setLanguage] = useState(snippet?.language || "javascript");
  const [tags, setTags] = useState<string[]>(snippet?.tags || []);
  const [isSaving, setIsSaving] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    
    if (!code.trim()) {
      toast.error("Code content is required");
      return;
    }
    
    setIsSaving(true);
    
    try {
      if (isEditing && snippet) {
        // Update existing snippet
        const result = await updateSnippet(snippet.id, {
          title,
          description,
          code,
          language,
          tags,
        });
        
        if (result.success) {
          toast.success("Snippet updated successfully");
          router.push(`/code-snippet/${snippet.id}`);
          router.refresh();
        } else {
          toast.error(`Failed to update snippet: ${result.error}`);
        }
      } else {
        // Create new snippet
        const result = await createSnippet({
          title,
          description,
          code,
          language,
          tags,
          folderId,
        });
        
        if (result.success && result.snippet) {
          toast.success("Snippet created successfully");
          router.push(`/code-snippet/${result.snippet.id}`);
          router.refresh();
        } else {
          toast.error(`Failed to create snippet: ${result.error}`);
        }
      }
    } catch (error) {
      toast.error(`An error occurred: ${error}`);
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="h-full flex flex-col overflow-hidden">
      <form onSubmit={handleSubmit} className="h-full flex flex-col overflow-hidden">
        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Form Fields Section */}
          <div className="space-y-4">
            {/* Title and Tags Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="title" className="text-sm font-medium">
                  Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter snippet title"
                  className="h-9"
                  required
                />
              </div>
              
              <div className="space-y-1">
                <Label className="text-sm font-medium">Tags</Label>
                <TagInput 
                  value={tags} 
                  onChange={setTags} 
                  placeholder="Add tags..."
                  className="h-9"
                />
              </div>
            </div>
            
            {/* Description */}
            <div className="space-y-1">
              <Label htmlFor="description" className="text-sm font-medium">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of the code snippet (optional)"
                className="h-20 resize-none"
                rows={3}
              />
            </div>
          </div>
          
          {/* Code Editor Section */}
          <div className="space-y-1">
            <Label className="text-sm font-medium">
              Code <span className="text-red-500">*</span>
            </Label>
            <div className="h-80 border rounded-md overflow-hidden">
              <CodeEditor
                code={code}
                language={language}
                onChange={setCode}
                onLanguageChange={setLanguage}
                onSave={handleSubmit}
              />
            </div>
          </div>
        </div>
        
        {/* Fixed Action Buttons */}
        <div className="flex-shrink-0 border-t bg-background p-4">
          <div className="flex justify-end space-x-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={isSaving}
              className="px-4"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSaving || !title.trim() || !code.trim()}
              className="px-6"
            >
              {isSaving ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  {isEditing ? "Updating..." : "Creating..."}
                </>
              ) : (
                isEditing ? "Update Snippet" : "Create Snippet"
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}