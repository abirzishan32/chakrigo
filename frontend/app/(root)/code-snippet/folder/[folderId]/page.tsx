import React from "react";
import FileExplorerWrapper from "@/components/code-snippet/FileExplorerWrapper";
import { getFolder, getFolderPath } from "@/lib/actions/code-snippet.action";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Plus } from "lucide-react";
import { notFound } from "next/navigation";
import Link from "next/link";

export async function generateMetadata({ params }: { params: { folderId: string } }) {
  const { success, folder } = await getFolder(params.folderId);
  
  if (!success || !folder) {
    return {
      title: "Folder Not Found | ChakriGO",
    };
  }
  
  return {
    title: `${folder.name} | Code Snippets | ChakriGO`,
  };
}

export default async function FolderPage({ params }: { params: { folderId: string } }) {
  const { success, folder } = await getFolder(params.folderId);
  
  if (!success || !folder) {
    notFound();
  }
  
  const pathResult = await getFolderPath(params.folderId);
  const folderPath = pathResult.success ? pathResult.path : [];
  
  return (
    <div className="container mx-auto py-6 max-w-6xl">
      {/* Back button */}
      <div className="mb-4">
        <Link href={folder.parentId ? `/code-snippet/folder/${folder.parentId}` : "/code-snippet"}>
          <Button variant="ghost" size="sm" className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
            <ChevronLeft size={16} />
            Back to {folder.parentId ? "Parent Folder" : "Root"}
          </Button>
        </Link>
      </div>
      
      <h1 className="text-2xl font-bold mb-2">{folder.name}</h1>
      
      {/* Breadcrumb path */}
      <div className="text-sm text-muted-foreground mb-6">
        <span className="font-mono">
          /root
          {folderPath.map((f) => `/${f.name}`)}
        </span>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* File Explorer */}
        <div className="lg:col-span-4">
          <FileExplorerWrapper 
            initialFolderId={params.folderId} 
            targetPath="/code-snippet/new" 
          />
        </div>
        
        {/* Folder content */}
        <div className="lg:col-span-8">
          <div className="border rounded-md p-8 text-center flex flex-col items-center justify-center min-h-[400px] bg-background">
            <h2 className="text-xl font-medium mb-2">Folder: {folder.name}</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Use the file explorer to browse folders and snippets, or create a new snippet in this folder.
            </p>
            
            <Link href={`/code-snippet/new?folderId=${params.folderId}`} className="inline-block">
              <Button size="lg" className="flex items-center">
                <Plus size={18} className="mr-1" />
                Create Snippet in This Folder
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}