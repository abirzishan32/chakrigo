"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Briefcase, Loader2, ChevronDown, X, Smile, Image as ImageIcon, Building, Award, UserRoundIcon, Search, HelpCircle, PlusCircle, ThumbsUp, ThumbsDown, Meh, ExternalLink, Sparkles, Plus, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createCareerExperience, InterviewExperience, InterviewSource } from "@/lib/actions/career-experience.action";
import { motion, AnimatePresence } from "framer-motion";

type FormValues = {
  companyName: string;
  position: string;
  experience: InterviewExperience;
  source: InterviewSource;
  details: string;
};

// List of allowed companies
const ALLOWED_COMPANIES = [
  "6amTech", "6sense Technologies", "a1qa", "All Generation Tech", "Ami Probashi Ltd.", 
  "Anchorblock Technology", "AnnonLab Ltd.", "Apon Bazaar", "Appscode Ltd", "Apsis Solutions Ltd.", 
  "Apurba Technologies Ltd.", "Astha IT", "Augmedix", "Auxinix", "Bangladesh Software Solution - BSS", 
  "BDCOM Online Ltd", "Bdtask Limited", "Beacontech Limited", "Bit Mascot", "Bitmorpher Ltd.", 
  "BJIT Ltd", "bKash Limited", "BRAC IT Services Limited", "Brain Station 23", 
  "British American Tobacco Bangladesh", "Business Novelty Limited", "Cefalo Bangladesh Ltd", 
  "Chaldal Ltd.", "CodeLab FZC LLC", "Codemen Solution Inc", "Creative Business Group Ltd.", 
  "Daraz Bangladesh", "Data Edge Limited", "DevSpike", "Ding", "Divine IT Limited", 
  "DocTime", "Dotlines Technologies Ltd", "Dynamic Solution Innovators Ltd.", "EDOTCO BD", 
  "Enosis Solutions", "ERA Infotech Ltd.", "Esquire Technology Limited", "Exabyting Technologies Ltd", 
  "Fiftytwo Digital Ltd.", "Foodpanda Bangladesh Ltd", "Fountain IT", 
  "Frontier Semiconductor Bangladesh (FSMB)", "Fronture Technologies Limited", "Giga Tech Limited", 
  "Gigalogy", "Green Delta Insurance Company Limited", "HawarIT Limited", "Huawei", 
  "iBOS Limited", "iFarmer Limited", "Indetechs Software Limited", "Infolytx Bangladesh Limited", 
  "Inkam Ltd", "Inventive Apps Ltd.", "IQVIA", "JB Connect Ltd.", "Kaz Software", 
  "Kite Games Studio", "Kona Software Limited", "LEADS Corporation Limited", "Lynkeus AI", 
  "Media365 Limited", "Mediusware Ltd.", "MetLife", "Millennium Information Solution Limited", 
  "Mir Info Systems Ltd.", "Nagad", "Nascenia Limited", "Navana Group", "Neural Semiconductor Limited", 
  "Nexdecade Technology (Pvt.) Ltd.", "OnnoRokom Projukti Limited", "OnnoRokom Software Ltd.", 
  "Optimizely", "Orange Solutions Limited", "Orbitax Bangladesh Limited", "Pathao", 
  "Pioneer Alpha", "Polygon Technology", "Poridhi", "Portonics Limited", "Praava Health", 
  "Pridesys IT Ltd.", "RedDot Digital Limited", "ReliSource", "REVE Systems", "Riseup Labs", 
  "RITE Solutions Ltd.", "Robi Axiata Limited", "RocketPhone", "Rokomari.com", 
  "Samsung R&D Institute Bangladesh", "Sazim Tech Ltd.", "Scube Technologies Limited", 
  "SEBPO", "SELISE Digital Platforms", "Shadhin Lab Technologies", "ShellBeeHaken Ltd.", 
  "Shikho Technologies BD Ltd", "Silicon Orchard Ltd.", "SSL Wireless", "Startise", 
  "Strativ AB Ltd.", "Streams Tech Ltd", "SupreoX Ltd", "TechForing Ltd", "TechnoNext Ltd.", 
  "Techsist Limited", "Tekarsh Bangladesh Limited", "Tero Labs", "Themefic", "Therap (BD) Ltd.", 
  "THT-Space Electrical Company Ltd.", "TigerIT Bangladesh Ltd.", "Tikweb Bangladesh", "Tiller", 
  "TNC GLOBAL LTD", "Truck Lagbe", "Twinbit Limited", "United Group", 
  "upay (UCB Fintech Company Limited)", "Vivasoft Limited", "Voyage AI", "Wafi Solutions", 
  "WellDev Bangladesh Ltd.", "WPPOOL", "Xeon Technology Ltd."
].sort();

// Server action to get the current user
async function fetchCurrentUser() {
  
  const { getCurrentUser } = await import("@/lib/actions/auth.action");
  return getCurrentUser();
}

export default function ClientExperienceForm() {
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [questions, setQuestions] = useState<string[]>([]);
  const [questionInput, setQuestionInput] = useState('');
  const [companySearch, setCompanySearch] = useState('');
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const [filteredCompanies, setFilteredCompanies] = useState<string[]>([]);
  const companyInputRef = useRef<HTMLDivElement>(null);
  const questionInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  
  const { register, handleSubmit, formState: { errors }, reset, watch, setValue, getValues } = useForm<FormValues>({
    defaultValues: {
      companyName: '',
      position: '',
      experience: 'neutral',
      source: 'Applied online',
      details: '',
    }
  });

  const details = watch("details") || "";
  const detailsLength = details.length;
  const maxDetailsLength = 1000;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (companyInputRef.current && !companyInputRef.current.contains(event.target as Node)) {
        setShowCompanyDropdown(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  useEffect(() => {
    const filtered = ALLOWED_COMPANIES.filter(company => 
      company.toLowerCase().includes(companySearch.toLowerCase())
    );
    setFilteredCompanies(filtered);
  }, [companySearch]);
  
  useEffect(() => {
    const getUser = async () => {
      try {
        const currentUser = await fetchCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error("Error fetching current user:", error);
      } finally {
        setLoading(false);
      }
    };
    
    getUser();
  }, []);
  
  const addQuestion = () => {
    if (questionInput.trim() === '') return;
    
    setQuestions([...questions, questionInput.trim()]);
    setQuestionInput('');
    
    setTimeout(() => {
      if (questionInputRef.current) {
        questionInputRef.current.focus();
      }
    }, 100);
  };

  const removeQuestion = (index: number) => {
    const newQuestions = [...questions];
    newQuestions.splice(index, 1);
    setQuestions(newQuestions);
  };

  const handleCompanySelect = (company: string) => {
    setValue("companyName", company);
    setCompanySearch(company);
    setShowCompanyDropdown(false);
  };
  
  const onSubmit = async (data: FormValues) => {
    if (!user) {
      toast.error("You must be logged in to submit an experience.");
      return;
    }

    if (!ALLOWED_COMPANIES.includes(data.companyName)) {
      toast.error("Please select a company from the dropdown list.");
      return;
    }

    try {
      setIsSubmitting(true);

      const result = await createCareerExperience({
        userId: user.id,
        companyName: data.companyName,
        position: data.position,
        experience: data.experience,
        source: data.source,
        details: data.details,
        questions: questions,
      });

      if (result.success) {
        toast.success("Your experience has been shared!");
        reset();
        setQuestions([]);
        setExpanded(false);
        setCompanySearch('');
        router.refresh();
      } else {
        toast.error(result.message || "Failed to share your experience.");
      }
    } catch (error) {
      console.error("Error submitting experience:", error);
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="text-center py-8 px-6">
        <div className="max-w-md mx-auto">
          <div className="p-4 bg-blue-600/10 rounded-2xl inline-flex mb-4">
            <Sparkles className="h-8 w-8 text-blue-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Share Your Interview Story</h3>
          <p className="text-gray-400 mb-6 text-sm leading-relaxed">
            Help fellow developers by sharing your interview experience anonymously. Your insights could be the key to someone's success.
          </p>
          <Link 
            href="/sign-in" 
            className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105 shadow-lg shadow-blue-600/20"
          >
            Sign in to share
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }
  

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Compact View (until expanded) */}
        {!expanded ? (
          <motion.div 
            className="flex items-center space-x-4 p-4 rounded-2xl border-2 border-dashed border-gray-700/60 hover:border-blue-500/40 transition-all duration-300 cursor-pointer group"
            onClick={() => setExpanded(true)}
            whileHover={{ scale: 1.01 }}
          >
            <div className="flex-shrink-0">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white shadow-lg group-hover:shadow-blue-600/30 transition-all duration-300">
                <UserRoundIcon className="w-6 h-6" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="text-gray-400 group-hover:text-gray-300 transition-colors">
                Share your interview story... Help others prepare for their interviews!
              </div>
              <div className="text-sm text-gray-500 mt-1">
                Click to start sharing your experience
              </div>
            </div>
            
            <div className="flex-shrink-0">
              <div className="p-2 bg-blue-600/10 rounded-xl text-blue-400 group-hover:bg-blue-600/20 transition-colors">
                <Plus className="h-5 w-5" />
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white">
                  <UserRoundIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Share Your Interview Experience</h3>
                  <p className="text-sm text-gray-400">Help others prepare for their interviews</p>
                </div>
              </div>
              <button
                title="Collapse"
                type="button"
                onClick={() => {
                  setExpanded(false);
                  reset();
                  setQuestions([]);
                  setCompanySearch('');
                }}
                className="p-2 text-gray-500 hover:text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Company and Position */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div 
                ref={companyInputRef}
                className="relative"
              >
                <label className="block text-sm font-medium text-gray-300 mb-2">Company Name *</label>
                <div 
                  className="relative bg-gray-800/60 border border-gray-700 rounded-xl p-4 hover:border-blue-500/50 transition-colors"
                  onClick={() => setShowCompanyDropdown(true)}
                >
                  <div className="flex items-center space-x-3">
                    <Building className="h-5 w-5 text-blue-400" />
                    <input
                      {...register("companyName", { 
                        required: "Company name is required",
                        validate: value => ALLOWED_COMPANIES.includes(value) || "Please select a company from the list"
                      })}
                      placeholder="Search and select company"
                      className="bg-transparent border-none focus:outline-none text-white w-full"
                      value={companySearch}
                      onChange={(e) => {
                        setCompanySearch(e.target.value);
                        setValue("companyName", e.target.value);
                        setShowCompanyDropdown(true);
                      }}
                      autoComplete="off"
                    />
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
                
                <AnimatePresence>
                  {showCompanyDropdown && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute left-0 right-0 mt-2 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl max-h-64 overflow-y-auto z-30"
                    >
                      {filteredCompanies.length > 0 ? (
                        filteredCompanies.map(company => (
                          <div 
                            key={company}
                            className="px-4 py-3 hover:bg-gray-700 cursor-pointer text-white transition-colors border-b border-gray-700/50 last:border-b-0"
                            onClick={() => handleCompanySelect(company)}
                          >
                            {company}
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-gray-400">
                          No companies match your search
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {errors.companyName && (
                  <p className="text-red-400 text-xs mt-2">{errors.companyName.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Position Applied For *</label>
                <div className="relative bg-gray-800/60 border border-gray-700 rounded-xl p-4 hover:border-blue-500/50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <Award className="h-5 w-5 text-blue-400" />
                    <input
                      {...register("position", { required: "Position is required" })}
                      placeholder="e.g. Software Engineer"
                      className="bg-transparent border-none focus:outline-none text-white w-full"
                    />
                  </div>
                </div>
                {errors.position && (
                  <p className="text-red-400 text-xs mt-2">{errors.position.message}</p>
                )}
              </div>
            </div>

            {/* Experience and Source */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Interview Experience *</label>
                <select
                  {...register("experience", { required: "Experience rating is required" })}
                  className="w-full bg-gray-800/60 border border-gray-700 rounded-xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="positive">✅ Positive Experience</option>
                  <option value="neutral">😐 Neutral Experience</option>
                  <option value="negative">❌ Negative Experience</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">How Did You Get The Interview? *</label>
                <select
                  {...register("source", { required: "Interview source is required" })}
                  className="w-full bg-gray-800/60 border border-gray-700 rounded-xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Applied online">Applied online</option>
                  <option value="Campus Recruiting">Campus Recruiting</option>
                  <option value="Recruiter">Recruiter</option>
                  <option value="Employee Referral">Employee Referral</option>
                  <option value="In Person">In Person</option>
                  <option value="Staffing Agency">Staffing Agency</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Experience Details */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Experience Details *</label>
              <div className="relative">
                <textarea
                  {...register("details", { 
                    required: "Experience details are required",
                    minLength: { value: 50, message: "Please provide at least 50 characters" }
                  })}
                  rows={6}
                  className="w-full bg-gray-800/60 border border-gray-700 rounded-xl p-4 text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Share your interview experience in detail. What was the process like? What did you like or dislike? Any advice for others?"
                  maxLength={maxDetailsLength}
                ></textarea>
                
                <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                  <span className={detailsLength > maxDetailsLength * 0.9 ? "text-amber-400" : ""}>
                    {detailsLength}
                  </span>
                  <span>/{maxDetailsLength}</span>
                </div>
              </div>
              {errors.details && (
                <p className="text-red-400 text-xs mt-2">{errors.details.message}</p>
              )}
            </div>

            {/* Interview Questions */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Interview Questions ({questions.length} added)
              </label>
              
              <div className="flex space-x-2 mb-3">
                <input
                  ref={questionInputRef}
                  value={questionInput}
                  onChange={(e) => setQuestionInput(e.target.value)}
                  placeholder="Add questions you were asked"
                  className="flex-1 bg-gray-800/60 border border-gray-700 rounded-xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addQuestion())}
                />
                <button 
                  type="button"
                  onClick={addQuestion}
                  className="px-6 py-4 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-medium transition-colors"
                >
                  Add
                </button>
              </div>
              
              {questions.length > 0 && (
                <div className="space-y-2">
                  <AnimatePresence>
                    {questions.map((q, index) => (
                      <motion.div 
                        key={index}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex items-center justify-between bg-gray-800/40 border border-gray-700 rounded-lg p-3"
                      >
                        <span className="text-gray-300 text-sm">{q}</span>
                        <button
                          title="Remove Question"
                          type="button"
                          onClick={() => removeQuestion(index)}
                          className="text-gray-500 hover:text-red-400 p-1 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center pt-6 border-t border-gray-800">
              <div className="text-xs text-gray-400 flex items-center space-x-2">
                <ExternalLink className="h-4 w-4" />
                <span>Your submission will be posted anonymously</span>
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setExpanded(false);
                    reset();
                    setQuestions([]);
                    setCompanySearch('');
                  }}
                  className="px-6 py-3 text-gray-400 hover:text-white font-medium rounded-xl transition-colors"
                >
                  Cancel
                </button>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-all duration-200 hover:scale-105 shadow-lg shadow-blue-600/20"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Sharing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      <span>Share Experience</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </form>
    </div>
  );
}