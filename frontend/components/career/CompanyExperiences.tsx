"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Building, Search, ArrowUp, ArrowDown, Loader2 } from "lucide-react";
import { CareerExperience, getCareerExperiencesByCompany } from "@/lib/actions/career-experience.action";
import ExperienceCard from "./ExperienceCard";
import Link from "next/link";

interface CompanyExperiencesProps {
  companyName: string;
}

export default function CompanyExperiences({ companyName }: CompanyExperiencesProps) {
  const [experiences, setExperiences] = useState<CareerExperience[] | undefined>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExperiences = async () => {
      try {
        setLoading(true);
        const result = await getCareerExperiencesByCompany(companyName);
        
        if (result.success) {
          setExperiences(result?.data);
        } else {
          setError(result.message || "Failed to load experiences");
        }
      } catch (error) {
        console.error("Error fetching company experiences:", error);
        setError("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchExperiences();
  }, [companyName]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-4" />
        <p className="text-gray-300">Loading experiences for {companyName}...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
        <div className="bg-red-500/10 text-red-400 p-4 rounded-lg mb-4">
          <p>{error}</p>
        </div>
        <Link href="/career" className="text-blue-400 hover:text-blue-300">
          Go back to all experiences
        </Link>
      </div>
    );
  }

  if (!experiences || experiences.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
        <Building className="h-12 w-12 text-gray-500 mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">No experiences found</h3>
        <p className="text-gray-400 mb-4">Be the first to share your interview experience at {companyName}</p>
        <Link 
          href="/career"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
        >
          Back to all experiences
        </Link>
      </div>
    );
  }

  const positiveCount = experiences.filter(exp => exp.experience === 'positive').length;
  const neutralCount = experiences.filter(exp => exp.experience === 'neutral').length;
  const negativeCount = experiences.filter(exp => exp.experience === 'negative').length;
  
  const totalCount = experiences.length;
  const positivePercentage = Math.round((positiveCount / totalCount) * 100);
  const neutralPercentage = Math.round((neutralCount / totalCount) * 100);
  const negativePercentage = Math.round((negativeCount / totalCount) * 100);

  return (
    <div className="space-y-6">
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
        <div className="flex items-center mb-4">
          <Building className="h-6 w-6 text-blue-400 mr-2" />
          <h2 className="text-2xl font-bold text-white">{companyName}</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-300">Positive</span>
              <span className="text-green-400 font-medium">{positiveCount}</span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 rounded-full" 
                style={{ width: `${positivePercentage}%` }}
              ></div>
            </div>
          </div>
          
          <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-300">Neutral</span>
              <span className="text-yellow-400 font-medium">{neutralCount}</span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-yellow-500 rounded-full" 
                style={{ width: `${neutralPercentage}%` }}
              ></div>
            </div>
          </div>
          
          <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-300">Negative</span>
              <span className="text-red-400 font-medium">{negativeCount}</span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-red-500 rounded-full" 
                style={{ width: `${negativePercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <p className="text-gray-400">
            Showing {experiences.length} interview {experiences.length === 1 ? 'experience' : 'experiences'}
          </p>
          <Link href="/career" className="text-blue-400 hover:text-blue-300">
            View all companies
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {experiences.map((experience) => (
          <motion.div
            key={experience.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ExperienceCard experience={experience} />
          </motion.div>
        ))}
      </div>
    </div>
  );
} 