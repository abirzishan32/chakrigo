"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Save, Copy } from "lucide-react";
import { toast } from "sonner";

// Import the Monaco Editor dynamically to avoid SSR issues
const MonacoEditor = dynamic(
    () => import("@monaco-editor/react").then(mod => mod.default),
    { ssr: false }
);

// List of supported programming languages
const LANGUAGES = [
    { value: "javascript", label: "JavaScript" },
    { value: "typescript", label: "TypeScript" },
    { value: "html", label: "HTML" },
    { value: "css", label: "CSS" },
    { value: "python", label: "Python" },
    { value: "java", label: "Java" },
    { value: "csharp", label: "C#" },
    { value: "cpp", label: "C++" },
    { value: "go", label: "Go" },
    { value: "ruby", label: "Ruby" },
    { value: "php", label: "PHP" },
    { value: "rust", label: "Rust" },
    { value: "swift", label: "Swift" },
    { value: "json", label: "JSON" },
    { value: "markdown", label: "Markdown" },
    { value: "sql", label: "SQL" },
    { value: "shell", label: "Shell/Bash" },
    { value: "xml", label: "XML" },
    { value: "yaml", label: "YAML" }
];

interface CodeEditorProps {
    code: string;
    language: string;
    onChange: (code: string) => void;
    onLanguageChange: (language: string) => void;
    readOnly?: boolean;
    onSave?: (e?: React.FormEvent) => void;
}

export default function CodeEditor({
    code,
    language,
    onChange,
    onLanguageChange,
    readOnly = false,
    onSave
}: CodeEditorProps) {
    const [mounted, setMounted] = useState(false);

    // Handle copy to clipboard
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(code);
            toast.success("Code copied to clipboard!");
        } catch (err) {
            toast.error("Failed to copy code to clipboard");
        }
    };

    // Create a handler for the save button
    const handleSave = () => {
        if (onSave) {
            const form = document.querySelector('form');
            if (form) {
                form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
            }
        }
    };

    // Set mounted state after component mounts to prevent SSR issues
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="h-full border rounded-md flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-sm text-muted-foreground">Loading editor...</div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {/* Editor Controls - Compact */}
            <div className="flex justify-between items-center p-2 border-b bg-muted/30 flex-shrink-0">
                <Select value={language} onValueChange={onLanguageChange} disabled={readOnly}>
                    <SelectTrigger className="w-36 h-8 text-xs">
                        <SelectValue placeholder="Language" />
                    </SelectTrigger>
                    <SelectContent>
                        {LANGUAGES.map((lang) => (
                            <SelectItem key={lang.value} value={lang.value}>
                                {lang.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <div className="flex gap-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopy}
                        title="Copy code"
                        className="h-8 px-2 text-xs"
                    >
                        <Copy size={12} className="mr-1" />
                        Copy
                    </Button>

                    {onSave && !readOnly && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleSave}
                            title="Save changes"
                            className="h-8 px-2 text-xs"
                        >
                            <Save size={12} className="mr-1" />
                            Save
                        </Button>
                    )}
                </div>
            </div>

            {/* Monaco Editor - Takes remaining space */}
            <div className="flex-1 overflow-hidden">
                <MonacoEditor
                    height="100%"
                    language={language}
                    value={code}
                    onChange={(value) => onChange(value || "")}
                    options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        wordWrap: "on",
                        readOnly,
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        tabSize: 2,
                        lineNumbers: "on",
                        renderWhitespace: "none",
                        padding: { top: 10, bottom: 10 },
                        lineDecorationsWidth: 0,
                        lineNumbersMinChars: 3,
                        glyphMargin: false,
                        folding: false,
                        // Optimize for smaller screens
                        scrollbar: {
                            vertical: "auto",
                            horizontal: "auto",
                            verticalSliderSize: 8,
                            horizontalSliderSize: 8,
                        },
                    }}
                    theme="vs-dark"
                />
            </div>
        </div>
    );
}