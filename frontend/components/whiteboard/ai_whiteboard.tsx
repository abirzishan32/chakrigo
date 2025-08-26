"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  Tldraw,
  TLUiOverrides,
  AssetRecordType,
  getHashForString,
  TLAssetStore,
  TLBookmarkAsset,
  toRichText,
  uniqueId,
  createTLStore,
  defaultShapeUtils,
} from "tldraw";
import "tldraw/tldraw.css";
import dynamic from "next/dynamic";
import mermaid from "mermaid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Loader2, Send, PlusCircle, Camera } from "lucide-react";

// Dynamically import the code editor to avoid SSR issues
const CodeEditor = dynamic(
  () => import("@uiw/react-textarea-code-editor").then((mod) => mod.default),
  { ssr: false }
);

// Enhanced asset store for local development
const localAssets: TLAssetStore = {
  async upload(_asset, file) {
    try {
      // Validate that file is a proper File or Blob object
      if (!file || typeof file !== 'object') {
        console.error('Invalid file object provided:', file);
        throw new Error('Invalid file object');
      }
      
      // Convert file to data URL
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result as string;
          console.log('Asset uploaded successfully, data URL length:', dataUrl.length);
          resolve({ src: dataUrl });
        };
        reader.onerror = () => {
          reject(new Error('Failed to read file'));
        };
        reader.readAsDataURL(file as Blob);
      });
    } catch (error) {
      console.error('Error uploading asset:', error);
      throw error;
    }
  },
  resolve(asset) {
    console.log('Resolving asset:', asset.id, 'src length:', asset.props.src?.length);
    return asset.props.src;
  },
};


async function unfurlBookmarkUrl({
  url,
}: {
  url: string;
}): Promise<TLBookmarkAsset> {
  const asset: TLBookmarkAsset = {
    id: AssetRecordType.createId(getHashForString(url)),
    typeName: "asset",
    type: "bookmark",
    meta: {},
    props: {
      src: url,
      description: "",
      image: "",
      favicon: "",
      title: "",
    },
  };

  try {
    // Simple fetch for bookmark data (you could implement a proper unfurl service)
    asset.props.title = url;
    asset.props.description = "External link";
  } catch (e) {
    console.error(e);
  }

  return asset;
}

export default function AIWhiteboard() {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [showDiagramModal, setShowDiagramModal] = useState(false);
  const [diagramDescription, setDiagramDescription] = useState("");
  const [mermaidCode, setMermaidCode] = useState("");
  const [renderedSVG, setRenderedSVG] = useState<string | null>(null);
  const editorRef = useRef<any>(null);
  const mermaidContainerRef = useRef<HTMLDivElement>(null);
  
  // Create a local store for tldraw
  const store = createTLStore({
    shapeUtils: defaultShapeUtils,
    assets: localAssets,
  });

  // Initialize mermaid
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: "dark",
      themeVariables: {
        darkMode: true,
        background: "#1f2937",
        primaryColor: "#3b82f6",
        primaryTextColor: "#ffffff",
        primaryBorderColor: "#374151",
        lineColor: "#6b7280",
        secondaryColor: "#374151",
        tertiaryColor: "#111827",
      },
      fontFamily: "system-ui, sans-serif",
      securityLevel: "loose",
    });
  }, []);

  const renderMermaid = useCallback(async () => {
    if (!mermaidCode || !mermaidContainerRef.current) return;

    try {
      // Clear previous content
      mermaidContainerRef.current.innerHTML = "";

      // Use a unique ID for each render to avoid conflicts
      const uniqueId = `mermaid-diagram-${Date.now()}`;

      // Render mermaid diagram
      const { svg } = await mermaid.render(uniqueId, mermaidCode);
      mermaidContainerRef.current.innerHTML = svg;
      setRenderedSVG(svg);
    } catch (error) {
      console.error("Failed to render mermaid diagram:", error);
      mermaidContainerRef.current.innerHTML =
        '<div class="text-red-500 p-4">Error rendering diagram. Please check your syntax.</div>';
    }
  }, [mermaidCode]);

  useEffect(() => {
    if (mermaidCode) {
      renderMermaid();
    }
  }, [mermaidCode, renderMermaid]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    setIsLoading(true);

    try {
      const response = await fetch("/api/whiteboard", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message, type: "message" }),
      });

      const data = await response.json();

      if (data.success && editorRef.current) {
        // Add text to the whiteboard
        const editor = editorRef.current;
        const { width, height } = editor.getViewportScreenBounds();

        // Create a text shape with the AI response
        editor.createShape({
          type: "text",
          x: width / 2 - 150,
          y: height / 2 - 50,
          props: {
            text: data.text,
            color: "blue",
            size: "m",
          },
        });
      } else {
        console.error("Failed to get AI response:", data);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setMessage("");
      setIsLoading(false);
    }
  };

  const handleDiagramRequest = async () => {
    if (!diagramDescription.trim()) return;

    setIsLoading(true);

    try {
      const response = await fetch("/api/whiteboard", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: diagramDescription, type: "diagram" }),
      });

      const data = await response.json();

      if (data.success) {
        setMermaidCode(data.mermaidCode);
        // Ensure we wait a moment for state to update before rendering
        setTimeout(() => renderMermaid(), 50);
      } else {
        console.error("Failed to generate diagram:", data);
      }
    } catch (error) {
      console.error("Error generating diagram:", error);
    } finally {
      setIsLoading(false);
    }
  };

const handleInsertDiagram = useCallback(async () => {
  if (renderedSVG && editorRef.current) {
    try {
      const editor = editorRef.current;
      const { width, height } = editor.getViewportScreenBounds();

      // Create a temporary DOM element to parse the SVG dimensions
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(renderedSVG, "image/svg+xml");
      const svgElement = svgDoc.documentElement;

      // Get SVG dimensions from viewBox or width/height attributes
      let svgWidth = parseFloat(svgElement.getAttribute("width") || "300");
      let svgHeight = parseFloat(svgElement.getAttribute("height") || "200");

      // If there's a viewBox, use that for dimensions
      const viewBox = svgElement.getAttribute("viewBox");
      if (viewBox) {
        const [, , vbWidth, vbHeight] = viewBox.split(" ").map(parseFloat);
        if (!isNaN(vbWidth) && !isNaN(vbHeight)) {
          svgWidth = vbWidth;
          svgHeight = vbHeight;
        }
      }

      // Calculate aspect ratio and dimensions
      const aspectRatio = svgWidth / svgHeight;
      const maxWidth = Math.min(500, width * 0.6);
      const imageWidth = maxWidth;
      const imageHeight = maxWidth / aspectRatio;

      // Create SVG data URL with proper encoding
      const cleanSVG = renderedSVG
        .replace(/xmlns="[^"]*"/g, '') // Remove existing xmlns
        .replace(/<svg/, '<svg xmlns="http://www.w3.org/2000/svg"'); // Add proper xmlns

      const svgDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(cleanSVG)}`;

      // Create asset ID
      const assetId = AssetRecordType.createId();

      // Create the asset record directly with SVG data URL
      const asset = {
        id: assetId,
        type: "image" as const,
        typeName: "asset" as const,
        props: {
          name: "diagram.svg",
          src: svgDataUrl,
          w: imageWidth,
          h: imageHeight,
          mimeType: "image/svg+xml",
          isAnimated: false,
        },
        meta: {},
      };

      // Create the asset first
      await editor.createAssets([asset]);

      // Wait a moment for the asset to be created
      await new Promise(resolve => setTimeout(resolve, 100));

      // Create the image shape
      const shapeId = editor.createShape({
        type: "image",
        x: width / 2 - imageWidth / 2,
        y: height / 2 - imageHeight / 2,
        props: {
          assetId,
          w: imageWidth,
          h: imageHeight,
        },
      });

      console.log("Created shape with ID:", shapeId);
      console.log("Asset ID:", assetId);
      console.log("Asset data URL length:", svgDataUrl.length);

      // Close the modal
      setShowDiagramModal(false);
      setDiagramDescription("");
      setMermaidCode("");
      setRenderedSVG(null);

    } catch (error) {
      console.error("Error creating image asset:", error);
      alert("Failed to insert diagram. Please try again.");
    }
  }
}, [renderedSVG]);


  const captureWhiteboard = async () => {
    if (!editorRef.current) return;

    setIsSummarizing(true);

    try {
      const editor = editorRef.current;

      // Get all shape IDs on the current page
      const shapeIds = editor.getCurrentPageShapeIds();

      if (shapeIds.size === 0) {
        alert("No content on the whiteboard to summarize");
        setIsSummarizing(false);
        return;
      }

      // Export the whiteboard as a PNG blob
      const { blob } = await editor.toImage([...shapeIds], {
        format: "png",
        background: true,
        padding: 16,
        scale: 1,
      });

      // Convert blob to base64
      const reader = new FileReader();

      reader.onloadend = async () => {
        try {
          const base64data = reader.result as string;

          // Send only the base64 data part (remove the prefix)
          //const base64Content = base64data.split(",")[1];

          // Send the image to the API for summarization
          const response = await fetch("/api/whiteboard", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              image: base64data,
              type: "summarize",
            }),
          });

          const data = await response.json();

          if (data.success && editorRef.current) {
            // Add text to the whiteboard
            const editor = editorRef.current;
            const { width, height } = editor.getViewportScreenBounds();
            
            // Calculate the shape dimensions based on the text length
            const summaryText = `📋 Whiteboard Summary:\n${data.text}`;
            
            // Estimate width based on text length (characters per line)
            const charsPerLine = 60; // Average number of characters per line
            const lines = Math.ceil(summaryText.length / charsPerLine);
            const estimatedLineCount = lines + (summaryText.split('\n').length - 1);
            
            // Calculate width and height based on text content
            const noteWidth = Math.min(500, Math.max(300, Math.sqrt(summaryText.length) * 20));
            const noteHeight = Math.max(100, estimatedLineCount * 20); // 20px per line
            
            // Create a note shape with the AI summary
            editor.createShape({
              type: "geo",
              x: width / 2 - noteWidth / 2,
              y: height / 2 + 50, // Position below center
              props: {
                richText: toRichText(summaryText),
                color: "green",
                size: "m",
                geo: "rectangle",
                labelColor: "black",
                fill: "none",
                dash: "draw",
                w: noteWidth,
                h: noteHeight,
              },
            });
          } else {
            alert(`Error: ${data.text || "Failed to summarize the whiteboard"}`);
          }
        } catch (error) {
          console.error("Error processing whiteboard data:", error);
          alert("Error processing whiteboard data");
        }
      };

      reader.readAsDataURL(blob);
    } catch (error) {
      console.error("Error capturing whiteboard:", error);
      alert("Failed to capture whiteboard content");
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleEditorMount = (editor: any) => {
    editorRef.current = editor;
    editor.registerExternalAssetHandler("url", unfurlBookmarkUrl);
  };

  const uiOverrides: TLUiOverrides = {
    tools(editor, tools) {
      return tools;
    },
  };

  return (
    <div className="h-full w-full flex flex-col bg-gray-900">
      <div className="flex-1 relative">
        <Tldraw
          store={store}
          onMount={handleEditorMount}
          overrides={uiOverrides}
          className="h-full w-full"
          inferDarkMode
        />
      </div>

      {/* Message input and controls */}
      <div className="p-4 bg-gray-800 border-t border-gray-700">
        <div className="flex gap-2">
          <div className="flex-1 flex gap-2">
            <Input
              placeholder="Send a message to AI..."
              className="flex-1 bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !message.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Send
            </Button>
          </div>
          <Button
            onClick={() => setShowDiagramModal(true)}
            variant="outline"
            className="gap-1 bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
          >
            <PlusCircle className="h-4 w-4 mr-1" />
            Add Diagram
          </Button>
          <Button
            onClick={captureWhiteboard}
            variant="outline"
            className="gap-1 bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
            disabled={isSummarizing}
          >
            {isSummarizing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
            Summarize Board
          </Button>
        </div>
      </div>

      {/* Diagram dialog */}
      <Dialog open={showDiagramModal} onOpenChange={setShowDiagramModal}>
        <DialogContent className="sm:max-w-[1200px] p-0 z-[500] bg-gray-800 border-gray-700">
          <DialogHeader className="p-4 border-b border-gray-700">
            <DialogTitle className="text-white">Generate Diagram</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col h-[700px]">
            <div className="p-4 border-b border-gray-700">
              <Textarea
                placeholder="Describe the diagram you want to generate (e.g., 'A system architecture with load balancer, web servers, and database')"
                value={diagramDescription}
                onChange={(e) => setDiagramDescription(e.target.value)}
                className="min-h-[100px] bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
              />
              <Button
                onClick={handleDiagramRequest}
                disabled={isLoading || !diagramDescription.trim()}
                className="mt-3 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Generate Diagram
              </Button>
            </div>

            <div className="flex-1 flex">
              {/* Code Editor */}
              <div className="w-1/2 p-4 border-r border-gray-700">
                <h3 className="text-sm font-medium mb-2 text-white">Mermaid Code</h3>
                <div className="h-full">
                  <CodeEditor
                    value={mermaidCode}
                    language="text"
                    placeholder="Mermaid diagram code will appear here..."
                    onChange={(evn) => setMermaidCode(evn.target.value)}
                    padding={15}
                    data-color-mode="dark"
                    style={{
                      backgroundColor: "#374151",
                      fontFamily: 'ui-monospace,SFMono-Regular,"SF Mono",Consolas,"Liberation Mono",Menlo,monospace',
                      fontSize: 12,
                      height: "100%",
                    }}
                  />
                </div>
              </div>

              {/* Preview */}
              <div className="w-1/2 p-4">
                <h3 className="text-sm font-medium mb-2 text-white">Preview</h3>
                <Card className="h-full bg-gray-700 border-gray-600 p-4 overflow-auto">
                  <div
                    ref={mermaidContainerRef}
                    className="h-full flex items-center justify-center text-white"
                  >
                    {!mermaidCode && (
                      <p className="text-gray-400">Diagram preview will appear here</p>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          </div>

          <DialogFooter className="p-4 border-t border-gray-700">
            <Button
              variant="outline"
              onClick={() => setShowDiagramModal(false)}
              className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
            >
              Cancel
            </Button>
            <Button
              onClick={handleInsertDiagram}
              disabled={!renderedSVG}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Insert Diagram
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
