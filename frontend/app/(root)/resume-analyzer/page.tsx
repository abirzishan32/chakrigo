"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
    Upload,
    FileText,
    Target,
    Info,
    Plus,
    Trash2,
    Calendar,
    TrendingUp,
    Briefcase,
    Eye,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";


// Define the component as a named function first
function ResumeAnalyzerPage() {
    const router = useRouter();

    // State for analyses
    const [analyses, setAnalyses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteLoading, setDeleteLoading] = useState(null);

    // State for dialog
    const [dialogOpen, setDialogOpen] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);

    // State for form
    const fileInputRef = useRef(null);
    const [targetRole, setTargetRole] = useState("");
    const [targetDescription, setTargetDescription] = useState("");
    const [fileName, setFileName] = useState("");
    const [roleError, setRoleError] = useState("");
    const [descriptionError, setDescriptionError] = useState("");
    const [fileError, setFileError] = useState("");

    // Typing animation for header
    const fullText = "Your Resume Analysis Dashboard";
    const [displayedText, setDisplayedText] = useState("");
    const [index, setIndex] = useState(0);
    const [isTyping, setIsTyping] = useState(true);

    // Fetch analyses on component mount
    useEffect(() => {
        fetchAnalyses();
    }, []);

    // Typing animation effect
    useEffect(() => {
        let timer;
        if (isTyping) {
            if (index < fullText.length) {
                timer = setTimeout(() => {
                    setDisplayedText((prev) => prev + fullText.charAt(index));
                    setIndex(index + 1);
                }, 50);
            } else {
                timer = setTimeout(() => {
                    setIsTyping(false);
                    setDisplayedText("");
                    setIndex(0);
                }, 3000);
            }
        } else {
            timer = setTimeout(() => {
                setIsTyping(true);
            }, 500);
        }
        return () => clearTimeout(timer);
    }, [index, isTyping, fullText]);

    const fetchAnalyses = async () => {

        try {
            setLoading(true);
            const response = await fetch("/api/resume-analysis");
            const result = await response.json();

            if (response.ok) {
                setAnalyses(result.data || []);
            } else {
                toast.error("Failed to fetch analyses");
            }
        } catch (error) {
            console.error("Error fetching analyses:", error);
            toast.error("Failed to fetch analyses");
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setFileName(file.name);
            setFileError("");
        }
    };

    const handleDescriptionChange = (e) => {
        const value = e.target.value;
        if (value.length <= 2000) {
            setTargetDescription(value);
            if (value.length > 0 && value.length < 10) {
                setDescriptionError(
                    "Description must be at least 10 characters"
                );
            } else {
                setDescriptionError("");
            }
        }
    };

    const resetForm = () => {
        setTargetRole("");
        setTargetDescription("");
        setFileName("");
        setRoleError("");
        setDescriptionError("");
        setFileError("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleAnalyze = async () => {
        // Check if user has reached the limit
        if (analyses.length >= 10) {
            toast.error(
                "You have reached the maximum limit of 10 analyses. Please delete some analyses to continue."
            );
            return;
        }

        // Validation
        if (!fileInputRef.current?.files?.[0]) {
            setFileError("Please upload a resume file");
            return;
        }
        if (!targetRole.trim()) {
            setRoleError("Please specify your target role");
            return;
        }
        if (targetDescription.length < 10) {
            setDescriptionError("Description must be at least 10 characters");
            return;
        }

        const formData = new FormData();
        formData.append("resume", fileInputRef.current.files[0]);
        formData.append("targetRole", targetRole);
        formData.append("targetDescription", targetDescription);

        setSubmitLoading(true);
        try {
            const response = await fetch("/api/resume-analysis", {
                method: "POST",
                body: formData,
            });
            const result = await response.json();

            if (response.ok) {
                toast.success("Resume analysis completed successfully");
                setDialogOpen(false);
                resetForm();
                fetchAnalyses(); // Refresh the list
            } else {
                throw new Error(result.error || "Failed to analyze resume");
            }
        } catch (error) {
            toast.error(
                "Failed to analyze resume: " +
                    (error.message || "Unknown error")
            );
            console.error("Error analyzing resume:", error);
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleDelete = async (id) => {
        setDeleteLoading(id);
        try {
            const response = await fetch(`/api/resume-analysis?id=${id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                toast.success("Analysis deleted successfully");
                fetchAnalyses(); // Refresh the list
            } else {
                throw new Error("Failed to delete analysis");
            }
        } catch (error) {
            toast.error("Failed to delete analysis");
            console.error("Error deleting analysis:", error);
        } finally {
            setDeleteLoading(null);
        }
    };

    const getScoreColor = (score) => {
        if (score >= 80) return "text-green-600";
        if (score >= 60) return "text-yellow-600";
        return "text-red-600";
    };

    const getScoreBgColor = (score) => {
        if (score >= 80) return "bg-green-100";
        if (score >= 60) return "bg-yellow-100";
        return "bg-red-100";
    };


    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="flex items-center justify-center space-x-4 mb-6"
                    >
                        <Image
                            src="/resumeanalyzer.png"
                            alt="Resume Analyzer"
                            width={60}
                            height={60}
                            className="rounded-lg shadow-lg"
                        />
                        <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent min-h-[3rem] flex items-center">
                            {isTyping ? displayedText : fullText}
                            <span
                                className={`ml-1 w-[3px] h-8 bg-blue-600 ${
                                    isTyping ? "animate-pulse" : "opacity-0"
                                }`}
                            />
                        </h1>
                    </motion.div>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
                    >
                        Analyze your resume against specific job requirements
                        and get detailed feedback to improve your chances
                    </motion.p>
                </div>

                {/* Action Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4"
                >
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <FileText className="mr-2" size={16} />
                        {analyses.length} of 10 analyses used
                    </div>

                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button
                                size="lg"
                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                                disabled={analyses.length >= 10}
                            >
                                <Plus className="mr-2" size={20} />
                                Analyze New Resume
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-lg">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-bold text-center">
                                    Analyze Your Resume
                                </DialogTitle>
                            </DialogHeader>
                            
                            <div className="space-y-6 mt-6 max-h-[500px] overflow-y-auto">
                                
                                {/* File Upload */}
                                <div>
                                    <Label
                                        htmlFor="resume"
                                        className="text-sm font-semibold"
                                    >
                                        Upload Resume{" "}
                                        <span className="text-gray-500">
                                            (PDF)
                                        </span>
                                    </Label>
                                    <div className="flex items-center border rounded-lg overflow-hidden mt-2">
                                        <label
                                            htmlFor="resume"
                                            className="flex items-center space-x-2 bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-3 cursor-pointer transition-colors"
                                        >
                                            <Upload size={18} />
                                            <span>Select File</span>
                                        </label>
                                        <input
                                            type="file"
                                            id="resume"
                                            ref={fileInputRef}
                                            onChange={handleFileUpload}
                                            disabled={submitLoading}
                                            accept=".pdf"
                                            className="hidden"
                                        />
                                        <div className="flex-1 px-4 text-sm text-gray-500 truncate">
                                            {fileName || "No file chosen"}
                                        </div>
                                    </div>
                                    {fileError && (
                                        <p className="text-red-500 text-sm mt-1">
                                            {fileError}
                                        </p>
                                    )}
                                </div>

                                {/* Target Role */}
                                <div>
                                    <Label
                                        htmlFor="targetRole"
                                        className="text-sm font-semibold"
                                    >
                                        Target Role
                                    </Label>
                                    <div className="flex items-center border rounded-lg px-3 mt-2">
                                        <Target
                                            className="text-gray-400 mr-2"
                                            size={18}
                                        />
                                        <Input
                                            id="targetRole"
                                            value={targetRole}
                                            disabled={submitLoading}
                                            onChange={(e) =>
                                                setTargetRole(e.target.value)
                                            }
                                            placeholder="e.g. Frontend Developer"
                                            className="border-0 focus-visible:ring-0"
                                        />
                                    </div>
                                    {roleError && (
                                        <p className="text-red-500 text-sm mt-1">
                                            {roleError}
                                        </p>
                                    )}
                                </div>

                                {/* Role Description */}
                                <div>
                                    <Label
                                        htmlFor="targetDescription"
                                        className="text-sm font-semibold"
                                    >
                                        Role Description{" "}
                                        <span className="text-gray-500">
                                            (10–2000 characters)
                                        </span>
                                    </Label>
                                    <Textarea
                                        id="targetDescription"
                                        value={targetDescription}
                                        disabled={submitLoading}
                                        onChange={handleDescriptionChange}
                                        placeholder="Describe the role responsibilities and requirements..."
                                        className="mt-2 min-h-[100px]"
                                        maxLength={2000}
                                    />
                                    <div className="flex justify-between items-center mt-1">
                                        <div className="flex items-center text-xs text-gray-500">
                                            <Info size={14} className="mr-1" />
                                            {targetDescription.length < 10 ? (
                                                <span className="text-red-500">
                                                    Minimum 10 characters
                                                    required
                                                </span>
                                            ) : (
                                                <span>
                                                    {2000 -
                                                        targetDescription.length}{" "}
                                                    characters remaining
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-xs text-gray-500">
                                            {targetDescription.length}/2000
                                        </span>
                                    </div>
                                    {descriptionError && (
                                        <p className="text-red-500 text-sm mt-1">
                                            {descriptionError}
                                        </p>
                                    )}
                                </div>

                                {/* Analyze Button */}
                                <Button
                                    onClick={handleAnalyze}
                                    disabled={submitLoading}
                                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3"
                                    size="lg"
                                >
                                    {submitLoading ? (
                                        <span className="flex items-center justify-center">
                                            <svg
                                                className="animate-spin h-5 w-5 mr-3"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                ></circle>
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2.293 6.707A8.003 8.003 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3.293-3.231z"
                                                ></path>
                                            </svg>
                                            Analyzing...
                                        </span>
                                    ) : (
                                        "Analyze Resume"
                                    )}
                                </Button>
                                
                            </div>
                            
                        </DialogContent>
                    </Dialog>
                </motion.div>

                {/* Analyses Grid */}
                <AnimatePresence>
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, i) => (
                                <Card key={i} className="h-64">
                                    <CardHeader>
                                        <Skeleton className="h-6 w-3/4" />
                                        <Skeleton className="h-4 w-1/2" />
                                    </CardHeader>
                                    <CardContent>
                                        <Skeleton className="h-4 w-full mb-2" />
                                        <Skeleton className="h-4 w-2/3 mb-4" />
                                        <Skeleton className="h-8 w-16" />
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : analyses.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-16"
                        >
                            <div className="bg-gray-100 dark:bg-gray-800 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                                <FileText size={48} className="text-gray-400" />
                            </div>
                            <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                                No Analyses Yet
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                                Start by analyzing your first resume to get
                                detailed feedback and improve your chances
                            </p>
                            <Button
                                onClick={() => setDialogOpen(true)}
                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                            >
                                <Plus className="mr-2" size={20} />
                                Analyze Your First Resume
                            </Button>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {analyses.map((analysis, index) => (
                                <motion.div
                                    key={analysis.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        duration: 0.5,
                                        delay: index * 0.1,
                                    }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                >
                                    <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white dark:bg-gray-800 overflow-hidden group">
                                        <CardHeader className="pb-3">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <CardTitle className="text-lg font-bold text-gray-800 dark:text-gray-200 flex items-center">
                                                        <Briefcase
                                                            size={18}
                                                            className="mr-2"
                                                        />
                                                        {analysis.targetRole}
                                                    </CardTitle>
                                                    <div className="flex items-center text-sm text-gray-500 mt-1">
                                                        <Calendar
                                                            size={14}
                                                            className="mr-1"
                                                        />
                                                        {formatDate(
                                                            analysis.createdAt
                                                        )}
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleDelete(
                                                            analysis.id
                                                        )
                                                    }
                                                    disabled={
                                                        deleteLoading ===
                                                        analysis.id
                                                    }
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    {deleteLoading ===
                                                    analysis.id ? (
                                                        <svg
                                                            className="animate-spin h-4 w-4"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <circle
                                                                className="opacity-25"
                                                                cx="12"
                                                                cy="12"
                                                                r="10"
                                                                stroke="currentColor"
                                                                strokeWidth="4"
                                                                fill="none"
                                                            />
                                                            <path
                                                                className="opacity-75"
                                                                fill="currentColor"
                                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2.293 6.707A8.003 8.003 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3.293-3.231z"
                                                            />
                                                        </svg>
                                                    ) : (
                                                        <Trash2 size={16} />
                                                    )}
                                                </Button>
                                            </div>
                                        </CardHeader>

                                        <CardContent className="space-y-4">
                                            {/* Overall Score */}
                                            <div
                                                className={`flex items-center justify-between p-3 rounded-lg ${getScoreBgColor(
                                                    analysis.overallScore
                                                )}`}
                                            >
                                                <div className="flex items-center">
                                                    <TrendingUp
                                                        size={18}
                                                        className={getScoreColor(
                                                            analysis.overallScore
                                                        )}
                                                    />
                                                    <span className="ml-2 font-semibold text-gray-700">
                                                        Overall Score
                                                    </span>
                                                </div>
                                                <span
                                                    className={`text-2xl font-bold ${getScoreColor(
                                                        analysis.overallScore
                                                    )}`}
                                                >
                                                    {analysis.overallScore}/100
                                                </span>
                                            </div>
                                            {/* Summary */}
                                            <div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                                                    {analysis.summary}
                                                </p>
                                            </div>
                                            {/* Match Score */}
                                            {analysis.jobFitAnalysis
                                                ?.matchScore && (
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-600 dark:text-gray-400">
                                                        Job Match
                                                    </span>
                                                    <span className="font-semibold text-blue-600">
                                                        {
                                                            analysis
                                                                .jobFitAnalysis
                                                                .matchScore
                                                        }
                                                        %
                                                    </span>
                                                </div>
                                            )}{" "}
                                            {/* View Details Button */}
                                            <Button
                                                variant="outline"
                                                className="w-full mt-4 group-hover:bg-blue-50 group-hover:border-blue-200 transition-colors"
                                                onClick={() =>
                                                    router.push(
                                                        `/resume-analyzer/${analysis.id}`
                                                    )
                                                }
                                            >
                                                <Eye
                                                    size={16}
                                                    className="mr-2"
                                                />
                                                View Full Report
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

export default ResumeAnalyzerPage;
