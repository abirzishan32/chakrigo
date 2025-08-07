"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import FolderTree from "./FolderTree";
import { 
  getAllUserFolders, 
  getSnippetsByFolder 
} from "@/lib/actions/code-snippet.action";
import { Button } from "@/components/ui/button";
import { Home, Loader2, RefreshCw, Plus, FolderOpen, Code2, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function FileExplorer({ 
  initialFolderId = null,
  onCreateSnippet 
}: { 
  initialFolderId: string | null;
  onCreateSnippet: (folderId: string | null) => void;
}) {
  const router = useRouter();
  
  const [folders, setFolders] = useState<CodeFolder[]>([]);
  const [snippets, setSnippets] = useState<CodeSnippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Filter folders for current view
  const currentFolders = folders.filter(folder => folder.parentId === initialFolderId);
  // Filter snippets for current folder
  const currentSnippets = snippets.filter(snippet => snippet.folderId === initialFolderId);
  
  const fetchData = async () => {
    setLoading(true);
    try {
      // Get ALL user folders for proper tree display
      const foldersResult = await getAllUserFolders();
      if (foldersResult.success) {
        setFolders(foldersResult.folders);
      } else {
        toast.error("Failed to load folders");
      }
      
      // Get snippets for current view
      const snippetsResult = await getSnippetsByFolder(initialFolderId);
      if (snippetsResult.success) {
        setSnippets(snippetsResult.snippets);
      } else {
        toast.error("Failed to load snippets");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("An error occurred while loading data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  useEffect(() => {
    fetchData();
  }, [initialFolderId]);
  
  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };
  
  // Handle move snippet
  const handleMoveSnippet = (snippet: CodeSnippet) => {
    // Implementation handled in FolderTree component
  };

  // Modern Empty State Component
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="relative mb-6">
        <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center">
          <Code2 className="w-10 h-10 text-primary" />
        </div>
        <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
          <Sparkles className="w-3 h-3 text-yellow-600 dark:text-yellow-400" />
        </div>
      </div>
      
      <h3 className="text-lg font-semibold mb-2">Start Building Your Library</h3>
      <p className="text-muted-foreground text-center mb-6 max-w-sm">
        Create your first code snippet or organize with folders. Build a personal collection of reusable code.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-3">
        <Button 
          onClick={() => onCreateSnippet(initialFolderId)}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create First Snippet
        </Button>
        
        <Button 
          variant="outline"
          onClick={() => {
            // This would trigger folder creation dialog
            // For now, just show a toast
            toast.info("Folder creation coming soon!");
          }}
        >
          <FolderOpen className="w-4 h-4 mr-2" />
          Create Folder
        </Button>
      </div>
      
      <div className="mt-8 text-xs text-muted-foreground">
        💡 Pro tip: Use folders to organize snippets by project or language
      </div>
    </div>
  );
  
  return (
    <div className="w-full">
      {/* Compact Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => router.push('/code-snippet')}
            className="h-8 px-2 text-sm hover:bg-muted"
          >
            <Home size={14} className="mr-1.5" />
            Root
          </Button>
          
          <div className="h-4 w-px bg-border" />
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            className="h-8 w-8 p-0 hover:bg-muted"
            disabled={refreshing || loading}
            title="Refresh"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
          </Button>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
          <FolderOpen className="w-3 h-3" />
          <span>{currentFolders.length}</span>
          <div className="w-px h-3 bg-border" />
          <Code2 className="w-3 h-3" />
          <span>{currentSnippets.length}</span>
        </div>
      </div>
      
      {/* Content Area */}
      <div className="min-h-[400px]">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Loading your snippets...</span>
            </div>
          </div>
        ) : currentFolders.length === 0 && currentSnippets.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-1">
            <FolderTree
              folders={folders}
              snippets={snippets}
              parentId={initialFolderId}
              currentFolders={currentFolders}
              currentSnippets={currentSnippets}
              onCreateSnippet={onCreateSnippet}
              onRefresh={handleRefresh}
              onMoveSnippet={handleMoveSnippet}
            />
          </div>
        )}
      </div>
    </div>
  );
}