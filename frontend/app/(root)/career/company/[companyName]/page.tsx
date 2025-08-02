import CompanyExperiences from "@/components/career/CompanyExperiences";
import { ArrowLeft, Building } from "lucide-react";
import Link from "next/link";

interface CompanyPageProps {
  params: {
    companyName: string;
  };
}

export async function generateMetadata({ params }: CompanyPageProps) {
  const { companyName } = params;
  const decodedCompanyName = decodeURIComponent(companyName);
  
  return {
    title: `${decodedCompanyName} Interview Experiences | ChakriGO`,
    description: `Read anonymous interview experiences from ${decodedCompanyName}. Learn about the interview process, questions, and preparation tips.`
  };
}

export default function CompanyPage({ params }: CompanyPageProps) {
  const { companyName } = params;
  const decodedCompanyName = decodeURIComponent(companyName);
  
  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-2">
          <Link 
            href="/career" 
            className="flex items-center gap-2 text-blue-500 hover:text-blue-400 bg-blue-500/10 py-2 px-4 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to all experiences</span>
          </Link>
        </div>
        
        <div className="flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-lg py-2 px-4">
          <Building className="h-5 w-5 text-blue-500" />
          <span className="text-sm text-gray-400">Company Profile</span>
        </div>
      </div>
      
      <CompanyExperiences companyName={decodedCompanyName} />
    </div>
  );
} 