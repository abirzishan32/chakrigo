import React from "react";
import { getSnippet } from "@/lib/actions/code-snippet.action";
import { notFound } from "next/navigation";
import EditSnippetForm from "@/components/code-snippet/EditSnippetForm"; // We'll create this next
import FileExplorer from "@/components/code-snippet/FileExplorer";

export async function generateMetadata({ params }: { params: { snippetId: string } }) {
  const { success, snippet } = await getSnippet(params.snippetId);
  
  if (!success || !snippet) {
    return {
      title: "Snippet Not Found | ChakriGO",
    };
  }
  
  return {
    title: `Edit ${snippet.title} | Code Snippets | ChakriGO`,
  };
}

export default async function EditSnippetPage({ params }: { params: { snippetId: string } }) {
  const { success, snippet } = await getSnippet(params.snippetId);
  
  if (!success || !snippet) {
    notFound();
  }
  
  return (
    <div className="container mx-auto py-6 max-w-6xl">
      <h1 className="text-2xl font-bold mb-6">Edit Snippet: {snippet.title}</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Edit Form */}
        <div className="lg:col-span-8 order-2 lg:order-1">
          <EditSnippetForm snippet={snippet} />
        </div>
        
        {/* File Explorer */}
        <div className="lg:col-span-4 order-1 lg:order-2">
          <FileExplorer
            initialFolderId={snippet.folderId}
            onCreateSnippet={(folderId) => {
              const url = new URL(window.location.href);
              url.pathname = "/code-snippet/new";
              if (folderId) {
                url.searchParams.set("folderId", folderId);
              }
              window.location.href = url.toString();
            }}
          />
        </div>
      </div>
    </div>
  );
}