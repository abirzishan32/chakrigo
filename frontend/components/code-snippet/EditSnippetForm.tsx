"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { TagInput } from "@/components/ui/tag-input";
import CodeEditor from "./CodeEditor";
import { updateSnippet, getFoldersByParent } from "@/lib/actions/code-snippet.action";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface EditSnippetFormProps {
  snippet: CodeSnippet;
}

export default function EditSnippetForm({ snippet }: EditSnippetFormProps) {
  const router = useRouter();
  
  const [title, setTitle] = useState(snippet.title);
  const [description, setDescription] = useState(snippet.description || "");
  const [code, setCode] = useState(snippet.code);
  const [language, setLanguage] = useState(snippet.language);
  const [tags, setTags] = useState<string[]>(snippet.tags || []);
  const [folderId, setFolderId] = useState<string | null>(snippet.folderId);
  const [isSaving, setIsSaving] = useState(false);
  const [folders, setFolders] = useState<CodeFolder[]>([]);
  const [loadingFolders, setLoadingFolders] = useState(true);
  
  // Load available folders
  useEffect(() => {
    const loadFolders = async () => {
      setLoadingFolders(true);
      try {
        // Load root folders
        const rootFolderResult = await getFoldersByParent(null);
        let allFolders: CodeFolder[] = [];
        
        if (rootFolderResult.success) {
          allFolders = [...rootFolderResult.folders];
          
          // Load subfolders (one level deep for simplicity)
          for (const folder of rootFolderResult.folders) {
            const subFolderResult = await getFoldersByParent(folder.id);
            if (subFolderResult.success) {
              allFolders = [...allFolders, ...subFolderResult.folders];
            }
          }
        }
        
        setFolders(allFolders);
      } catch (error) {
        console.error("Error loading folders:", error);
      } finally {
        setLoadingFolders(false);
      }
    };
    
    loadFolders();
  }, []);
  
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
      const result = await updateSnippet(snippet.id, {
        title,
        description,
        code,
        language,
        tags,
        folderId,
      });
      
      if (result.success) {
        toast.success("Snippet updated successfully");
        router.push(`/code-snippet/${snippet.id}`);
        router.refresh();
      } else {
        toast.error(`Failed to update snippet: ${result.error}`);
      }
    } catch (error) {
      toast.error(`An error occurred: ${error}`);
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="h-full flex flex-col min-h-0">
      <form onSubmit={handleSubmit} className="flex flex-col h-full min-h-0 border rounded-md p-4 bg-background">
        {/* Form fields section - compact and scrollable if needed */}
        <div className="flex-shrink-0 space-y-3 mb-3">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="title" className="text-sm font-medium">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Snippet title"
                className="mt-1 h-9"
              />
            </div>
            
            <div>
              <Label htmlFor="folder" className="text-sm font-medium">Folder</Label>
              <Select 
                value={folderId || ""} 
                onValueChange={(value) => setFolderId(value === "" ? null : value)}
              >
                <SelectTrigger className="mt-1 h-9" disabled={loadingFolders}>
                  <SelectValue placeholder={loadingFolders ? "Loading folders..." : "Root (No folder)"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Root (No folder)</SelectItem>
                  {folders.map((folder) => (
                    <SelectItem 
                      key={folder.id} 
                      value={folder.id}
                      className={folder.parentId ? "pl-6" : ""}
                    >
                      {folder.parentId ? `↪ ${folder.name}` : folder.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="description" className="text-sm font-medium">Description (optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of the code snippet"
                className="mt-1 h-16 resize-none"
              />
            </div>
            
            <div>
              <Label className="text-sm font-medium">Tags (optional)</Label>
              <TagInput 
                value={tags} 
                onChange={setTags} 
                placeholder="Add tags..."
                className="mt-1 h-9"
              />
            </div>
          </div>
        </div>
        
        {/* Code editor section - takes remaining space */}
        <div className="flex-1 min-h-0 mb-3">
          <Label className="text-sm font-medium mb-2 block">Code</Label>
          <div className="h-full">
            <CodeEditor
              code={code}
              language={language}
              onChange={setCode}
              onLanguageChange={setLanguage}
            />
          </div>
        </div>
        
        {/* Action buttons - always visible at bottom */}
        <div className="flex-shrink-0 border-t pt-3">
          <div className="flex justify-end space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.back()}
              disabled={isSaving}
              className="h-9"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving} className="h-9">
              {isSaving ? (
                <>
                  <Loader2 size={14} className="mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Snippet"
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}