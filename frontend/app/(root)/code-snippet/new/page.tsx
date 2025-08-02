import { Metadata } from "next";
import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import  NewSnippetPage  from "@/components/code-snippet/NewSnippetPage";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export const metadata: Metadata = {
  title: "Create New Code Snippet | ChakriGO",
  description: "Create a new code snippet in your library",
};

export default function Page({ 
  searchParams 
}: { 
  searchParams: { [key: string]: string | string[] | undefined } 
}) {
  // Extract the folderId from search params
  const folderId = typeof searchParams.folderId === 'string' 
    ? searchParams.folderId 
    : null;

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewSnippetPage folderId={folderId} />
    </Suspense>
  );
}