"use client";

import { format } from "date-fns";
import Link from "next/link";
import { Building, CalendarDays, Award, Users, MessageSquare, Share2, ThumbsUp, MoreHorizontal, Eye, Heart } from "lucide-react";
import { CareerExperience, hasUserLikedV2, toggleLikeV2 } from "@/lib/actions/career-experience.action";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Server action to get the current user
async function fetchCurrentUser() {
  const { getCurrentUser } = await import("@/lib/actions/auth.action");
  return getCurrentUser();
}

interface ExperienceCardProps {
  experience: CareerExperience;
}

export default function ExperienceCard({ experience }: ExperienceCardProps) {
  const router = useRouter();
  const [liked, setLiked] = useState(false);
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [likeCount, setLikeCount] = useState(experience.likesCount || 0);
  const [showFullDetails, setShowFullDetails] = useState(false);
  
  // Truncate details to 4-5 lines (approximately 280 characters)
  const maxLength = 280;
  const shouldTruncate = experience.details?.length > maxLength;
  const displayDetails = showFullDetails || !shouldTruncate 
    ? experience.details 
    : experience.details?.substring(0, maxLength) + "...";
  
  const formattedDate = experience.createdAt 
    ? format(new Date(experience.createdAt), "MMM d, yyyy")
    : "Recent";
  
  const experienceColors = {
    positive: "text-green-400",
    neutral: "text-yellow-400", 
    negative: "text-red-400"
  };

  const badgeColors = {
    positive: "bg-green-500/10 border-green-500/20 text-green-400",
    neutral: "bg-yellow-500/10 border-yellow-500/20 text-yellow-400",
    negative: "bg-red-500/10 border-red-500/20 text-red-400"
  };
  
  useEffect(() => {
    const loadUserAndInteractions = async () => {
      try {
        const currentUser = await fetchCurrentUser();
        setUser(currentUser);
        
        if (currentUser) {
          const likeResult = await hasUserLikedV2({ 
            experienceId: experience.id, 
            userId: currentUser.id 
          });
          if (likeResult.success) {
            setLiked(likeResult.liked);
          }
        }
      } catch (error) {
        console.error("Error loading user interactions:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUserAndInteractions();
  }, [experience.id]);
  
  const handleToggleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user) {
      toast.error("Please sign in to like this post");
      return;
    }
    
    try {
      setLiked(!liked);
      setLikeCount(prevCount => liked ? prevCount - 1 : prevCount + 1);
      
      const result = await toggleLikeV2({ 
        experienceId: experience.id, 
        userId: user.id 
      });
      
      if (!result.success) {
        setLiked(liked);
        setLikeCount(likeCount);
        toast.error("Failed to update like status");
      }
    } catch (error) {
      setLiked(liked);
      setLikeCount(likeCount);
      console.error("Error toggling like:", error);
      toast.error("An error occurred");
    }
  };
  
  return (
    <article className="bg-gray-900/70 border border-gray-800/60 rounded-2xl overflow-hidden transition-all duration-300 hover:bg-gray-900/90 hover:border-gray-700/80 hover:shadow-xl hover:shadow-black/20 backdrop-blur-sm">
      <div className="p-6">
        {/* Header with Company Info */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-bold text-lg shadow-lg">
              {experience.companyName.charAt(0)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3 mb-1">
                <h3 className="text-lg font-bold text-white hover:text-blue-400 transition-colors">
                  {experience.companyName}
                </h3>
                <span className={cn(
                  "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border",
                  badgeColors[experience.experience]
                )}>
                  {experience.experience.charAt(0).toUpperCase() + experience.experience.slice(1)}
                </span>
              </div>
              
              <div className="flex items-center space-x-3 text-sm text-gray-400">
                <div className="flex items-center space-x-1">
                  <Award className="h-4 w-4" />
                  <span className="font-medium text-gray-300">{experience.position}</span>
                </div>
                <span>•</span>
                <div className="flex items-center space-x-1">
                  <CalendarDays className="h-4 w-4" />
                  <span>{formattedDate}</span>
                </div>
              </div>
            </div>
          </div>
          
          <button title="More" className="text-gray-500 hover:text-gray-300 transition-colors p-1">
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>
        
        {/* Interview Source Tag */}
        <div className="flex items-center mb-4">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-gray-800/60 border border-gray-700/50 text-gray-300 text-xs">
            <Users className="h-3 w-3 mr-1.5" />
            <span>Via {experience.source}</span>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="mb-4">
          <p className="text-gray-300 text-[15px] leading-relaxed whitespace-pre-line">
            {displayDetails}
          </p>
          
          {shouldTruncate && !showFullDetails && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShowFullDetails(true);
              }}
              className="text-blue-400 hover:text-blue-300 text-sm font-medium mt-2 transition-colors"
            >
              Read more
            </button>
          )}
          
          {shouldTruncate && showFullDetails && (
            <div className="mt-3 pt-3 border-t border-gray-800/50">
              <Link 
                href={`/career/${experience.id}`}
                className="inline-flex items-center text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
              >
                <Eye className="h-4 w-4 mr-1" />
                View full experience
              </Link>
            </div>
          )}
        </div>
        
        {/* Interview Questions Preview */}
        {experience.questions && experience.questions.length > 0 && (
          <div className="mb-4 p-4 bg-gray-800/40 border border-gray-700/40 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-gray-300">Interview Questions</h4>
              <span className="text-xs text-gray-500 bg-gray-700/50 px-2 py-1 rounded-full">
                {experience.questions.length} question{experience.questions.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="space-y-2">
              {experience.questions.slice(0, 2).map((question, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <span className="text-blue-400 text-xs font-bold mt-0.5 flex-shrink-0">Q{index + 1}:</span>
                  <span className="text-gray-400 text-sm leading-relaxed">{question}</span>
                </div>
              ))}
              {experience.questions.length > 2 && (
                <Link 
                  href={`/career/${experience.id}`}
                  className="text-blue-400 hover:text-blue-300 text-xs font-medium inline-block mt-1"
                >
                  +{experience.questions.length - 2} more questions
                </Link>
              )}
            </div>
          </div>
        )}
        
        {/* Action Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-800/50">
          <div className="flex items-center space-x-6">
            <button 
              className={cn(
                "flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 hover:scale-105",
                liked 
                  ? "text-blue-400 bg-blue-500/10 border border-blue-500/20" 
                  : "text-gray-400 hover:text-blue-400 hover:bg-blue-500/5"
              )}
              onClick={handleToggleLike}
              disabled={isLoading}
            >
              <Heart className={cn("h-4 w-4", liked && "fill-red-400")} />
              <span className="text-sm font-medium">{likeCount}</span>
            </button>
            
            <Link 
              href={`/career/${experience.id}`}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-400 hover:text-blue-400 hover:bg-blue-500/5 transition-all duration-200 hover:scale-105"
            >
              
            </Link>
          </div>
          
          <button 
            className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-400 hover:text-blue-400 hover:bg-blue-500/5 transition-all duration-200 hover:scale-105"
            onClick={(e) => {
              e.stopPropagation();
              navigator.share?.({
                title: `${experience.companyName} Interview Experience`,
                text: experience.details?.substring(0, 100) + "...",
                url: window.location.origin + `/career/${experience.id}`
              }).catch(() => {
                navigator.clipboard.writeText(window.location.origin + `/career/${experience.id}`);
                toast.success("Link copied to clipboard!");
              });
            }}
          >
            <Share2 className="h-4 w-4" />
            <span className="text-sm font-medium">Share</span>
          </button>
        </div>
      </div>
    </article>
  );
}