'use client';

import { useEffect, useState } from 'react';
import { Bot, Brain, FileText, Users } from 'lucide-react';
import { getCurrentUser } from '@/lib/actions/auth.action';
import Link from 'next/link';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  
  useEffect(() => {
    const fetchUser = async () => {
      const userData = await getCurrentUser();
      setUser(userData);
    };
    
    fetchUser();
  }, []);
  
  const isModerator = user?.role === 'interview-moderator';
  
  const features = [
    {
      icon: <Bot className="h-8 w-8 text-primary-100" />,
      title: "AI Mock Interviews",
      description: "Practice with our AI interviewer that adapts to your responses and provides realistic interview scenarios across different tech roles.",
      href: "/interview-home"
    },
    {
      icon: <Brain className="h-8 w-8 text-primary-100" />,
      title: "Proctored Skill Assessments",
      description: "Verify your skills with tamper-proof assessments using eye-tracking and anti-cheating technology to ensure integrity.",
      href: "/skill-assessment"
    },
    {
      icon: <FileText className="h-8 w-8 text-primary-100" />,
      title: "Resume Builder",
      description: "Create modern, ATS-friendly resumes with our AI-powered builder that optimizes your resume for both humans and automated systems.",
      href: "/resume-builder"
    },
    {
      icon: <Users className="h-8 w-8 text-primary-100" />,
      title: "Interview Community",
      description: "Connect with professionals who've interviewed at your target companies and learn from thousands of shared interview experiences.",
      href: "/career"
    }
  ];
  
  if (isModerator) {
    features.push({
      icon: <Users className="h-8 w-8 text-primary-100" />,
      title: "Moderator Dashboard",
      description: "Manage company interviews and moderate content for your organization.",
      href: "/moderator-dashboard"
    });
  }

  return (
    <div className="py-8 px-8">
      <h1 className="text-3xl font-bold mb-8">Welcome to Your Dashboard{user ? `, ${user.name}` : ''}!</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <Link key={index} href={feature.href}>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition duration-300 hover:shadow-xl hover:shadow-primary-100/5 group h-full">
              <div className="mb-4 bg-gray-800 rounded-xl h-16 w-16 flex items-center justify-center group-hover:bg-gray-800/80">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}