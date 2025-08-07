"use client";

import React, { useState } from "react";
import FileExplorerWrapper from "@/components/code-snippet/FileExplorerWrapper";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Plus, Code, FolderOpen, Sparkles, BookOpen, Link } from "lucide-react";

export default function CodeSnippetsPage() {
  const router = useRouter();

  const handleCreateSnippet = (folderId: string | null) => {
    if (folderId) {
      router.push(`/code-snippet/new?folderId=${folderId}`);
    } else {
      router.push("/code-snippet/new");
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Modern Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Code className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Code Snippets</h1>
                <p className="text-muted-foreground mt-1">
                  Organize and manage your code snippets efficiently
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" asChild>
                <Link href="/code-snippet/new">
                  <Plus className="h-4 w-4 mr-2" />
                  New Snippet
                </Link>
              </Button>
            </div>
          </div>
          
          {/* Quick Stats Cards */}
          
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* File Explorer - Takes up 2 columns on large screens */}
          <div className="lg:col-span-2">
            <div className="bg-card border rounded-lg shadow-sm">
              <div className="border-b bg-muted/30 px-4 py-3">
                <h2 className="font-semibold text-lg flex items-center gap-2">
                  <FolderOpen className="h-5 w-5" />
                  File Explorer
                </h2>
              </div>
              <div className="p-4">
                <FileExplorerWrapper 
                  initialFolderId={null}
                  targetPath="/code-snippet/new"
                />
              </div>
            </div>
          </div>

          {/* Sidebar - Quick Actions & Tips */}
          <div className="space-y-6">
            {/* Quick Actions Card */}
            <div className="bg-card border rounded-lg shadow-sm">
              <div className="border-b bg-muted/30 px-4 py-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Quick Actions
                </h3>
              </div>
              <div className="p-4 space-y-3">
                <Button asChild className="w-full justify-start" variant="outline">
                  <Link href="/code-snippet/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Snippet
                  </Link>
                </Button>
                
                <Button asChild className="w-full justify-start" variant="outline">
                  <Link href="/code-snippet/new">
                    <FolderOpen className="h-4 w-4 mr-2" />
                    Create New Folder
                  </Link>
                </Button>
              </div>
            </div>

       


            <div className="bg-card border rounded-lg shadow-sm">
              <div className="border-b bg-muted/30 px-4 py-3">
                <h3 className="font-semibold">Recent Activity</h3>
              </div>
              <div className="p-4">
                <p className="text-sm text-muted-foreground text-center py-6">
                  No recent activity yet
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}