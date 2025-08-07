"use client";

import React from "react";
import { useRouter } from "next/navigation";
import SnippetForm from "@/components/code-snippet/SnippetForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { getFolderPath } from "@/lib/actions/code-snippet.action";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

export default function NewSnippetPage({ folderId }: { folderId: string | null }) {
  const router = useRouter();
  const [folderPath, setFolderPath] = useState<CodeFolder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFolderPath = async () => {
      if (folderId) {
        const { success, path } = await getFolderPath(folderId);
        if (success) {
          setFolderPath(path);
        }
      }
      setLoading(false);
    };

    loadFolderPath();
  }, [folderId]);

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Fixed Header - Compact */}
      <div className="flex-shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-2 max-w-6xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="h-8 px-2"
              >
                <ArrowLeft size={16} className="mr-1" />
                Back
              </Button>

              <div className="flex items-center text-sm text-muted-foreground">
                <Link href="/code-snippet" className="hover:underline font-medium">Code Snippets</Link>
                {loading ? (
                  <div className="flex items-center gap-1 ml-2">
                    <Skeleton className="h-3 w-3" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                ) : (
                  folderPath.length > 0 && (
                    <>
                      <span className="mx-2 text-muted-foreground/60">/</span>
                      {folderPath.map((folder, index) => (
                        <React.Fragment key={folder.id}>
                          <Link
                            href={`/code-snippet/folder/${folder.id}`}
                            className="hover:underline"
                          >
                            {folder.name}
                          </Link>
                          {index < folderPath.length - 1 && <span className="mx-2 text-muted-foreground/60">/</span>}
                        </React.Fragment>
                      ))}
                    </>
                  )
                )}
              </div>
            </div>
            
            <h1 className="text-lg font-semibold">Create New Snippet</h1>
          </div>
        </div>
      </div>

      {/* Main Content - Fills remaining height */}
      <div className="flex-1 overflow-hidden">
        <div className="container mx-auto px-4 py-3 h-full max-w-6xl">
          <div className="bg-background border rounded-lg h-full overflow-hidden">
            <SnippetForm
              folderId={folderId}
              onCancel={handleCancel}
            />
          </div>
        </div>
      </div>
    </div>
  );
}