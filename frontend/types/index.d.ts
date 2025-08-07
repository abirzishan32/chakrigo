interface Feedback {
  id: string;
  interviewId: string;
  userId: string;
  userEmail?: string;
  totalScore: number;
  categoryScores: Array<{
    name: string;
    score: number;
    comment: string;
  }>;
  strengths: string[];
  areasForImprovement: string[];
  finalAssessment: string;
  createdAt: string;
}

interface Interview {
  id: string;
  role: string;
  level: string;
  questions: string[];
  techstack: string[];
  createdAt: string;
  userId: string;
  type: string;
  finalized: boolean;
  isModeratorInterview?: boolean;
  isPublic?: boolean;
  isCompanyInterview?: boolean;
  moderatorId?: string;
  company?: string;
  allowedEmails?: string[];
}

interface CreateFeedbackParams {
  interviewId: string;
  userId: string;
  transcript: { role: string; content: string }[];
  feedbackId?: string;
}

interface User {
  name: string;
  email: string;
  id: string;
  role: 'admin' | 'user' | 'interview-moderator';
  lastActive?: string;
  createdAt?: string;
  company?: string;
  companyWebsite?: string;
  position?: string;
  allowedEmails?: string[];
}

interface SetUserRoleParams {
  userId: string;
  newRole: 'admin' | 'user' | 'interview-moderator';
  company?: string;
}

interface InterviewCardProps {
  id: string;
  role: string;
  type: string;
  techstack: string[];
  createdAt?: string;
  userId: string;
  isCompanyInterview?: boolean;
  isModeratorInterview?: boolean;
  companyName?: string;
  company?: string;
  level?: string;
  isAuthenticated?: boolean;
}

interface AgentProps {
  userName: string;
  userId?: string;
  interviewId?: string;
  feedbackId?: string;
  type: "generate" | "interview";
  questions?: string[];
}

interface RouteParams {
  params: Record<string, string>;
  searchParams: Record<string, string>;
}

interface GetFeedbackByInterviewIdParams {
  interviewId: string;
  userId: string;
}

interface GetLatestInterviewsParams {
  userId: string;
  limit?: number;
}

interface SignInParams {
  email: string;
  idToken: string;
}

interface SignUpParams {
  uid: string;
  name: string;
  email: string;
  password: string;
}

type FormType = "sign-in" | "sign-up";

interface InterviewFormProps {
  interviewId: string;
  role: string;
  level: string;
  type: string;
  techstack: string[];
  amount: number;
}

interface TechIconProps {
  techStack: string[];
}


// Contact Information extracted from resume
interface ContactInfo {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  links?: Array<{
    label: string;
    url: string;
  }>;
}

// Work Experience entry
interface WorkExperience {
  jobTitle?: string;
  company?: string;
  duration?: string;
  responsibilities?: string[];
  achievements?: string[];
}

// Education entry
interface Education {
  degree?: string;
  institution?: string;
  year?: string;
}

// Skills categorized by type
interface Skills {
  technical?: string[];
  soft?: string[];
}

// Project details
interface Project {
  name?: string;
  description?: string;
  technologies?: string[];
  link?: string;
  duration?: string;
}

// Parsed content structure from resume
interface ParsedContent {
  contactInfo?: ContactInfo;
  professionalSummary?: string;
  workExperience?: WorkExperience[];
  education?: Education[];
  skills?: Skills;
  certifications?: string[];
  languages?: string[];
  achievements?: string[];
  projects?: Project[];
}

// Section analysis with scoring and feedback
interface SectionAnalysis {
  sectionName: string;
  score: number; // 0-100
  issues: string[];
  recommendations: string[];
}

// Job fit analysis
interface JobFitAnalysis {
  matchScore: number; // 0-100
  missingKeywords?: string[];
  strengths?: string[];
  weaknesses?: string[];
}

// Complete resume analysis structure based on schema
interface ResumeAnalysisResult {
  overallScore: number; // 0-100
  summary: string;
  parsedContent: ParsedContent;
  sections: SectionAnalysis[];
  jobFitAnalysis: JobFitAnalysis;
}

// Database record for resume analysis
interface ResumeAnalysisRecord {
  id: string;
  userId: string;
  fileName?: string;
  targetRole: string;
  targetDescription: string;
  analysis: ResumeAnalysisResult;
  createdAt: string;
  updatedAt?: string;
}

// Parameters for creating resume analysis
interface CreateResumeAnalysisParams {
  userId: string;
  fileName?: string;
  targetRole: string;
  targetDescription: string;
  analysis: ResumeAnalysisResult;
}

interface ModeratorApplication {
  id: string;
  userId: string;
  userName: string;
  email: string;
  company: string;
  companyWebsite: string;
  workEmail: string;
  position: string;
  linkedinProfile: string;
  employeeId?: string;
  verificationDocumentURL?: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  createdAt: string;
  updatedAt?: string;
}

interface CreateModeratorApplicationParams {
  userId: string;
  company: string;
  companyWebsite: string;
  workEmail: string;
  position: string;
  linkedinProfile: string;
  employeeId?: string;
  verificationDocumentURL?: string;
  reason: string;
}


interface LeetCodeInterview {
  id?: string;
  type: string;
  problemTitle: string;
  problemDifficulty: string;
  problemSlug: string;
  language: string;
  questions: string[];
  userId: string;
  finalized: boolean;
  createdAt: string;
}

interface CodeSnippet {
  id: string;
  title: string;
  description?: string;
  code: string;
  language: string;
  tags?: string[];
  folderId: string | null;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

interface CodeFolder {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
  userId: string;
}