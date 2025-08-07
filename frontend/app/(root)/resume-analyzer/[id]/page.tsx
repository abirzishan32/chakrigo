"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft,
    Calendar,
    Target,
    TrendingUp,
    User,
    Mail,
    Phone,
    MapPin,
    ExternalLink,
    Award,
    BookOpen,
    Code,
    Briefcase,
    CheckCircle,
    XCircle,
    AlertCircle,
    Lightbulb,
    Star,
    Download,
    Share,
    FileText,
    Eye,
    Trophy,
} from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/lib/hooks/useAuth";

// Animated score circle component
function ScoreCircle({ score, size = 120, strokeWidth = 8, label }) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (score / 100) * circumference;

    const getScoreColor = (score) => {
        if (score >= 80) return "#22c55e"; // green
        if (score >= 60) return "#f59e0b"; // yellow
        return "#ef4444"; // red
    };

    return (
        <div className="relative flex items-center justify-center">
            <svg width={size} height={size} className="transform -rotate-90">
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="none"
                    className="text-gray-200 dark:text-gray-700"
                />
                {/* Progress circle */}
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={getScoreColor(score)}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span
                    className="text-2xl font-bold"
                    style={{ color: getScoreColor(score) }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                >
                    {score}
                </motion.span>
                <span className="text-sm text-gray-500 dark:text-gray-300 font-medium">
                    {label}
                </span>
            </div>
        </div>
    );
}

// Section analysis component
function SectionAnalysis({ section, index }) {
    const getScoreColor = (score) => {
        if (score >= 80) return "text-green-600";
        if (score >= 60) return "text-yellow-600";
        return "text-red-600";
    };

    const getScoreBg = (score) => {
        if (score >= 80) return "bg-green-50 border-green-200";
        if (score >= 60) return "bg-yellow-50 border-yellow-200";
        return "bg-red-50 border-red-200";
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
        >
            {" "}
            <Card className="h-full hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-white dark:bg-gray-800">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        {" "}
                        <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                            {section.sectionName}
                        </CardTitle>
                        <div
                            className={`px-3 py-1 rounded-full border ${getScoreBg(
                                section.score
                            )}`}
                        >
                            <span
                                className={`font-bold ${getScoreColor(
                                    section.score
                                )}`}
                            >
                                {section.score}/100
                            </span>
                        </div>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <motion.div
                            className={`h-2 rounded-full ${
                                section.score >= 80
                                    ? "bg-green-500"
                                    : section.score >= 60
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                            }`}
                            initial={{ width: 0 }}
                            animate={{ width: `${section.score}%` }}
                            transition={{
                                duration: 1,
                                delay: index * 0.1 + 0.5,
                            }}
                        />
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {section.issues && section.issues.length > 0 && (
                        <div>
                            {" "}
                            <h4 className="font-semibold text-red-600 dark:text-red-300 flex items-center mb-3 text-base">
                                <XCircle size={16} className="mr-2" />
                                Issues Found
                            </h4>
                            <ul className="space-y-2">
                                {section.issues.map((issue, idx) => (
                                    <li
                                        key={idx}
                                        className="text-sm text-gray-700 dark:text-gray-200 flex items-start leading-relaxed"
                                    >
                                        <span className="w-1.5 h-1.5 bg-red-400 rounded-full mt-2 mr-3 flex-shrink-0" />
                                        {issue}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {section.recommendations &&
                        section.recommendations.length > 0 && (
                            <div>
                                {" "}
                                <h4 className="font-semibold text-blue-600 dark:text-blue-300 flex items-center mb-3 text-base">
                                    <Lightbulb size={16} className="mr-2" />
                                    Recommendations
                                </h4>
                                <ul className="space-y-2">
                                    {section.recommendations.map((rec, idx) => (
                                        <li
                                            key={idx}
                                            className="text-sm text-gray-700 dark:text-gray-200 flex items-start leading-relaxed"
                                        >
                                            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0" />
                                            {rec}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                </CardContent>
            </Card>
        </motion.div>
    );
}

// Loading skeleton component
function LoadingSkeleton() {
    return (
        <div className="space-y-6">
            {/* Header skeleton */}
            <div className="flex items-center justify-between">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-10 w-24" />
            </div>

            {/* Title skeleton */}
            <div className="space-y-2">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-48" />
            </div>

            {/* Overview cards skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader>
                            <Skeleton className="h-6 w-24" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-16 w-16 rounded-full mx-auto mb-4" />
                            <Skeleton className="h-4 w-20 mx-auto" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Content sections skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                    <Card key={i} className="h-64">
                        <CardHeader>
                            <Skeleton className="h-6 w-32" />
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

// Parsed data display component
function ParsedDataDisplay({ parsedData }) {
    if (!parsedData)
        return <p className="text-gray-500">No parsed data available</p>;

    const renderSection = (title, data, icon) => {
        if (
            !data ||
            (Array.isArray(data) && data.length === 0) ||
            (typeof data === "object" && Object.keys(data).length === 0)
        ) {
            return null;
        }

        return (
            <div className="mb-6">
                <h3 className="font-semibold text-lg flex items-center mb-3 text-gray-800 dark:text-gray-100">
                    {icon}
                    {title}
                </h3>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    {renderData(data)}
                </div>
            </div>
        );
    };

    const renderData = (data) => {
        if (Array.isArray(data)) {
            return (
                <ul className="space-y-2">
                    {data.map((item, index) => (
                        <li key={index} className="text-sm">
                            {typeof item === "string" ? (
                                <span className="text-gray-700 dark:text-gray-200 text-base">
                                    {item}
                                </span>
                            ) : (
                                <div className="bg-white dark:bg-gray-600 rounded p-3 border dark:border-gray-500">
                                    {renderData(item)}
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            );
        } else if (typeof data === "object" && data !== null) {
            return (
                <div className="space-y-3">
                    {" "}
                    {Object.entries(data).map(([key, value]) => (
                        <div key={key}>
                            <span className="font-medium text-gray-600 dark:text-gray-300 capitalize text-base">
                                {key.replace(/([A-Z])/g, " $1").trim()}:
                            </span>
                            <div className="ml-4 mt-1">{renderData(value)}</div>
                        </div>
                    ))}
                </div>
            );
        } else {
            return (
                <span className="text-gray-700 dark:text-gray-200 text-base">
                    {String(data)}
                </span>
            );
        }
    };

    return (
        <div className="max-h-[70vh] overflow-y-auto">
            {renderSection(
                "Contact Information",
                parsedData.contactInfo,
                <User className="mr-2" size={20} />
            )}
            {renderSection(
                "Professional Summary",
                parsedData.professionalSummary,
                <FileText className="mr-2" size={20} />
            )}
            {renderSection(
                "Work Experience",
                parsedData.workExperience,
                <Briefcase className="mr-2" size={20} />
            )}
            {renderSection(
                "Education",
                parsedData.education,
                <BookOpen className="mr-2" size={20} />
            )}
            {renderSection(
                "Skills",
                parsedData.skills,
                <Code className="mr-2" size={20} />
            )}
            {renderSection(
                "Certifications",
                parsedData.certifications,
                <Award className="mr-2" size={20} />
            )}
            {renderSection(
                "Languages",
                parsedData.languages,
                <Star className="mr-2" size={20} />
            )}
            {renderSection(
                "Achievements",
                parsedData.achievements,
                <Trophy className="mr-2" size={20} />
            )}
            {renderSection(
                "Projects",
                parsedData.projects,
                <Code className="mr-2" size={20} />
            )}
        </div>
    );
}

// Main component
function ResumeAnalysisDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [parsedDataDialogOpen, setParsedDataDialogOpen] = useState(false);

    useEffect(() => {
        if (id) {
            fetchAnalysis();
        }
    }, [id]);

    const fetchAnalysis = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/resume-analysis/${id}`);
            const result = await response.json();

            if (response.ok) {
                setAnalysis(result.data);
            } else {
                setError(result.error || "Failed to fetch analysis");
                toast.error("Failed to load analysis");
            }
        } catch (error) {
            console.error("Error fetching analysis:", error);
            setError("Failed to fetch analysis");
            toast.error("Failed to load analysis");
        } finally {
            setLoading(false);
        }
    };

    if (!loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
                <div className="container mx-auto px-4 py-8">
                    <div className="max-w-md mx-auto text-center">
                        <AlertCircle
                            size={48}
                            className="mx-auto text-red-500 mb-4"
                        />{" "}
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                            Analysis Not Found
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300 mb-6 text-base">
                            The resume analysis you're looking for doesn't exist
                            or you don't have permission to view it.
                        </p>
                        <Button onClick={() => router.push("/resume-analyzer")}>
                            <ArrowLeft className="mr-2" size={16} />
                            Back to Dashboard
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <div className="container mx-auto px-4 py-8">
                {loading ? (
                    <LoadingSkeleton />
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6 }}
                    >
                        {/* Header */}
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="flex items-center justify-between mb-8"
                        >
                            <Button
                                variant="ghost"
                                onClick={() => router.push("/resume-analyzer")}
                                className="text-blue-600 hover:text-blue-700"
                            >
                                <ArrowLeft className="mr-2" size={16} />
                                Back to Dashboard
                            </Button>

                            <div className="flex gap-2">
                                <Button variant="outline" size="sm">
                                    <Share className="mr-2" size={16} />
                                    Share
                                </Button>
                                <Button variant="outline" size="sm">
                                    <Download className="mr-2" size={16} />
                                    Export
                                </Button>
                            </div>
                        </motion.div>{" "}
                        {/* Title Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="mb-8"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <Target
                                        className="text-blue-600"
                                        size={24}
                                    />
                                    <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
                                        {analysis?.targetRole}
                                    </h1>
                                </div>

                                {/* Parsed Data Dialog */}
                                <Dialog
                                    open={parsedDataDialogOpen}
                                    onOpenChange={setParsedDataDialogOpen}
                                >
                                    <DialogTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex items-center gap-2"
                                        >
                                            <Eye size={16} />
                                            View Parsed Data
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-4xl max-h-[80vh]">
                                        <DialogHeader>
                                            <DialogTitle className="flex items-center gap-2">
                                                <FileText size={20} />
                                                Complete Parsed Resume Data
                                            </DialogTitle>
                                        </DialogHeader>
                                        <ParsedDataDisplay
                                            parsedData={analysis?.parsedData}
                                        />
                                    </DialogContent>
                                </Dialog>
                            </div>{" "}
                            <div className="flex items-center text-gray-500 dark:text-gray-300 gap-4">
                                <div className="flex items-center">
                                    <Calendar size={16} className="mr-1" />
                                    <span className="text-sm font-medium">
                                        {formatDate(analysis?.createdAt)}
                                    </span>
                                </div>
                                <div className="flex items-center">
                                    <User size={16} className="mr-1" />
                                    <span className="text-sm font-medium">
                                        Analysis Report
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                        {/* Overview Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                            >
                                {" "}
                                <Card className="text-center h-full dark:bg-gray-800">
                                    <CardHeader>
                                        <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                                            Overall Score
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ScoreCircle
                                            score={analysis?.overallScore || 0}
                                            label="Overall"
                                        />
                                    </CardContent>
                                </Card>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.3 }}
                            >
                                {" "}
                                <Card className="text-center h-full dark:bg-gray-800">
                                    <CardHeader>
                                        <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                                            Job Match
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ScoreCircle
                                            score={
                                                analysis?.jobFitAnalysis
                                                    ?.matchScore || 0
                                            }
                                            label="Match"
                                        />
                                    </CardContent>
                                </Card>
                            </motion.div>{" "}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.4 }}
                            >
                                {" "}
                                <Card className="h-full flex flex-col dark:bg-gray-800">
                                    <CardHeader>
                                        <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                                            Quick Stats
                                        </CardTitle>
                                    </CardHeader>{" "}
                                    <CardContent className="flex-1 flex flex-col justify-center space-y-4">
                                        {" "}
                                        <div className="flex justify-between items-center py-2">
                                            <span className="text-gray-700 dark:text-gray-100 text-base font-medium">
                                                Sections Analyzed
                                            </span>
                                            <span className="font-semibold text-xl text-gray-900 dark:text-gray-50">
                                                {analysis?.analysis?.length ||
                                                    0}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center py-2">
                                            <span className="text-gray-700 dark:text-gray-100 text-base font-medium">
                                                Missing Keywords
                                            </span>
                                            <span className="font-semibold text-xl text-red-600 dark:text-red-300">
                                                {analysis?.jobFitAnalysis
                                                    ?.missingKeywords?.length ||
                                                    0}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center py-2">
                                            <span className="text-gray-700 dark:text-gray-100 text-base font-medium">
                                                Strengths
                                            </span>
                                            <span className="font-semibold text-xl text-green-600 dark:text-green-300">
                                                {analysis?.jobFitAnalysis
                                                    ?.strengths?.length || 0}
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </div>
                        {/* Summary Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.5 }}
                            className="mb-8"
                        >
                            {" "}
                            <Card className="pt-0 hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-white dark:bg-gray-800">
                                <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-gray-700 dark:to-gray-600 rounded-t-lg pt-2">
                                    <CardTitle className="flex items-center text-gray-800 dark:text-gray-100 py-2">
                                        <Star
                                            className="mr-2 text-yellow-500"
                                            size={20}
                                        />
                                        Executive Summary
                                    </CardTitle>
                                </CardHeader>{" "}
                                <CardContent className="pt-6">
                                    <p className="text-gray-700 dark:text-gray-100 leading-relaxed text-base font-medium">
                                        {analysis?.summary}
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>
                        {/* Job Fit Analysis */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.6 }}
                            className="mb-8"
                        >
                            {" "}
                            <Card className="pt-0 hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-white dark:bg-gray-800">
                                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 rounded-t-lg pt-2">
                                    <CardTitle className="flex items-center text-gray-800 dark:text-gray-200 py-2">
                                        <TrendingUp
                                            className="mr-2 text-blue-500"
                                            size={20}
                                        />
                                        Job Fit Analysis
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {" "}
                                        {/* Strengths */}
                                        <div>
                                            <h4 className="font-semibold text-green-600 dark:text-green-300 flex items-center mb-3 text-base">
                                                <CheckCircle
                                                    size={16}
                                                    className="mr-2"
                                                />
                                                Key Strengths
                                            </h4>
                                            <div className="space-y-2">
                                                {analysis?.jobFitAnalysis?.strengths?.map(
                                                    (strength, index) => (
                                                        <div
                                                            key={index}
                                                            className="flex items-start"
                                                        >
                                                            <CheckCircle
                                                                size={14}
                                                                className="text-green-500 mr-2 mt-0.5 flex-shrink-0"
                                                            />
                                                            <span className="text-sm text-gray-700 dark:text-gray-200 font-medium">
                                                                {strength}
                                                            </span>
                                                        </div>
                                                    )
                                                ) || (
                                                    <p className="text-gray-500 dark:text-gray-400">
                                                        No strengths identified
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        {/* Weaknesses */}
                                        <div>
                                            <h4 className="font-semibold text-red-600 dark:text-red-300 flex items-center mb-3 text-base">
                                                <XCircle
                                                    size={16}
                                                    className="mr-2"
                                                />
                                                Areas for Improvement
                                            </h4>
                                            <div className="space-y-2">
                                                {analysis?.jobFitAnalysis?.weaknesses?.map(
                                                    (weakness, index) => (
                                                        <div
                                                            key={index}
                                                            className="flex items-start"
                                                        >
                                                            <XCircle
                                                                size={14}
                                                                className="text-red-500 mr-2 mt-0.5 flex-shrink-0"
                                                            />
                                                            <span className="text-sm text-gray-700 dark:text-gray-200 font-medium">
                                                                {weakness}
                                                            </span>
                                                        </div>
                                                    )
                                                ) || (
                                                    <p className="text-gray-500 dark:text-gray-400">
                                                        No weaknesses identified
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {analysis?.jobFitAnalysis?.missingKeywords
                                        ?.length > 0 && (
                                        <>
                                            <Separator className="my-6" />{" "}
                                            <div>
                                                <h4 className="font-semibold text-orange-600 dark:text-orange-300 flex items-center mb-3 text-base">
                                                    <AlertCircle
                                                        size={16}
                                                        className="mr-2"
                                                    />
                                                    Missing Keywords
                                                </h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {analysis.jobFitAnalysis.missingKeywords.map(
                                                        (keyword, index) => (
                                                            <Badge
                                                                key={index}
                                                                variant="outline"
                                                                className="text-orange-600 dark:text-orange-500 text-sm border-orange-200"
                                                            >
                                                                {keyword}
                                                            </Badge>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                        {/* Section Analysis */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.7 }}
                            className="mb-8"
                        >
                            {" "}
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
                                Section-by-Section Analysis
                            </h2>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {analysis?.analysis?.map((section, index) => (
                                    <SectionAnalysis
                                        key={index}
                                        section={section}
                                        index={index}
                                    />
                                )) || (
                                    <p className="text-gray-500 dark:text-gray-400 col-span-2 text-base">
                                        No section analysis available
                                    </p>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}

export default ResumeAnalysisDetailPage;
