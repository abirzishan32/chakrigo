"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  Tldraw,
  TLUiOverrides,
  AssetRecordType,
  getHashForString,
  TLAssetStore,
  TLBookmarkAsset,
  TLAsset,
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
import { Loader2, Send, Eye, PlusCircle, Copy, Camera } from "lucide-react";

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
  const [isCopying, setIsCopying] = useState(false);
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
      theme: "default",
      themeVariables: {
        darkMode: false,
        background: "#ffffff",
        primaryColor: "#3b82f6",
        primaryTextColor: "#000000",
        primaryBorderColor: "#e5e7eb",
        lineColor: "#374151",
        secondaryColor: "#f3f4f6",
        tertiaryColor: "#ffffff",
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

  const handleCopyToClipboard = useCallback(async () => {
    if (!renderedSVG || !mermaidContainerRef.current) {
      alert("No diagram to copy");
      return;
    }

    setIsCopying(true);

    try {
      console.log("Converting SVG to PNG for clipboard...");

      // Create canvas from SVG
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }

      // Parse SVG dimensions
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(renderedSVG, "image/svg+xml");
      const svgElement = svgDoc.documentElement;
      
      let svgWidth = parseFloat(svgElement.getAttribute("width") || "300");
      let svgHeight = parseFloat(svgElement.getAttribute("height") || "200");
      
      const viewBox = svgElement.getAttribute("viewBox");
      if (viewBox) {
        const [, , vbWidth, vbHeight] = viewBox.split(" ").map(parseFloat);
        if (!isNaN(vbWidth) && !isNaN(vbHeight)) {
          svgWidth = vbWidth;
          svgHeight = vbHeight;
        }
      }

      // Create image from SVG
      const img = new Image();
      const svgBase64 = btoa(unescape(encodeURIComponent(renderedSVG)));
      const svgDataUrl = `data:image/svg+xml;base64,${svgBase64}`;

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load SVG'));
        img.src = svgDataUrl;
      });

      // Set canvas size (2x for better quality)
      const scale = 2;
      canvas.width = svgWidth * scale;
      canvas.height = svgHeight * scale;

      // Fill white background
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        }, 'image/png', 0.95);
      });

      // Copy to clipboard
      await navigator.clipboard.write([
        new ClipboardItem({
          'image/png': blob
        })
      ]);

      console.log("Diagram copied to clipboard!");

    } catch (error) {
      console.error("Error copying to clipboard:", error);
      alert("Failed to copy diagram to clipboard. Please try again.");
    } finally {
      setIsCopying(false);
    }
  }, [renderedSVG]);

const handleInsertDiagram = useCallback(async () => {
  if (renderedSVG && editorRef.current) {
    try {
      const editor = editorRef.current;
      console.log("Starting diagram insertion...");

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

      console.log("SVG dimensions:", svgWidth, "x", svgHeight);

      // Calculate dimensions for display
      const aspectRatio = svgWidth / svgHeight;
      const maxWidth = 600;
      const imageWidth = maxWidth;
      const imageHeight = maxWidth / aspectRatio;

      console.log("Target dimensions:", imageWidth, "x", imageHeight);

      // Convert SVG to PNG using canvas
      const canvas = document.createElement('canvas');
      const scale = 2; // Higher resolution
      canvas.width = svgWidth * scale;
      canvas.height = svgHeight * scale;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }

      // Create an image from SVG using data URL
      const img = new Image();
      
      // Encode SVG as base64 data URL to avoid CORS taint
      const svgBase64 = btoa(unescape(encodeURIComponent(renderedSVG)));
      const svgDataUrl = `data:image/svg+xml;base64,${svgBase64}`;

      console.log("SVG data URL created, converting to PNG...");

      // Wait for image to load and convert to PNG
      await new Promise<void>((resolve, reject) => {
        img.onload = () => {
          try {
            console.log("Image loaded, drawing to canvas...");
            // Fill white background
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw SVG image
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            console.log("Canvas drawing complete");
            resolve();
          } catch (error) {
            console.error("Error drawing to canvas:", error);
            reject(error);
          }
        };
        img.onerror = (error) => {
          console.error("Error loading image:", error);
          reject(new Error('Failed to load SVG image'));
        };
        img.src = svgDataUrl;
      });

      // Convert canvas to blob
      console.log("Converting canvas to blob...");
      const pngBlob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            console.log("PNG blob created, size:", blob.size, "bytes");
            resolve(blob);
          } else {
            reject(new Error('Failed to create PNG blob'));
          }
        }, 'image/png', 0.95);
      });

      // Save the PNG to /public/uploads
      console.log("Saving PNG to server...");
      const formData = new FormData();
      formData.append('file', pngBlob, `diagram_${Date.now()}.png`);

      const uploadResponse = await fetch('/api/upload-diagram', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload diagram to server');
      }

      const uploadData = await uploadResponse.json();
      console.log("Diagram saved to:", uploadData.filePath);
      console.log("Public URL:", uploadData.publicUrl);

      // Use the public URL directly
      const imageUrl = uploadData.publicUrl; // e.g., /uploads/diagram_123456.png
      const fullImageUrl = window.location.origin + imageUrl;
      
      console.log("Preloading image from URL:", fullImageUrl);

      // Preload the image to ensure it's available
      await new Promise((resolve, reject) => {
        const testImg = new Image();
        testImg.onload = () => {
          console.log("Image preloaded successfully:", testImg.width, "x", testImg.height);
          resolve(testImg);
        };
        testImg.onerror = (err) => {
          console.error("Failed to preload image:", err);
          reject(new Error("Failed to load image from server"));
        };
        testImg.src = fullImageUrl;
      });

      // Create asset manually with the URL
      const assetId = AssetRecordType.createId();
      const asset: TLAsset = {
        id: assetId,
        type: 'image',
        typeName: 'asset',
        props: {
          name: uploadData.fileName,
          src: fullImageUrl,
          w: svgWidth,
          h: svgHeight,
          mimeType: 'image/png',
          isAnimated: false,
        },
        meta: {},
      };

      console.log("Creating asset:", asset);

      // Create the asset in the editor
      editor.createAssets([asset]);

      // Wait longer for the asset to be fully processed
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Verify the asset exists and has loaded
      const createdAsset = editor.getAsset(asset.id);
      console.log("Asset verification:", createdAsset);
      
      if (!createdAsset) {
        throw new Error("Asset was not created in the editor");
      }

      // Get current viewport center
      const viewport = editor.getViewportPageBounds();
      const centerX = viewport.x + viewport.width / 2;
      const centerY = viewport.y + viewport.height / 2;

      const shapeX = centerX - imageWidth / 2;
      const shapeY = centerY - imageHeight / 2;

      console.log("Viewport bounds:", viewport);
      console.log("Creating image shape at:", { x: shapeX, y: shapeY, w: imageWidth, h: imageHeight });
      console.log("Using asset ID:", asset.id);

      // Create the image shape
      const createdShapeId = editor.createShape({
        type: "image",
        x: shapeX,
        y: shapeY,
        props: {
          assetId: asset.id,
          w: imageWidth,
          h: imageHeight,
        },
      });

      console.log("Shape creation returned:", createdShapeId);

      // Wait a moment for the shape to be created
      await new Promise(resolve => setTimeout(resolve, 200));

      // Get all shapes and find the one we just created
      const shapes = editor.getCurrentPageShapes();
      console.log("Total shapes on page:", shapes.length);
      
      const newShape = shapes.find((shape: any) => 
        shape.type === 'image' && 
        shape.props?.assetId === asset.id
      );

      if (newShape) {
        console.log("✅ Shape found successfully!", newShape.id);
        console.log("Shape details:", {
          id: newShape.id,
          type: newShape.type,
          x: newShape.x,
          y: newShape.y,
          props: newShape.props
        });
        
        // Select the newly created shape
        editor.select(newShape.id);
        console.log("Shape selected");
        
        // Zoom to fit the shape in view
        editor.zoomToSelection();
        console.log("Zoomed to shape");
        
        alert("✅ Diagram inserted successfully!");
      } else {
        console.error("❌ Shape not found after creation");
        console.log("Looking for asset ID:", asset.id);
        console.log("Available image shapes:", shapes.filter((s: any) => s.type === 'image').map((s: any) => ({
          id: s.id,
          assetId: s.props?.assetId
        })));
        alert("⚠️ Diagram was created but may not be visible. Try zooming out or check the layers.");
      }

      // Close the modal
      setShowDiagramModal(false);
      setDiagramDescription("");
      setMermaidCode("");
      setRenderedSVG(null);

    } catch (error) {
      console.error("Error creating image asset:", error);
      alert(`Failed to insert diagram: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
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
            
            // Get all shapes to find the rightmost position
            const shapes = editor.getCurrentPageShapes();
            let maxX = 0;
            let maxWidth = 0;
            
            // Find the rightmost edge of existing content
            shapes.forEach((shape: any) => {
              const shapeX = shape.x;
              const shapeWidth = 'w' in shape.props ? (shape.props.w as number) : 100;
              const rightEdge = shapeX + shapeWidth;
              if (rightEdge > maxX) {
                maxX = rightEdge;
                maxWidth = shapeWidth;
              }
            });
            
            // Calculate the shape dimensions based on the text length
            const summaryText = `📋 Whiteboard Summary:\n${data.text}`;
            
            // Estimate width based on text length (characters per line)
            const charsPerLine = 60; // Average number of characters per line
            const lines = Math.ceil(summaryText.length / charsPerLine);
            const estimatedLineCount = lines + (summaryText.split('\n').length - 1);
            
            // Calculate width and height based on text content
            const noteWidth = Math.min(500, Math.max(300, Math.sqrt(summaryText.length) * 20));
            const noteHeight = Math.max(100, estimatedLineCount * 20); // 20px per line
            
            // Position the summary to the right of existing content with some margin
            const summaryX = maxX > 0 ? maxX + 50 : width / 2 - noteWidth / 2;
            const summaryY = 50; // Start from top
            
            // Create a note shape with the AI summary
            editor.createShape({
              type: "geo",
              x: summaryX,
              y: summaryY,
              props: {
                richText: toRichText(summaryText),
                color: "black",
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
    
    // Add paste event listener for pasting images
    const handlePaste = async (event: ClipboardEvent) => {
      event.preventDefault();
      
      const items = event.clipboardData?.items;
      if (!items) return;
      
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        
        // Check if the item is an image
        if (item.type.indexOf('image') !== -1) {
          const blob = item.getAsFile();
          if (!blob) continue;
          
          console.log('Image pasted from clipboard:', blob.type, blob.size);
          
          try {
            // Convert blob to base64
            const reader = new FileReader();
            const base64Promise = new Promise<string>((resolve, reject) => {
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            });
            
            const base64Image = await base64Promise;
            
            // Upload to server
            const formData = new FormData();
            formData.append('file', blob, `pasted_${Date.now()}.png`);
            
            const uploadResponse = await fetch('/api/upload-diagram', {
              method: 'POST',
              body: formData,
            });
            
            if (!uploadResponse.ok) {
              throw new Error('Failed to upload pasted image');
            }
            
            const uploadData = await uploadResponse.json();
            const imageUrl = uploadData.publicUrl;
            const fullImageUrl = window.location.origin + imageUrl;
            
            console.log('Pasted image uploaded:', fullImageUrl);
            
            // Get image dimensions
            const img = new Image();
            await new Promise((resolve, reject) => {
              img.onload = resolve;
              img.onerror = reject;
              img.src = URL.createObjectURL(blob);
            });
            
            // Create asset
            const assetId = AssetRecordType.createId();
            const asset: TLAsset = {
              id: assetId,
              type: 'image',
              typeName: 'asset',
              props: {
                name: uploadData.fileName,
                src: fullImageUrl,
                w: img.width,
                h: img.height,
                mimeType: blob.type,
                isAnimated: false,
              },
              meta: {},
            };
            
            editor.createAssets([asset]);
            await new Promise(resolve => setTimeout(resolve, 300));
            
            // Get viewport bounds for positioning
            const viewport = editor.getViewportPageBounds();
            const centerX = viewport.x + viewport.width / 2;
            const centerY = viewport.y + viewport.height / 2;
            
            // Calculate size (max 70% of viewport)
            const maxWidth = viewport.width * 0.7;
            const maxHeight = viewport.height * 0.7;
            
            let width = img.width;
            let height = img.height;
            
            if (width > maxWidth || height > maxHeight) {
              const scale = Math.min(maxWidth / width, maxHeight / height);
              width *= scale;
              height *= scale;
            }
            
            // Create shape
            editor.createShape({
              type: 'image',
              x: centerX - width / 2,
              y: centerY - height / 2,
              props: {
                assetId: assetId,
                w: width,
                h: height,
              },
            });
            
            console.log('Pasted image inserted successfully!');
            
          } catch (error) {
            console.error('Error pasting image:', error);
            alert('Failed to paste image');
          }
          
          break;
        }
      }
    };
    
    // Add event listener to the canvas
    document.addEventListener('paste', handlePaste);
    
    // Cleanup on unmount
    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  };

  const uiOverrides: TLUiOverrides = {
    tools(editor, tools) {
      return tools;
    },
  };

  return (
    <div className="h-full w-full flex flex-col bg-white">
      <div className="flex-1 relative">
        <Tldraw
          store={store}
          onMount={handleEditorMount}
          overrides={uiOverrides}
          className="h-full w-full"
        />
      </div>

      {/* Message input and controls */}
      <div className="p-4 bg-black border-t border-gray-800">
        <div className="flex gap-2">
          <div className="flex-1 flex gap-2">
            <Input
              placeholder="Send a message to AI..."
              className="flex-1 bg-gray-900 border-gray-700 text-white placeholder:text-gray-400 focus:border-primary-100 focus-visible:ring-primary-100/50"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !message.trim()}
              className="bg-gradient-to-r from-primary-100 to-blue-600 hover:from-primary-200 hover:to-blue-700 text-black font-medium shadow-lg"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Send className="h-4 w-4 mr-1" />}
              Send
            </Button>
          </div>
          <Button
            onClick={() => setShowDiagramModal(true)}
            variant="outline"
            className="gap-1 bg-gray-900 border-gray-700 text-white hover:bg-gray-800 hover:border-primary-100"
          >
            <PlusCircle className="h-4 w-4 mr-1" />
            Add Diagram
          </Button>
          <Button
            onClick={captureWhiteboard}
            variant="outline"
            className="gap-1 bg-gray-900 border-gray-700 text-white hover:bg-gray-800 hover:border-primary-100"
            disabled={isSummarizing}
          >
            {isSummarizing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
            Summarize Board
          </Button>
        </div>
      </div>

      {/* Diagram dialog */}
      <Dialog open={showDiagramModal} onOpenChange={setShowDiagramModal}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] p-0 z-[500] bg-white border-gray-200 overflow-hidden flex flex-col">
          <DialogHeader className="p-4 border-b border-gray-200 flex-shrink-0">
            <DialogTitle className="text-gray-900">Generate Diagram</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex-shrink-0">
              <Textarea
                placeholder="Describe the diagram you want to generate (e.g., 'A system architecture with load balancer, web servers, and database')"
                value={diagramDescription}
                onChange={(e) => setDiagramDescription(e.target.value)}
                className="min-h-[80px] bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
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

            <div className="flex-1 flex overflow-hidden min-h-0">
              {/* Code Editor */}
              <div className="w-1/2 p-4 border-r border-gray-200 flex flex-col">
                <h3 className="text-sm font-medium mb-2 text-gray-900">Mermaid Code</h3>
                <div className="flex-1 overflow-auto">
                  <CodeEditor
                    value={mermaidCode}
                    language="text"
                    placeholder="Mermaid diagram code will appear here..."
                    onChange={(evn) => setMermaidCode(evn.target.value)}
                    padding={15}
                    data-color-mode="light"
                    style={{
                      backgroundColor: "#f9fafb",
                      fontFamily: 'ui-monospace,SFMono-Regular,"SF Mono",Consolas,"Liberation Mono",Menlo,monospace',
                      fontSize: 12,
                      minHeight: "300px",
                      border: "1px solid #e5e7eb",
                      borderRadius: "0.375rem",
                    }}
                  />
                </div>
              </div>

              {/* Preview */}
              <div className="w-1/2 p-4 flex flex-col">
                <h3 className="text-sm font-medium mb-2 text-gray-900">Preview</h3>
                <Card className="flex-1 bg-white border-gray-200 p-4 overflow-auto">
                  <div
                    ref={mermaidContainerRef}
                    className="h-full flex items-center justify-center text-gray-900"
                  >
                    {!mermaidCode && (
                      <p className="text-gray-500">Diagram preview will appear here</p>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          </div>

          <DialogFooter className="p-4 border-t border-gray-200 flex-shrink-0">
            <div className="flex gap-2 w-full justify-end">
              <Button
                variant="outline"
                onClick={() => setShowDiagramModal(false)}
                className="bg-white border-gray-300 text-gray-900 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCopyToClipboard}
                disabled={!renderedSVG || isCopying}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isCopying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Copying...
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy to Clipboard
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
