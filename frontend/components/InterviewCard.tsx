import dayjs from "dayjs";
import Link from "next/link";
import Image from "next/image";

import { Button } from "./ui/button";
import DisplayTechIcons from "./DisplayTechIcons";

import { cn } from "@/lib/utils";
import { getFeedbackByInterviewId } from "@/lib/actions/general.action";

const InterviewCard = async ({id, userId, role, type, techstack, createdAt, companyName, isCompanyInterview, isModeratorInterview, company, level}: InterviewCardProps) => {
    const feedback = null as Feedback | null

    const normalizedType = /mix/gi.test(type) ? "Mixed" : type;

    // Color-coded category tabs with 70% opacity
    const categoryTabStyle =
        {
            Behavioral: "bg-[#10B981]/70",
            Mixed: "bg-[#8B5CF6]/70",
            Technical: "bg-[#3B82F6]/70",
        }[normalizedType] || "bg-[#8B5CF6]/70";

    const formattedDate = dayjs(
        feedback?.createdAt || createdAt || Date.now()
    ).format("MMM D, YYYY");

    // Display company name for both company interviews and moderator interviews
    const displayCompany = companyName || (isModeratorInterview && company) || "";

    return (
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg overflow-hidden shadow-[0_6px_16px_rgba(0,0,0,0.4)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.5)] transition-all duration-200 ease-in-out hover:scale-[1.02] w-[320px] max-sm:w-full min-h-[280px] flex flex-col relative">
            {/* Color-coded category tab - top-left positioning for visual rhythm */}
            <div
                className={cn(
                    "absolute top-0 left-0 w-20 h-8 rounded-br-lg flex items-center justify-center shadow-lg z-10",
                    categoryTabStyle
                )}
            >
                <p className="font-bold text-[10px] text-white tracking-wider uppercase">{normalizedType}</p>
            </div>

            <div className="p-3 flex flex-col flex-1">
                {/* Main content area with consistent spacing */}
                <div className="flex-1 flex flex-col">
                    {/* Interview Role - Enhanced typography hierarchy */}
                    <div className="mt-6 mb-2">
                        <h3 className="capitalize text-white text-xl font-bold tracking-tight leading-tight">
                            {role} Interview
                        </h3>
                    </div>

                    {/* Company Name - Show for both company and moderator interviews */}
                    {(isCompanyInterview || isModeratorInterview) && displayCompany && (
                        <div className="mt-1 mb-2 flex items-center">
                            <span className="text-[#A0A0A0] font-medium text-xs">
                                {displayCompany} • {level || 'Any Level'}
                            </span>
                        </div>
                    )}

                    {/* Date & Score - Improved readability */}
                    <div className="flex flex-row gap-4 mt-2 text-[#B0B0B0]">
                        <div className="flex flex-row gap-1.5 items-center">
                            <Image
                                src="/calendar.svg"
                                width={16}
                                height={16}
                                alt="calendar"
                                className="opacity-70"
                            />
                            <p className="text-xs font-normal">{formattedDate}</p>
                        </div>

                        <div className="flex flex-row gap-1.5 items-center">
                            <Image src="/star.svg" width={16} height={16} alt="star" className="opacity-70" />
                            <p className="text-xs font-semibold text-[#3B82F6]">{feedback?.totalScore || "---"}/100</p>
                        </div>
                    </div>

                    {/* Feedback or Placeholder Text - WCAG compliant contrast */}
                    <p className="line-clamp-2 mt-3 text-[#A0A0A0] text-xs font-normal leading-relaxed">
                        {feedback?.finalAssessment ||
                            ((isCompanyInterview || isModeratorInterview) && displayCompany
                                ? `Practice interview for ${displayCompany}. Take it now to improve your chances!`
                                : "You haven't taken this interview yet. Take it now to improve your skills.")}
                    </p>
                </div>

                {/* Footer section - Consistent alignment */}
                <div className="flex flex-row justify-between items-center mt-auto pt-3 border-t border-[#2A2A2A]">
                   

                    <button className="bg-[#2563EB] text-white font-semibold text-xs px-3 py-2 rounded-lg transition-all duration-200 ease-in-out hover:scale-[1.05] hover:shadow-[0_8px_20px_rgba(37,99,235,0.4)] active:scale-[0.98] flex-shrink-0">
                        <Link
                            href={
                                feedback
                                    ? `/interview-main/${id}/feedback`
                                    : `interview-main/${id}`
                            }
                        >
                            {feedback ? "Check Feedback" : "View Interview"}
                        </Link>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InterviewCard;