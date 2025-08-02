import { Suspense } from "react";
import { Building, MessageSquare, TrendingUp, Search, Zap, Shield, Users, Hash, Plus } from "lucide-react";
import { getCareerExperiences, CareerExperience } from "@/lib/actions/career-experience.action";
import ExperienceCard from "@/components/career/ExperienceCard";
import ClientExperienceForm from "@/components/career/ClientExperienceForm";
import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "Interview Experiences | ChakriGO",
  description: "Share and read anonymous interview experiences from different IT companies",
};

async function CareerContent() {
  const result = await getCareerExperiences();
  const experiences: CareerExperience[] = result.success && result.data ? result.data : [];
  
  // Get unique company names for filtering
  const companies = [...new Set(experiences.map(exp => exp.companyName))];

  return (
    <>
      {experiences.length === 0 ? (
        <div className="bg-gray-900 rounded-xl p-8 border border-gray-800 shadow-lg text-center">
          <Building className="h-12 w-12 mx-auto text-gray-600 mb-4" />
          <h3 className="text-xl font-bold text-white mb-3">No interview experiences yet</h3>
          <p className="text-gray-400 mb-6">
            Be the first to share your interview experience and help others prepare.
          </p>
        </div>
      ) : (
        <div className="space-y-4">          
          {/* Experience Timeline */}
          {experiences.map((experience) => (
            <ExperienceCard key={experience.id} experience={experience} />
          ))}
        </div>
      )}
    </>
  );
}

// Simplified component for posting a new experience
function PostPrompt() {
  return (
    <Link
      href="#post-form"
      className="flex items-center gap-3 p-4 bg-gray-900 border border-gray-800 rounded-xl mb-4 hover:bg-gray-900/80 transition-colors"
    >
      <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
        A
      </div>
      <div className="flex-1 text-gray-500">Share your interview experience...</div>
      <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-1.5 rounded-full transition-colors">
        Post
      </button>
    </Link>
  );
}

// Wrapper to handle async data fetching for trending companies
async function TrendingCompaniesWrapper() {
  const result = await getCareerExperiences();
  const experiences: CareerExperience[] = result.success && result.data ? result.data : [];
  
  // Count experiences per company
  const companyCountMap = new Map<string, number>();
  experiences.forEach(exp => {
    const count = companyCountMap.get(exp.companyName) || 0;
    companyCountMap.set(exp.companyName, count + 1);
  });
  
  // Convert to array of objects with company name and count
  const companyStats = Array.from(companyCountMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count); // Sort by count in descending order
  
  return <TrendingCompanies companyStats={companyStats} />;
}

// Companies & Topics component (similar to Twitter/X trends)
function TrendingCompanies({ companyStats }: { companyStats: Array<{ name: string, count: number }> }) {
  // Take up to 5 companies, or fewer if not enough
  const displayCompanies = companyStats.slice(0, Math.min(5, companyStats.length));
  
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-gray-800">
        <h3 className="text-lg font-bold text-white">Trending Companies</h3>
      </div>
      
      <div>
        {displayCompanies.length > 0 ? (
          displayCompanies.map((company) => (
            <Link 
              key={company.name} 
              href={`/career/company/${encodeURIComponent(company.name)}`}
              className="flex justify-between items-center p-3 hover:bg-gray-800/50 transition-colors border-b border-gray-800/50 last:border-0"
            >
              <div>
                <p className="font-medium text-white">{company.name}</p>
                <p className="text-xs text-gray-500">{company.count} {company.count === 1 ? 'Experience' : 'Experiences'}</p>
              </div>
              <Building className="h-5 w-5 text-gray-500" />
            </Link>
          ))
        ) : (
          <div className="p-4 text-gray-500 text-sm">No trending companies yet</div>
        )}
        
        <Link 
          href="#" 
          className="block p-3 text-blue-400 hover:bg-gray-800/50 transition-colors text-sm"
        >
          Show more
        </Link>
      </div>
    </div>
  );
}

function TopicsList() {
  const topics = [
    { name: "Technical Interviews", icon: <Zap className="h-4 w-4" /> },
    { name: "Behavioral Questions", icon: <Users className="h-4 w-4" /> },
    { name: "System Design", icon: <Building className="h-4 w-4" /> },
    { name: "Coding Challenges", icon: <Hash className="h-4 w-4" /> },
    { name: "Security Interviews", icon: <Shield className="h-4 w-4" /> },
  ];
  
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-gray-800">
        <h3 className="text-lg font-bold text-white">Popular Topics</h3>
      </div>
      
      <div>
        {topics.map((topic) => (
          <Link 
            key={topic.name} 
            href="#"
            className="flex items-center gap-3 p-3 hover:bg-gray-800/50 transition-colors border-b border-gray-800/50 last:border-0"
          >
            <div className="bg-blue-500/10 p-2 rounded-full text-blue-400">
              {topic.icon}
            </div>
            <span className="text-white">{topic.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function CareerPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Timeline */}
        <div className="col-span-1 lg:col-span-8">
          {/* Modern Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-0">
              Interview Experiences
            </h1>
            
            
          </div>
          
          {/* Mobile Navigation */}
          <div className="mb-6 lg:hidden">
            <div className="flex gap-4 bg-gray-900 border border-gray-800 rounded-xl overflow-hidden p-1">
              <Link 
                href="/career" 
                className="flex-1 text-center py-2 rounded-lg bg-gray-800 text-white font-medium"
              >
                For you
              </Link>
              <Link 
                href="#" 
                className="flex-1 text-center py-2 rounded-lg text-gray-400 hover:text-gray-300"
              >
                Trending
              </Link>
            </div>
          </div>
          
          {/* Post Form - Mobile Only */}
          <div className="mb-6 block lg:hidden">
            <PostPrompt />
          </div>
          
          {/* Post Form */}
          <div id="post-form" className="mb-6 border border-gray-800 rounded-xl overflow-hidden bg-gray-900 hidden lg:block">
            <div className="p-4 border-b border-gray-800">
              <h2 className="text-lg font-bold text-white">Share Your Experience</h2>
            </div>
            <div className="p-4">
              <ClientExperienceForm />
            </div>
          </div>
          
          {/* Timeline */}
          <div className="space-y-6">
            <Suspense fallback={
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            }>
              <CareerContent />
            </Suspense>
          </div>
        </div>
        
        {/* Right Sidebar */}
        <div className="col-span-1 lg:col-span-4 space-y-6">
          <div className="lg:sticky lg:top-6">
            <Suspense fallback={
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 animate-pulse">
                <div className="h-6 bg-gray-800 rounded-md w-1/2 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-10 bg-gray-800 rounded-md w-full"></div>
                  <div className="h-10 bg-gray-800 rounded-md w-full"></div>
                  <div className="h-10 bg-gray-800 rounded-md w-full"></div>
                </div>
              </div>
            }>
              <TrendingCompaniesWrapper />
            </Suspense>
            
            <div className="mt-6">
              <TopicsList />
            </div>
            
            {/* Why Share Box */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mt-6">
              <h3 className="text-lg font-bold text-white mb-4">Why Share Anonymously?</h3>
              <ul className="space-y-3 text-sm text-gray-300">
                <li className="flex items-start gap-3">
                  <span className="bg-blue-500/10 p-1.5 rounded-full text-blue-400 mt-0.5 flex-shrink-0">
                    <Shield className="h-4 w-4" />
                  </span>
                  <span>Your identity remains private & secure</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-blue-500/10 p-1.5 rounded-full text-blue-400 mt-0.5 flex-shrink-0">
                    <Users className="h-4 w-4" />
                  </span>
                  <span>Help others prepare for interviews with real experiences</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-blue-500/10 p-1.5 rounded-full text-blue-400 mt-0.5 flex-shrink-0">
                    <TrendingUp className="h-4 w-4" />
                  </span>
                  <span>Improve transparency in tech hiring practices</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
