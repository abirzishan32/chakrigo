import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Stars, Zap, Award, FileText, Users, Brain, Bot } from 'lucide-react';
import { getCurrentUser } from '@/lib/actions/auth.action';
import { Button } from '@/components/ui/button';

export default async function HomePage() {
  const user = await getCurrentUser();
  const isAuthenticated = !!user;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-screen flex items-center">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-950 to-black z-0"></div>
        
        {/* Animated glow effect */}
        <div className="absolute -top-40 -right-40 h-96 w-96 bg-primary-100 opacity-20 blur-[150px] rounded-full z-0"></div>
        <div className="absolute top-1/2 left-1/3 h-80 w-80 bg-blue-700 opacity-20 blur-[150px] rounded-full z-0"></div>
        
        <div className="w-full px-6 max-lg:py-12 relative z-10 max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12 max-w-[2000px] mx-auto">
            <div className="lg:w-1/2 space-y-8">
              <div className="inline-block bg-gradient-to-r from-primary-100 to-blue-600 bg-clip-text">
                <p className="uppercase tracking-wider text-transparent font-semibold">Next-level interview preparation</p>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                <span className="block">Ace Your Interviews with</span>
                <span className="bg-gradient-to-r from-primary-100 to-blue-600 bg-clip-text text-transparent">
                  ChakriGO
                </span>
              </h1>
              
              <p className="text-lg text-gray-400 leading-relaxed max-w-lg">
                Prepare for tech interviews with realistic AI-driven mock interviews, personalized feedback, data-driven skill assessments and ATS-optimized resumes.
              </p>
              
              <div className="flex flex-wrap gap-4 pt-4">
                {isAuthenticated ? (
                  <Link href="/dashboard">
                    <Button size="lg" className="bg-primary-100 hover:bg-primary-200 text-black font-medium px-8 text-base">
                      Go to Dashboard
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                ) : (
                  <Link href="/sign-up">
                    <Button size="lg" className="bg-primary-100 hover:bg-primary-200 text-black font-medium px-8 text-base">
                      Get Started
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>
            
            <div className="lg:w-1/2 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-100/20 to-blue-500/20 blur-2xl rounded-full"></div>
              <div className="relative bg-gradient-to-br from-gray-900 to-black border border-gray-800 shadow-2xl rounded-xl overflow-hidden">
                <Image 
                  src="/home-interview.jpg" 
                  alt="AI Interview Simulation" 
                  width={600} 
                  height={400}
                  className="w-full rounded-lg shadow-lg object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 bg-gray-950 relative min-h-screen flex items-center">
        <div className="w-full px-6 md:px-12 relative z-10">
          <div className="text-center mb-16 max-w-[2000px] mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Your Complete Interview Preparation Platform</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Our comprehensive platform offers everything you need to prepare for your next job interview and advance your career
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <Bot className="h-8 w-8 text-primary-100" />,
                title: "AI Mock Interviews",
                description: "Practice with our AI interviewer that adapts to your responses and provides realistic interview scenarios across different tech roles."
              },
              {
                icon: <Brain className="h-8 w-8 text-primary-100" />,
                title: "Proctored Skill Assessments",
                description: "Verify your skills with tamper-proof assessments using eye-tracking and anti-cheating technology to ensure integrity."
              },
              {
                icon: <FileText className="h-8 w-8 text-primary-100" />,
                title: "Resume Builder",
                description: "Create modern, ATS-friendly resumes with our AI-powered builder that optimizes your resume for both humans and automated systems."
              },
              {
                icon: <Users className="h-8 w-8 text-primary-100" />,
                title: "Interview Community",
                description: "Connect with professionals who've interviewed at your target companies and learn from thousands of shared interview experiences."
              }
            ].map((feature, index) => (
              <div key={index} className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition duration-300 hover:shadow-xl hover:shadow-primary-100/5 group">
                <div className="mb-4 bg-gray-800 rounded-xl h-16 w-16 flex items-center justify-center group-hover:bg-gray-800/80">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Interview Experience Section */}
      <section className="py-20 bg-black relative overflow-hidden min-h-screen flex items-center">
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary-100/10 blur-[100px] rounded-full"></div>
        <div className="w-full px-6 md:px-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-[2000px] mx-auto">
            <div className="order-2 lg:order-1">
              <div className="relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-100 to-blue-600 rounded-lg blur opacity-30"></div>
                <div className="relative bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
                  <Image 
                    src="/ai-interview-demo.jpg" 
                    alt="AI Interview Demo" 
                    width={600} 
                    height={400}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
            
            <div className="order-1 lg:order-2">
              <div className="inline-block bg-gradient-to-r from-primary-100 to-blue-600 bg-clip-text mb-4">
                <p className="uppercase tracking-wider text-transparent font-semibold">AI-Powered Mock Interviews</p>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Practice Like It's the Real Thing</h2>
              
              <div className="space-y-6">
                {[
                  {
                    icon: <Zap className="h-5 w-5 text-primary-100" />,
                    title: "Dynamic Questioning",
                    description: "Our AI interviewer adapts questions based on your responses, creating a realistic interview flow."
                  },
                  {
                    icon: <Stars className="h-5 w-5 text-primary-100" />,
                    title: "Instant Feedback",
                    description: "Receive detailed feedback on your communication skills, technical knowledge, and problem-solving approach."
                  },
                  {
                    icon: <Award className="h-5 w-5 text-primary-100" />,
                    title: "Performance Analytics",
                    description: "Track your progress over time with comprehensive analytics on your interview performance."
                  }
                ].map((feature, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="mt-1 bg-gray-900 rounded-lg h-10 w-10 flex-shrink-0 flex items-center justify-center border border-gray-800">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-1">{feature.title}</h3>
                      <p className="text-gray-400">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-8">
                <Link href="/interview-main">
                  <Button className="bg-primary-100 hover:bg-primary-200 text-black font-medium">
                    Try Mock Interview
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Skill Assessment Section */}
      <section className="py-20 bg-gray-950 relative min-h-screen flex items-center">
        <div className="w-full px-6 md:px-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-[2000px] mx-auto">
            <div>
              <div className="inline-block bg-gradient-to-r from-primary-100 to-blue-600 bg-clip-text mb-4">
                <p className="uppercase tracking-wider text-transparent font-semibold">Proctored Skill Assessments</p>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Verify Your Skills With Confidence</h2>
              
              <p className="text-gray-400 mb-6">
                Take verified skill assessments with our advanced proctoring system that ensures integrity. Our platform monitors eye movements, prevents tab switching, and provides real-time analysis of your technical abilities.
              </p>
              
              <div className="space-y-4 mb-8">
                {[
                  "Advanced eye-tracking to verify focus and prevent cheating",
                  "Tab-switching detection to maintain assessment integrity",
                  "Camera access for identity verification and monitoring",
                  "Diverse assessment topics from algorithms to system design",
                  "Industry-standard benchmarking of your skills"
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="mt-1 text-primary-100">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-gray-300">{item}</p>
                  </div>
                ))}
              </div>
              
              <Link href="/skill-assessment">
                <Button className="bg-primary-100 hover:bg-primary-200 text-black font-medium">
                  Take Verified Assessment
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
            
            <div>
              <div className="relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-100 to-blue-600 rounded-lg blur opacity-30"></div>
                <div className="relative bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-lg shadow-2xl overflow-hidden">
                  <Image 
                    src="/skill-assessment.png"
                    alt="Skill Assessment Platform"
                    width={600}
                    height={400}
                    className="w-full rounded-lg shadow-lg object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Resume Builder Section */}
      <section className="py-20 bg-black relative overflow-hidden min-h-screen flex items-center">
        <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-blue-600/10 blur-[100px] rounded-full"></div>
        <div className="w-full px-6 md:px-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-[2000px] mx-auto">
            <div className="order-2 lg:order-1">
              <div className="relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-100 to-blue-600 rounded-lg blur opacity-30"></div>
                <div className="relative bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-lg shadow-2xl overflow-hidden">
                  <Image 
                    src="/resume.png"
                    alt="Resume Builder Preview"
                    width={600}
                    height={400}
                    className="w-full rounded-lg shadow-lg object-cover"
                  />
                </div>
              </div>
            </div>
            
            <div className="order-1 lg:order-2">
              <div className="inline-block bg-gradient-to-r from-primary-100 to-blue-600 bg-clip-text mb-4">
                <p className="uppercase tracking-wider text-transparent font-semibold">AI-Powered Resume Builder</p>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Create ATS-Optimized Resumes</h2>
              
              <p className="text-gray-400 mb-6">
                Our AI-powered resume builder helps you create modern, ATS-friendly resumes that stand out to both hiring managers and automated screening systems.
              </p>
              
              <div className="space-y-6 mb-8">
                {[
                  {
                    title: "ATS Optimization",
                    description: "Ensure your resume passes through Applicant Tracking Systems with our keyword optimization technology."
                  },
                  {
                    title: "Modern Templates",
                    description: "Choose from dozens of professionally designed templates tailored for different industries and roles."
                  },
                  {
                    title: "Content Suggestions",
                    description: "Get AI-powered suggestions for skills, achievements, and bullet points based on your target role."
                  },
                  {
                    title: "Real-time Feedback",
                    description: "Receive instant feedback on your resume's effectiveness and suggestions for improvement."
                  }
                ].map((feature, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="mt-1 bg-gray-900 rounded-lg h-10 w-10 flex-shrink-0 flex items-center justify-center border border-gray-800">
                      <svg className="h-5 w-5 text-primary-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-1">{feature.title}</h3>
                      <p className="text-gray-400">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <Link href="/resume-builder">
                <Button className="bg-primary-100 hover:bg-primary-200 text-black font-medium">
                  Build Your Resume
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Career Interview Experiences Section */}
      <section className="py-20 bg-gray-950 relative overflow-hidden min-h-screen flex items-center">
        <div className="absolute top-40 left-20 w-72 h-72 bg-blue-600/20 blur-[120px] rounded-full"></div>
        <div className="w-full px-6 md:px-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-[2000px] mx-auto">
            <div>
              <div className="inline-block bg-gradient-to-r from-primary-100 to-blue-600 bg-clip-text mb-4">
                <p className="uppercase tracking-wider text-transparent font-semibold">Career Insider</p>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Authentic Interview Experiences</h2>
              
              <p className="text-gray-400 mb-6">
                Access a growing database of real interview experiences shared by professionals across hundreds of companies. Get insider knowledge about interview processes, question patterns, and company cultures.
              </p>
              
              <div className="space-y-6 mb-8">
                {[
                  {
                    title: "Company-Specific Insights",
                    description: "Browse interview experiences from top tech companies like Google, Amazon, Microsoft, and startups."
                  },
                  {
                    title: "Filter by Role and Experience",
                    description: "Find interview reports specific to your target position and seniority level."
                  },
                  {
                    title: "Contribute Your Experience",
                    description: "Share your own interview journey anonymously to help others prepare effectively."
                  },
                  {
                    title: "Trending Companies and Topics",
                    description: "Discover which companies are actively hiring and what skills are in demand."
                  }
                ].map((feature, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="mt-1 bg-gray-900 rounded-lg h-10 w-10 flex-shrink-0 flex items-center justify-center border border-gray-800">
                      <svg className="h-5 w-5 text-primary-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-1">{feature.title}</h3>
                      <p className="text-gray-400">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <Link href="/career">
                <Button className="bg-primary-100 hover:bg-primary-200 text-black font-medium">
                  Explore Interview Experiences
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
            
            <div>
              <div className="relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-100 to-blue-600 rounded-lg blur opacity-30"></div>
                <div className="relative bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-lg shadow-2xl overflow-hidden">
                  <Image 
                    src="/career.png"
                    alt="Career Interview Experiences"
                    width={600}
                    height={400}
                    className="w-full rounded-lg shadow-lg object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

     

      {/* Enterprise Partners Section */}
      <section className="py-16 bg-black relative overflow-hidden min-h-screen flex items-center">
        <div className="absolute top-0 right-0 w-1/4 h-1/4 bg-primary-100/5 blur-[100px] rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-blue-600/5 blur-[100px] rounded-full"></div>
        
        <div className="w-full px-6 md:px-12 relative z-10">
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-gray-900/90 to-gray-950/90 backdrop-blur-lg border border-gray-800/50 rounded-2xl p-8 shadow-xl">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-full md:w-3/4">
                <div className="inline-block bg-gradient-to-r from-primary-100 to-blue-600 bg-clip-text mb-3">
                  <p className="uppercase tracking-wider text-transparent font-semibold">Enterprise Partnership</p>
                </div>
                
                <h3 className="text-2xl md:text-3xl font-bold mb-4">
                  Want to host your company's interviews on ChakriGO?
                </h3>
                
                <p className="text-gray-400 mb-5">
                  Leverage our neural-powered interview platform to streamline your talent acquisition pipeline. Our generative AI and large language models create custom-calibrated interview experiences aligned with your company's unique evaluation frameworks and technical benchmarks.
                </p>
                
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                  <li className="flex items-center gap-2">
                    <div className="h-5 w-5 rounded-full bg-primary-100/20 flex items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-primary-100"></div>
                    </div>
                    <span className="text-sm text-gray-300">Multimodal interview assessment</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-5 w-5 rounded-full bg-primary-100/20 flex items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-primary-100"></div>
                    </div>
                    <span className="text-sm text-gray-300">Transformer-based skill validation</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-5 w-5 rounded-full bg-primary-100/20 flex items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-primary-100"></div>
                    </div>
                    <span className="text-sm text-gray-300">Automated talent intelligence</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-5 w-5 rounded-full bg-primary-100/20 flex items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-primary-100"></div>
                    </div>
                    <span className="text-sm text-gray-300">Quantum-level data insights</span>
                  </li>
                </ul>
              </div>
              
              <div className="w-full md:w-1/4 flex justify-center">
                <Link href="/moderator-dashboard" className="group">
                  <div className="relative w-40 h-40 flex items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-100/20 to-blue-600/20 rounded-full blur-md group-hover:blur-lg transition-all"></div>
                    <div className="absolute inset-0 border border-primary-100/30 rounded-full"></div>
                    <div className="bg-gray-900 rounded-full w-36 h-36 flex flex-col items-center justify-center transform transition-transform group-hover:scale-105 duration-300">
                      <p className="text-primary-100 font-semibold">Apply Now</p>
                      <div className="mt-2 flex items-center justify-center w-8 h-8 rounded-full bg-primary-100/10">
                        <ChevronRight className="h-4 w-4 text-primary-100" />
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 border-t border-gray-800/50 pt-16 pb-8 relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-1/3 h-1/3 bg-blue-600/5 blur-[150px] rounded-full"></div>
        <div className="absolute bottom-0 right-1/4 w-1/3 h-1/3 bg-primary-100/5 blur-[150px] rounded-full"></div>
        
        <div className="w-full px-6 md:px-12 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12 max-w-[2000px] mx-auto">
            {/* Logo & Description */}
            <div className="col-span-1 md:col-span-1">
              <Link href="/" className="flex items-center gap-3 group mb-4">
                <div className="relative overflow-hidden rounded-full nav-logo-glow bg-gradient-to-r from-primary-100 to-blue-600 p-0.5">
                  <Image 
                    src="/chakrigo-logo.png" 
                    alt="ChakriGO" 
                    width={32} 
                    height={32}
                    className="rounded-full" 
                  />
                </div>
                <h2 className="text-primary-100 font-bold tracking-wide text-lg"> 
                  Chakri<span className="text-white">GO</span>
                </h2>
              </Link>
              <p className="text-gray-400 text-sm mb-6">
                The AI-powered platform revolutionizing interview preparation and career advancement through neural simulations and data-driven insights.
              </p>
              <div className="flex gap-4">
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors">
                  <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors">
                  <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z"/>
                  </svg>
                </a>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors">
                  <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </a>
              </div>
            </div>
            
            {/* Quick Links */}
            <div className="col-span-1">
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-3">
                <li><Link href="/interview-home" className="text-gray-400 hover:text-primary-100 text-sm transition-colors">AI Interviews</Link></li>
                <li><Link href="/skill-assessment" className="text-gray-400 hover:text-primary-100 text-sm transition-colors">Skill Assessment</Link></li>
                <li><Link href="/resume-checker" className="text-gray-400 hover:text-primary-100 text-sm transition-colors">Resume Builder</Link></li>
                <li><Link href="/job-market" className="text-gray-400 hover:text-primary-100 text-sm transition-colors">Job Market Insights</Link></li>
                <li><Link href="/career" className="text-gray-400 hover:text-primary-100 text-sm transition-colors">Interview Experiences</Link></li>
              </ul>
            </div>
            
            {/* Resources */}
            <div className="col-span-1">
              <h3 className="text-white font-semibold mb-4">Resources</h3>
              <ul className="space-y-3">
                <li><Link href="/blog" className="text-gray-400 hover:text-primary-100 text-sm transition-colors">Blog</Link></li>
                <li><Link href="/success-stories" className="text-gray-400 hover:text-primary-100 text-sm transition-colors">Success Stories</Link></li>
                <li><Link href="/help-center" className="text-gray-400 hover:text-primary-100 text-sm transition-colors">Help Center</Link></li>
                <li><Link href="/faq" className="text-gray-400 hover:text-primary-100 text-sm transition-colors">FAQ</Link></li>
                <li><Link href="/moderator-dashboard" className="text-gray-400 hover:text-primary-100 text-sm transition-colors">Enterprise</Link></li>
              </ul>
            </div>
            
            {/* Company */}
            <div className="col-span-1">
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-3">
                <li><Link href="/about" className="text-gray-400 hover:text-primary-100 text-sm transition-colors">About Us</Link></li>
                <li><Link href="/careers" className="text-gray-400 hover:text-primary-100 text-sm transition-colors">Careers</Link></li>
                <li><Link href="/contact" className="text-gray-400 hover:text-primary-100 text-sm transition-colors">Contact</Link></li>
                <li><Link href="/privacy" className="text-gray-400 hover:text-primary-100 text-sm transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-gray-400 hover:text-primary-100 text-sm transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          
          {/* Bottom Bar */}
          <div className="pt-8 border-t border-gray-800/50 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} ChakriGO Inc. All rights reserved.
            </p>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-gray-900 rounded text-xs text-gray-400">
                <span className="font-medium">Powered by</span> Neural Networks & LLMs
              </span>
              <div className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                <span className="text-xs text-gray-400">API Status: Operational</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}