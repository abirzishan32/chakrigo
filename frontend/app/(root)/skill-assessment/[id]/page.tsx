"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FaClock, FaCheck, FaTimes, FaArrowLeft, FaArrowRight, FaVideo, FaEye, FaInfoCircle } from "react-icons/fa";
import { toast } from "sonner";
import { getSkillAssessmentById, saveUserAssessmentResults, UserQuestionAttempt } from "@/lib/actions/skill-assessment.action";
import { SkillAssessment, AssessmentQuestion } from "@/lib/actions/skill-assessment.action";
import EyeTrackingProctor from "@/components/skill-assessment/EyeTrackingProctor";
import ProctorConsentModal from "@/components/skill-assessment/ProctorConsentModal";
import DisqualificationScreen from "@/components/skill-assessment/DisqualificationScreen";
import { EnvironmentDetectionProvider } from "@/components/skill-assessment/EnvironmentDetectionProvider";
import { EnvironmentDetectionModal } from "@/components/skill-assessment/EnvironmentDetectionModal";
import { useRemoteAccessDetection } from "@/hooks/useRemoteAccessDetection";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { generateStudyRecommendationsAgent } from "@/lib/actions/assessment-ai.action";

  // Assessment status types
type AssessmentStatus = "intro" | "environment-check" | "in-progress" | "results" | "disqualified";

// User answer type
type UserAnswer = {
  questionId: string;
  selectedOptions: string[];
  text?: string;
};

// Assessment result type
type AssessmentResult = {
  score: number;
  maxScore: number;
  percentage: number;
  isPassing: boolean;
  answersByQuestion: {
    questionId: string;
    correct: boolean;
    points: number;
    question: string;
    userAnswer: UserAnswer;
  }[];
};

export default function AssessmentPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [assessment, setAssessment] = useState<SkillAssessment | null>(null);
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const [assessmentStatus, setAssessmentStatus] = useState<AssessmentStatus>("intro");
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Analytics tracking
  const [questionStartTimes, setQuestionStartTimes] = useState<{[key: string]: number}>({});
  const [questionTimings, setQuestionTimings] = useState<{[key: string]: number}>({});
  const [studyRecommendations, setStudyRecommendations] = useState<any>(null);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  
  // Anti-cheating states
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [proctorActive, setProctorActive] = useState(false);
  const [showProctorVideo, setShowProctorVideo] = useState(false);
  
  // Environment detection states
  const [showEnvironmentModal, setShowEnvironmentModal] = useState(false);
  const [environmentVerified, setEnvironmentVerified] = useState(false);
  const [environmentRisk, setEnvironmentRisk] = useState<'low' | 'high'>('low');
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Environment detection hook
  const { detectionResult, isLoading: environmentLoading, rerunDetection } = useRemoteAccessDetection();

  // Enhance handleCheatingDetected to accept a reason using useCallback
  const handleCheatingDetected = useCallback((reason: string = "Potential academic integrity violation") => {
    // Log security violation with environment context
    console.error('Security violation detected:', {
      reason,
      assessmentId: params.id,
      environmentRisk,
      environmentDetails: detectionResult?.detectionDetails
    });
    
    // Stop the timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // Clear localStorage timer data
    localStorage.removeItem(`assessment_end_time_${params.id}`);
    
    // Set assessment status to disqualified
    setAssessmentStatus("disqualified");
    
    // Store the reason for disqualification
    localStorage.setItem(`assessment_disqualification_reason_${params.id}`, reason);
    
    toast.error(`Assessment terminated due to ${reason}`, {
      duration: 5000,
    });
  }, [params.id, environmentRisk, detectionResult]);

  // Add tab switching detection
  useEffect(() => {
    if (assessmentStatus !== "in-progress") return;
    
    // Handler for tab visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden" && assessmentStatus === "in-progress") {
        console.log("Tab switching detected - triggering disqualification");
        handleCheatingDetected("Tab switching detected");
      }
    };
    
    // Add event listeners
    document.addEventListener("visibilitychange", handleVisibilityChange);
    
    // Cleanup
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [assessmentStatus, params.id, handleCheatingDetected]);

  // Prevent screenshots and copying
  useEffect(() => {
    if (assessmentStatus !== "in-progress") return;
    
    // Prevent screenshots by capturing PrintScreen, Cmd+Shift+3/4 etc.
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for PrintScreen key
      if (e.key === 'PrintScreen') {
        e.preventDefault();
        handleCheatingDetected("Screenshot attempt detected");
        return;
      }
      
      // Check for Cmd+Shift+3/4/5 (Mac screenshot shortcuts)
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === '3' || e.key === '4' || e.key === '5')) {
        e.preventDefault();
        handleCheatingDetected("Screenshot attempt detected");
        return;
      }
      
      // Check for Windows Snipping Tool shortcuts (Windows+Shift+S)
      if (e.shiftKey && e.key === 'S' && e.metaKey) {
        e.preventDefault();
        handleCheatingDetected("Screenshot attempt detected");
        return;
      }
    };
    
    // Detect programmatic screenshot attempts
    // This is a basic implementation - more sophisticated detection would be needed for production
    const detectProgrammaticScreenshot = () => {
      // Listen for media capture events that might indicate screenshots
      const originalGetDisplayMedia = navigator.mediaDevices.getDisplayMedia;
      navigator.mediaDevices.getDisplayMedia = function(constraints) {
        handleCheatingDetected("Screen recording attempt detected");
        return Promise.reject(new Error('Screen capture denied by assessment security policy'));
      };
      
      return () => {
        navigator.mediaDevices.getDisplayMedia = originalGetDisplayMedia;
      };
    };
    
    // Prevent copy events
    const preventCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      toast.error("Copying is not allowed during the assessment", { duration: 3000 });
    };
    
    // Prevent context menu (right-click)
    const preventContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      toast.error("Right-click is disabled during the assessment", { duration: 3000 });
    };
    
    // Prevent drag events (for dragging images or content)
    const preventDrag = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };
    
    // Prevent text selection
    const preventSelection = () => {
      if (assessmentStatus === "in-progress") {
        // Add a class to the body to prevent selection
        document.body.classList.add('no-select');
        
        // Apply to the specific content containers
        const assessmentContent = document.querySelector('.bg-gray-800');
        if (assessmentContent) {
          assessmentContent.classList.add('no-select');
        }
      }
    };
    
    // Add event listeners
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('copy', preventCopy);
    document.addEventListener('cut', preventCopy);
    document.addEventListener('paste', preventCopy);
    document.addEventListener('contextmenu', preventContextMenu);
    document.addEventListener('dragstart', preventDrag as any);
    document.addEventListener('drop', preventDrag as any);
    
    // Apply selection prevention
    preventSelection();
    
    // Apply programmatic screenshot detection
    const cleanupProgrammaticDetection = detectProgrammaticScreenshot();
    
    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('copy', preventCopy);
      document.removeEventListener('cut', preventCopy);
      document.removeEventListener('paste', preventCopy);
      document.removeEventListener('contextmenu', preventContextMenu);
      document.removeEventListener('dragstart', preventDrag as any);
      document.removeEventListener('drop', preventDrag as any);
      document.body.classList.remove('no-select');
      cleanupProgrammaticDetection();
    };
  }, [assessmentStatus, handleCheatingDetected]);

  // Continuous environment monitoring during assessment
  useEffect(() => {
    if (assessmentStatus !== "in-progress") return;

    const monitoringInterval = setInterval(async () => {
      // Re-run detection to check for environment changes
      const newResult = await rerunDetection();
      
      // Check if environment changed during assessment (became more risky)
      if (newResult && (newResult.isRemoteAccess || newResult.isVirtualMachine)) {
        // Only trigger if we weren't already in high-risk mode
        if (environmentRisk !== 'high') {
          console.warn('Environment changed during assessment:', {
            assessmentId: params.id,
            previousRisk: environmentRisk,
            newResult
          });
          
          // Immediate disqualification for environment tampering
          handleCheatingDetected("Environment security violation detected during assessment");
        }
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(monitoringInterval);
  }, [assessmentStatus, environmentRisk, params.id, handleCheatingDetected, rerunDetection]);

  // Fetch assessment data
  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        setLoading(true);
        const response = await getSkillAssessmentById(params.id);
        console.log("Assessment response:", response);
        
        if (response && response.success && 'data' in response) {
          // Handle the assessment data with proper type conversion
          const assessmentData = {
            ...response.data,
            // Ensure questions is a string array as required by SkillAssessment
            questions: response.data.questions ? 
              (Array.isArray(response.data.questions) ? 
                response.data.questions.map(q => typeof q === 'string' ? q : q.id) : 
                []) : 
              []
          };
          
          setAssessment(assessmentData as SkillAssessment);
          
          // Store the actual question objects separately
          if (response.data.questions && Array.isArray(response.data.questions)) {
            console.log("Questions data:", response.data.questions);
            // Check if questions are objects with 'id' property or just strings
            const questionObjects = response.data.questions.filter(q => q && typeof q === 'object' && 'id' in q);
            console.log("Filtered question objects:", questionObjects);
            
            if (questionObjects.length > 0) {
              setQuestions(questionObjects as AssessmentQuestion[]);
            } else {
              // If no question objects found, try to load them from assessmentQuestions collection
              const questionIds = response.data.questions.filter(q => typeof q === 'string');
              console.log("Question IDs to fetch:", questionIds);
              
              // We need to fetch the actual question objects using their IDs
              try {
                const fetchedQuestions = await Promise.all(
                  questionIds.map(async (qId) => {
                    const questionDoc = await fetch(`/api/questions/${qId}`).then(res => res.json());
                    return questionDoc.data;
                  })
                );
                console.log("Fetched questions:", fetchedQuestions);
                
                const validQuestions = fetchedQuestions.filter(q => q !== null && q !== undefined);
                if (validQuestions.length > 0) {
                  setQuestions(validQuestions as AssessmentQuestion[]);
                } else {
                  setError("No questions found for this assessment");
                }
              } catch (fetchError) {
                console.error("Error fetching individual questions:", fetchError);
                setError("Failed to load assessment questions");
              }
            }
          } else {
            console.warn("No questions array found in response");
            setError("No questions found for this assessment");
          }
        } else {
          setError("Failed to load assessment");
        }
      } catch (err) {
        setError("Failed to load assessment. Please try again later.");
        console.error("Error fetching assessment:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAssessment();
  }, [params.id]);

  // Environment detection effect
  useEffect(() => {
    if (assessmentStatus === "environment-check" && detectionResult && !environmentLoading) {
      const hasSecurityConcerns = detectionResult.isRemoteAccess || detectionResult.isVirtualMachine;
      
      if (hasSecurityConcerns) {
        setEnvironmentRisk('high');
        setShowEnvironmentModal(true);
        
        // Log the security concern
        console.warn('Environment security concern detected:', {
          assessmentId: params.id,
          remoteAccess: detectionResult.isRemoteAccess,
          virtualMachine: detectionResult.isVirtualMachine,
          details: detectionResult.detectionDetails
        });
      } else {
        setEnvironmentVerified(true);
        setEnvironmentRisk('low');
        // Proceed to consent modal
        setShowConsentModal(true);
      }
    }
  }, [assessmentStatus, detectionResult, environmentLoading, params.id]);

  // Handle timer
  useEffect(() => {
    if (assessmentStatus !== "in-progress" || !assessment) return;
    
    // Set initial time when starting the assessment
    if (startTimeRef.current === null) {
      const totalSeconds = assessment.duration * 60;
      setRemainingTime(totalSeconds);
      startTimeRef.current = Date.now();

      // Save expected end time to localStorage in case of page refresh
      localStorage.setItem(`assessment_end_time_${params.id}`, 
        (Date.now() + totalSeconds * 1000).toString());
    }

    // Start the timer
    timerRef.current = setInterval(() => {
      const endTime = parseInt(localStorage.getItem(`assessment_end_time_${params.id}`) || '0');
      const remaining = Math.max(0, Math.round((endTime - Date.now()) / 1000));
      
      setRemainingTime(remaining);
      
      // Time's up
      if (remaining === 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        calculateAndShowResults();
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [assessmentStatus, assessment, params.id]);

  // Show environment detection before starting the assessment
  const prepareToStartAssessment = () => {
    if (!assessment) {
      toast.error("Assessment data is not available");
      return;
    }
    
    if (questions.length === 0) {
      toast.error("This assessment has no questions yet. Please try another assessment or check back later.");
      // Navigate back to the assessment list
      setTimeout(() => {
        router.push('/skill-assessment');
      }, 3000);
      return;
    }
    
    // Start environment detection
    setAssessmentStatus("environment-check");
    toast.info("Checking environment security...", { duration: 2000 });
  };
  
  // Start the assessment after consent
  const startAssessment = () => {
    setAssessmentStatus("in-progress");
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    startTimeRef.current = null; // Reset start time
    setProctorActive(true); // Enable proctoring
    
    // Initialize question start time for the first question
    const currentTime = Date.now();
    const firstQuestion = questions[0];
    if (firstQuestion) {
      setQuestionStartTimes(prev => ({
        ...prev,
        [firstQuestion.id]: currentTime
      }));
    }
  };

  // Handle environment detection modal responses
  const handleEnvironmentProceed = () => {
    setShowEnvironmentModal(false);
    setEnvironmentVerified(true);
    
    // Log that user proceeded despite risks
    console.warn('User proceeded with high-risk environment:', {
      assessmentId: params.id,
      detectionResult
    });
    
    // Show webcam consent modal
    setShowConsentModal(true);
  };

  const handleEnvironmentCancel = () => {
    setShowEnvironmentModal(false);
    setAssessmentStatus("intro");
    toast.error("Assessment cancelled due to environment security concerns");
  };

  // Handle webcam consent
  const handleConsentAccept = () => {
    setShowConsentModal(false);
    startAssessment();
  };
  
  const handleConsentDecline = () => {
    setShowConsentModal(false);
    setAssessmentStatus("intro");
    toast.error("Webcam access is required to take this assessment");
  };

  // Toggle showing the proctor video
  const toggleProctorVideo = () => {
    setShowProctorVideo(prev => !prev);
  };

  // Handle answer submission with timing data
  const handleAnswerSubmit = (answer: UserAnswer) => {
    // Save the answer
    setUserAnswers(prev => {
      const updatedAnswers = [...prev];
      const existingIndex = updatedAnswers.findIndex(a => a.questionId === answer.questionId);
      
      if (existingIndex >= 0) {
        updatedAnswers[existingIndex] = answer;
      } else {
        updatedAnswers.push(answer);
      }
      
      return updatedAnswers;
    });
    
    // Record the time spent on this question
    const currentTime = Date.now();
    const startTime = questionStartTimes[answer.questionId] || currentTime;
    const timeSpent = Math.floor((currentTime - startTime) / 1000); // Convert to seconds
    
    setQuestionTimings(prev => ({
      ...prev,
      [answer.questionId]: timeSpent
    }));
    
    // Move to next question if not the last one
    if (currentQuestionIndex < questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      
      // Set start time for the next question
      const nextQuestion = questions[nextIndex];
      if (nextQuestion) {
        setQuestionStartTimes(prev => ({
          ...prev,
          [nextQuestion.id]: Date.now()
        }));
      }
    }
  };

  // Navigate between questions with timing
  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      // Save timing for current question before moving
      const currentQuestion = questions[currentQuestionIndex];
      const currentTime = Date.now();
      const startTime = questionStartTimes[currentQuestion.id] || currentTime;
      const timeSpent = Math.floor((currentTime - startTime) / 1000);
      
      setQuestionTimings(prev => ({
        ...prev,
        [currentQuestion.id]: timeSpent
      }));
      
      // Move to previous question
      const prevIndex = currentQuestionIndex - 1;
      setCurrentQuestionIndex(prevIndex);
      
      // Reset start time for the previous question
      const prevQuestion = questions[prevIndex];
      setQuestionStartTimes(prev => ({
        ...prev,
        [prevQuestion.id]: Date.now()
      }));
    }
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      // Save timing for current question before moving
      const currentQuestion = questions[currentQuestionIndex];
      const currentTime = Date.now();
      const startTime = questionStartTimes[currentQuestion.id] || currentTime;
      const timeSpent = Math.floor((currentTime - startTime) / 1000);
      
      setQuestionTimings(prev => ({
        ...prev,
        [currentQuestion.id]: timeSpent
      }));
      
      // Move to next question
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      
      // Reset start time for the next question
      const nextQuestion = questions[nextIndex];
      setQuestionStartTimes(prev => ({
        ...prev,
        [nextQuestion.id]: Date.now()
      }));
    }
  };

  // Submit the assessment and calculate results
  const submitAssessment = () => {
    calculateAndShowResults();
  };

  // Calculate and show the results with timing data
  const calculateAndShowResults = async () => {
    if (!assessment || questions.length === 0) return;
    
    // Record time for the last question
    const lastQuestion = questions[currentQuestionIndex];
    const currentTime = Date.now();
    const startTime = questionStartTimes[lastQuestion.id] || currentTime;
    const timeSpent = Math.floor((currentTime - startTime) / 1000);
    
    setQuestionTimings(prev => ({
      ...prev,
      [lastQuestion.id]: timeSpent
    }));
    
    let totalPoints = 0;
    let earnedPoints = 0;
    const answersByQuestion = [];
    const questionAttempts: UserQuestionAttempt[] = [];
    
    for (const question of questions) {
      totalPoints += question.points;
      
      const userAnswer = userAnswers.find(a => a.questionId === question.id);
      let isCorrect = false;
      
      // Check if answer is correct based on question type
      if (userAnswer) {
        if (question.type === "multiple-choice") {
          // For multiple choice questions
          if (question.answerType === "single") {
            // Single answer question
            const correctOptionId = question.options?.find(opt => opt.isCorrect)?.id;
            isCorrect = userAnswer.selectedOptions.length === 1 && 
                       userAnswer.selectedOptions[0] === correctOptionId;
          } else {
            // Multiple answers question
            const correctOptionIds = question.options?.filter(opt => opt.isCorrect).map(opt => opt.id) || [];
            const hasAllCorrect = correctOptionIds.every(id => userAnswer.selectedOptions.includes(id));
            const hasNoIncorrect = userAnswer.selectedOptions.every(id => 
              correctOptionIds.includes(id));
            isCorrect = hasAllCorrect && hasNoIncorrect;
          }
        } else if (question.type === "true-false") {
          // For true/false questions
          const correctOptionId = question.options?.find(opt => opt.isCorrect)?.id;
          isCorrect = userAnswer.selectedOptions.length === 1 && 
                     userAnswer.selectedOptions[0] === correctOptionId;
        }
        // Text and coding questions would require AI evaluation in a real implementation
      }
      
      if (isCorrect) earnedPoints += question.points;
      
      answersByQuestion.push({
        questionId: question.id,
        correct: isCorrect,
        points: isCorrect ? question.points : 0,
        question: question.question,
        userAnswer: userAnswer || { questionId: question.id, selectedOptions: [] }
      });
      
      // Add timing data to question attempts
      questionAttempts.push({
        questionId: question.id,
        timeSpentInSeconds: questionTimings[question.id] || 0,
        selectedOptions: userAnswer?.selectedOptions || [],
        isCorrect
      });
    }
    
    const percentage = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    const isPassing = percentage >= (assessment.passPercentage || 70);
    
    const resultData = {
      score: earnedPoints,
      maxScore: totalPoints,
      percentage,
      isPassing,
      answersByQuestion
    };
    
    setResult(resultData);
    
    // Calculate total time spent
    const totalTimeSpent = Object.values(questionTimings).reduce((total, time) => total + time, 0);
    
    // Save assessment results to database if user is logged in
    if (session?.user) {
      try {
        // Get user ID safely - try different approaches to handle various session structures
        let userId = 'anonymous';
        
        if ((session.user as any).id) {
          userId = (session.user as any).id;
        } else if ((session as any).id) {
          userId = (session as any).id;
        } else if ((session as any).userId) {
          userId = (session as any).userId;
        }
        
        const savedResult = await saveUserAssessmentResults(
          userId,
          assessment.id,
          {
            score: earnedPoints,
            maxScore: totalPoints,
            percentage,
            isPassing,
            timeSpentInSeconds: totalTimeSpent,
            questionAttempts
          }
        );
        
        // Generate study recommendations using the agent
        setLoadingRecommendations(true);
        
        const recommendationsResult = await generateStudyRecommendationsAgent({
          assessmentTitle: assessment.title,
          assessmentCategory: assessment.category,
          questions,
          userAttempts: questionAttempts
        });
        
        if (recommendationsResult.success && recommendationsResult.data) {
          setStudyRecommendations(recommendationsResult.data);
        }
        
        setLoadingRecommendations(false);
      } catch (err) {
        console.error("Error saving assessment results:", err);
        // Continue without saving results
        setLoadingRecommendations(false);
      }
    }
    
    // Clean up timer
    if (timerRef.current) clearInterval(timerRef.current);
    localStorage.removeItem(`assessment_end_time_${params.id}`);
    
    setAssessmentStatus("results");
  };

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Current question
  const currentQuestion = questions[currentQuestionIndex];

  // Render study recommendations
  const renderStudyRecommendations = () => {
    if (loadingRecommendations) {
      return (
        <div className="mt-8 p-6 bg-gray-800 rounded-lg animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-700 rounded w-2/3 mb-2"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2"></div>
        </div>
      );
    }
    
    // If we have recommendations from AI, show them
    if (studyRecommendations && studyRecommendations.topics && studyRecommendations.topics.length > 0) {
      return (
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-white mb-4">Study Recommendations</h3>
          <div className="space-y-6">
            {studyRecommendations.topics.map((topic: any, index: number) => (
              <div key={index} className="p-6 bg-gray-800 rounded-lg">
                <h4 className="text-lg font-medium text-blue-400 mb-2">{topic.topic}</h4>
                <p className="text-gray-300 mb-4">{topic.description}</p>
                <h5 className="text-sm font-medium text-gray-400 mb-2">Recommended Resources:</h5>
                <ul className="space-y-2">
                  {topic.resources.map((resource: any, resIndex: number) => (
                    <li key={resIndex} className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      <div>
                        <p className="text-white font-medium">{resource.title}</p>
                        {resource.description && (
                          <p className="text-gray-400 text-sm">{resource.description}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      );
    }
    
    // Fallback: If no recommendations from AI, create a generic one based on incorrect questions
    const incorrectQuestions = result?.answersByQuestion.filter(q => !q.correct) || [];
    
    if (incorrectQuestions.length > 0) {
      // Group questions by common keywords to simulate topic grouping
      const keywords = extractKeywords(incorrectQuestions.map(q => q.question));
      
      // Get the assessment category with a fallback
      const category = assessment?.category || 'this subject';
      
      return (
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-white mb-4">Study Recommendations</h3>
          <div className="space-y-6">
            <div className="p-6 bg-gray-800 rounded-lg">
              <h4 className="text-lg font-medium text-blue-400 mb-2">
                Focus Areas
              </h4>
              <p className="text-gray-300 mb-4">
                Pay special attention to these topics that appeared in questions you found challenging.
              </p>
              <div className="space-y-2 mt-3">
                {keywords.map((keyword, idx) => (
                  <div key={idx} className="flex items-start">
                    <span className="text-blue-500 mr-2">{idx + 1}.</span>
                    <span className="text-gray-300">Focus on basics of {keyword} and related functionalities</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    return null;
  };
  
  // Helper function to extract common keywords from questions
  const extractKeywords = (questions: string[]): string[] => {
    if (questions.length === 0) return [];
    
    // Common stop words to filter out
    const stopWords = ['a', 'an', 'the', 'is', 'are', 'of', 'in', 'to', 'for', 'with', 'and', 'or', 'what', 'which', 'how'];
    
    // Join all questions and split into words
    const allWords = questions.join(' ')
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove punctuation
      .split(/\s+/) // Split by whitespace
      .filter(word => word.length > 3 && !stopWords.includes(word)); // Filter out short words and stop words
    
    // Count word frequency
    const wordCount: {[key: string]: number} = {};
    allWords.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });
    
    // Get the most common words (keywords)
    return Object.entries(wordCount)
      .sort((a, b) => b[1] - a[1]) // Sort by frequency
      .slice(0, 5) // Take top 5
      .map(([word]) => word);
  };

  // Render time analytics summary
  const renderTimeAnalytics = () => {
    if (!result || !questionTimings) return null;
    
    // Calculate total time spent
    const totalTimeSpent = Object.values(questionTimings).reduce((total, time) => total + time, 0);
    
    // Find questions that took the most time
    const sortedQuestions = [...result.answersByQuestion]
      .sort((a, b) => (questionTimings[b.questionId] || 0) - (questionTimings[a.questionId] || 0))
      .slice(0, 3); // Top 3 time-consuming questions
    
    // Find questions that were answered incorrectly
    const incorrectQuestions = result.answersByQuestion.filter(q => !q.correct);
    
    return (
      <div className="mt-8 bg-gray-900 border border-gray-800 rounded-xl shadow-xl overflow-hidden">
        <div className="p-6 border-b border-gray-800">
          <h3 className="text-xl font-semibold text-white">Time Analytics</h3>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">Total Time Spent</div>
              <div className="text-xl font-bold text-white">
                {Math.floor(totalTimeSpent / 60)}m {totalTimeSpent % 60}s
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">Average Time per Question</div>
              <div className="text-xl font-bold text-white">
                {Math.floor((totalTimeSpent / result.answersByQuestion.length) / 60)}m {Math.round((totalTimeSpent / result.answersByQuestion.length) % 60)}s
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">Completion Rate</div>
              <div className="text-xl font-bold text-white">
                {Math.round((result.answersByQuestion.length / (questions?.length || 1)) * 100)}%
              </div>
            </div>
          </div>
          
          {sortedQuestions.length > 0 && (
            <div>
              <h4 className="text-md font-medium text-white mb-3">
                Questions That Took the Most Time
              </h4>
              <div className="space-y-3">
                {sortedQuestions.map((q, index) => (
                  <div key={q.questionId} className="bg-gray-800/50 rounded-lg p-4">
                    <div className="flex items-start">
                      <div className="text-gray-500 mr-3">{index + 1}.</div>
                      <div className="flex-1">
                        <div className="text-white mb-1">{q.question}</div>
                        <div className="flex items-center text-sm">
                          <FaClock className="text-blue-400 mr-1 w-3 h-3" />
                          <span className="text-blue-400">
                            {Math.floor(questionTimings[q.questionId] / 60)}m {questionTimings[q.questionId] % 60}s
                          </span>
                          <span className="mx-2 text-gray-600">|</span>
                          {q.correct ? (
                            <span className="text-green-500 flex items-center">
                              <FaCheck className="mr-1 w-3 h-3" /> Correct
                            </span>
                          ) : (
                            <span className="text-red-500 flex items-center">
                              <FaTimes className="mr-1 w-3 h-3" /> Incorrect
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {incorrectQuestions.length > 0 && (
            <div>
              <h4 className="text-md font-medium text-white mb-3">
                Areas for Improvement
              </h4>
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-gray-300 text-sm mb-2">
                  You answered {incorrectQuestions.length} question{incorrectQuestions.length > 1 ? 's' : ''} incorrectly. 
                  Focus on studying these topics to improve your performance.
                </p>
                
                {incorrectQuestions.length <= 3 ? (
                  <div className="mt-2 space-y-2">
                    {incorrectQuestions.map((q, idx) => (
                      <div key={idx} className="flex items-start">
                        <span className="text-red-500 mr-2">•</span>
                        <span className="text-gray-300">{q.question}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-2 space-y-2">
                    {/* Show a sample of incorrect questions (first 3) */}
                    {incorrectQuestions.slice(0, 3).map((q, idx) => (
                      <div key={idx} className="flex items-start">
                        <span className="text-red-500 mr-2">•</span>
                        <span className="text-gray-300">{q.question}</span>
                      </div>
                    ))}
                    {/* Show a message about more questions */}
                    <div className="flex items-start">
                      <span className="text-red-500 mr-2">•</span>
                      <span className="text-gray-300 italic">
                        And {incorrectQuestions.length - 3} more question{incorrectQuestions.length - 3 > 1 ? 's' : ''}...
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-blue-400">
                      Review the study recommendations below for detailed topics to improve your understanding.
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <EnvironmentDetectionProvider
      assessmentId={params.id}
      onEnvironmentRisk={(riskLevel, details) => {
        setEnvironmentRisk(riskLevel);
        if (riskLevel === 'high' && assessmentStatus === "in-progress") {
          handleCheatingDetected("High-risk environment detected during assessment");
        }
      }}
    >
      <div className="min-h-screen bg-gray-950 p-8">
        <div className="max-w-4xl mx-auto">
          {assessmentStatus === "disqualified" ? (
            <DisqualificationScreen assessmentId={params.id} />
          ) : loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-800 rounded w-1/4"></div>
              <div className="h-4 bg-gray-800 rounded w-1/2"></div>
              <div className="h-64 bg-gray-800 rounded-xl"></div>
            </div>
          ) : error ? (
            <div className="text-center p-8">
              <div className="text-red-500 py-8">{error}</div>
              <button
                onClick={() => router.push('/skill-assessment')}
                className="mx-auto block px-6 py-3 bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-600 hover:to-blue-500 text-white font-medium rounded-lg shadow-lg shadow-blue-900/20 transition-all duration-200"
              >
                Back to Assessments
              </button>
            </div>
          ) : !assessment ? (
            <div className="text-center p-8">
              <div className="text-red-500 py-8">Assessment not found</div>
              <button
                onClick={() => router.push('/skill-assessment')}
                className="mx-auto block px-6 py-3 bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-600 hover:to-blue-500 text-white font-medium rounded-lg shadow-lg shadow-blue-900/20 transition-all duration-200"
              >
                Back to Assessments
              </button>
            </div>
          ) : assessmentStatus === "intro" ? (
          <div>
            <button
              onClick={() => router.push('/skill-assessment')}
              className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 mb-8 group"
            >
              <FaArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1" />
              <span>Back to Assessments</span>
            </button>
            
            <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-xl overflow-hidden">
              <div className="p-6 border-b border-gray-800">
                <h1 className="text-2xl font-bold text-white mb-2">{assessment.title}</h1>
                <p className="text-gray-300 text-sm">{assessment.description}</p>
              </div>
              
              {assessment.longDescription && (
                <div className="p-6 border-b border-gray-800">
                  <h2 className="text-lg font-semibold text-white mb-2">About this Assessment</h2>
                  <p className="text-gray-300 text-sm">{assessment.longDescription}</p>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0.5 bg-gray-800">
                <div className="bg-gray-900 p-6">
                  <h3 className="text-md font-medium text-white mb-3 flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    Assessment Details
                  </h3>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-center justify-between">
                      <span className="text-gray-400">Category</span>
                      <span className="text-blue-400 font-medium">{assessment.category}</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="text-gray-400">Difficulty</span>
                      <span className="text-blue-400 font-medium">{assessment.difficulty}</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="text-gray-400">Questions</span>
                      <span className="text-blue-400 font-medium">{questions.length}</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="text-gray-400">Time Limit</span>
                      <span className="text-blue-400 font-medium">{assessment.duration} minutes</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="text-gray-400">Passing Score</span>
                      <span className="text-blue-400 font-medium">{assessment.passPercentage}%</span>
                    </li>
                  </ul>
                </div>
                
                {assessment.prerequisites && assessment.prerequisites.length > 0 ? (
                  <div className="bg-gray-900 p-6">
                    <h3 className="text-md font-medium text-white mb-3 flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      Prerequisites
                    </h3>
                    <ul className="list-none space-y-2 text-sm">
                      {assessment.prerequisites.map((prereq, index) => (
                        <li key={index} className="flex items-center text-gray-300">
                          <span className="mr-2 text-blue-400">•</span>
                          {prereq}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="bg-gray-900 p-6 flex flex-col items-center justify-center">
                    <div className="text-center max-w-xs">
                      <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                        <FaCheck className="text-blue-400 w-5 h-5" />
                      </div>
                      <h3 className="text-md font-medium text-white mb-1">Ready to Begin</h3>
                      <p className="text-gray-400 text-sm">This assessment has no prerequisites. You can start immediately.</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-6">
                <button
                  onClick={prepareToStartAssessment}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-600 hover:to-blue-500 text-white font-medium rounded-lg shadow-lg shadow-blue-900/20 transition-all duration-200 flex items-center justify-center"
                >
                  <span>Start Assessment</span>
                  <FaArrowRight className="ml-2 w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ) : assessmentStatus === "environment-check" ? (
          <div>
            <button
              onClick={() => {
                setAssessmentStatus("intro");
                setEnvironmentVerified(false);
                setShowEnvironmentModal(false);
              }}
              className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 mb-8 group"
            >
              <FaArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1" />
              <span>Back to Assessment Info</span>
            </button>
            
            <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-xl overflow-hidden">
              <div className="p-6 border-b border-gray-800">
                <h1 className="text-2xl font-bold text-white mb-2">Environment Security Check</h1>
                <p className="text-gray-300 text-sm">Verifying your environment meets security requirements for this assessment</p>
              </div>
              
              <div className="p-6">
                {environmentLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <h2 className="text-xl font-semibold text-white mb-2">
                      Analyzing Environment
                    </h2>
                    <p className="text-gray-400">
                      Checking for virtual machines, remote access tools, and other security concerns...
                    </p>
                  </div>
                ) : detectionResult ? (
                  <div className="text-center py-8">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                      detectionResult.isRemoteAccess || detectionResult.isVirtualMachine 
                        ? 'bg-red-500/20 text-red-500' 
                        : 'bg-green-500/20 text-green-500'
                    }`}>
                      {detectionResult.isRemoteAccess || detectionResult.isVirtualMachine ? (
                        <FaTimes className="w-8 h-8" />
                      ) : (
                        <FaCheck className="w-8 h-8" />
                      )}
                    </div>
                    <h2 className="text-xl font-semibold text-white mb-2">
                      {detectionResult.isRemoteAccess || detectionResult.isVirtualMachine 
                        ? 'Security Concerns Detected' 
                        : 'Environment Verified'}
                    </h2>
                    <p className="text-gray-400 mb-6">
                      {detectionResult.isRemoteAccess || detectionResult.isVirtualMachine 
                        ? 'Your environment may not meet the security requirements for this assessment.' 
                        : 'Your environment meets all security requirements.'}
                    </p>
                    
                    {!detectionResult.isRemoteAccess && !detectionResult.isVirtualMachine && (
                      <button
                        onClick={() => setShowConsentModal(true)}
                        className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-medium rounded-lg shadow-lg shadow-green-900/20 transition-all duration-200"
                      >
                        Continue to Camera Setup
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-red-500 mb-4">
                      <FaTimes className="w-12 h-12 mx-auto" />
                    </div>
                    <h2 className="text-xl font-semibold text-white mb-2">
                      Environment Check Failed
                    </h2>
                    <p className="text-gray-400 mb-6">
                      Unable to verify your environment. Please refresh and try again.
                    </p>
                    <button
                      onClick={() => {
                        rerunDetection();
                        toast.info("Retrying environment check...");
                      }}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-all duration-200"
                    >
                      Retry Check
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : assessmentStatus === "results" ? (
          <div>
            <button
              onClick={() => router.push('/skill-assessment')}
              className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 mb-8 group"
            >
              <FaArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1" />
              <span>Back to Assessments</span>
            </button>
            
            <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-xl overflow-hidden mb-10">
              <div className="p-6 border-b border-gray-800 flex flex-col md:flex-row items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-white mb-1">{assessment?.title} Results</h1>
                  <p className="text-gray-400">Assessment completed</p>
                </div>
                <div className="mt-4 md:mt-0 flex items-center">
                  <div className={`text-xl font-bold ${result?.isPassing ? 'text-green-500' : 'text-red-500'}`}>
                    {result?.percentage}%
                  </div>
                  <div className="mx-3 text-gray-600">|</div>
                  <div className="text-gray-300">
                    {result?.score} / {result?.maxScore} points
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-white">Question Breakdown</h2>
                  {result?.isPassing ? (
                    <div className="bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-sm font-medium">
                      Passed
                    </div>
                  ) : (
                    <div className="bg-red-500/10 text-red-500 px-3 py-1 rounded-full text-sm font-medium">
                      Failed
                    </div>
                  )}
                </div>
                
                <div className="space-y-6">
                  {result?.answersByQuestion.map((answer, index) => (
                    <div key={answer.questionId} className="p-4 bg-gray-800 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <span className="text-gray-400 mr-2">{index + 1}.</span>
                            <span className="text-white">{answer.question}</span>
                          </div>
                          
                          {/* Display time spent on this question */}
                          <div className="flex items-center text-sm text-gray-400 mt-1">
                            <FaClock className="mr-1 w-3 h-3" />
                            <span>
                              Time spent: {Math.floor(questionTimings[answer.questionId] / 60)}m {questionTimings[answer.questionId] % 60}s
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          {answer.correct ? (
                            <div className="flex items-center">
                              <FaCheck className="text-green-500 mr-1" />
                              <span className="text-green-500 font-medium">{answer.points} pts</span>
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <FaTimes className="text-red-500 mr-1" />
                              <span className="text-red-500 font-medium">0 pts</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Render time analytics section */}
            {renderTimeAnalytics()}
            
            {/* Render study recommendations */}
            {renderStudyRecommendations()}
          </div>
        ) : (
          // In-progress UI
          <>
            <div className="flex justify-between items-center mb-5">
              <div className="bg-gray-900/80 border border-gray-800 rounded-full px-4 py-1.5 text-sm text-gray-300">
                Question {currentQuestionIndex + 1} of {questions.length}
              </div>
              <div className="flex items-center bg-gray-900/80 border border-gray-800 rounded-full px-4 py-1.5">
                <div className={`mr-2 w-2 h-2 rounded-full ${remainingTime < 60 ? 'bg-red-500 animate-pulse' : 'bg-blue-500'}`}></div>
                <span className="text-sm font-mono text-gray-300">{formatTime(remainingTime)}</span>
              </div>
            </div>
            
            <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-xl overflow-hidden mb-5">
              <div className="p-6 border-b border-gray-800">
                <h2 className="text-xl font-semibold text-white mb-2">
                  {currentQuestion?.question}
                </h2>
                
                <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-1 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="p-6">
                {currentQuestion?.type === "multiple-choice" && (
                  <div className="space-y-3">
                    {currentQuestion.answerType === "multiple" && (
                      <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg text-sm">
                        <div className="flex items-center">
                          <FaInfoCircle className="mr-2 flex-shrink-0" />
                          <p>This question has multiple correct answers. Select all that apply.</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 gap-3">
                      {currentQuestion.options?.map((option) => {
                        const isSelected = userAnswers.find(a => a.questionId === currentQuestion.id)?.selectedOptions.includes(option.id);
                        
                        return (
                          <div
                            key={option.id}
                            onClick={() => {
                              const selectedOptions = userAnswers.find(a => 
                                a.questionId === currentQuestion.id
                              )?.selectedOptions || [];
                              
                              let newSelectedOptions: string[];
                              
                              if (currentQuestion.answerType === "single") {
                                // For single choice, replace the selection
                                newSelectedOptions = [option.id];
                              } else {
                                // For multi-choice, toggle the selection
                                if (selectedOptions.includes(option.id)) {
                                  newSelectedOptions = selectedOptions.filter(id => id !== option.id);
                                } else {
                                  newSelectedOptions = [...selectedOptions, option.id];
                                }
                              }
                              
                              handleAnswerSubmit({
                                questionId: currentQuestion.id,
                                selectedOptions: newSelectedOptions
                              });
                            }}
                            className={`flex items-center p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                              isSelected
                                ? "bg-blue-600 text-white border border-blue-500 shadow-lg shadow-blue-900/20"
                                : "bg-gray-800 text-gray-300 hover:bg-gray-750 border border-gray-700"
                            }`}
                          >
                            <div className={`w-6 h-6 flex items-center justify-center rounded-full mr-3 transition-colors ${
                              isSelected ? "bg-white text-blue-500" : "bg-gray-700 text-gray-600"
                            }`}>
                              {isSelected && <FaCheck className="w-3 h-3" />}
                            </div>
                            <span className="text-sm">{option.text}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {currentQuestion?.type === "true-false" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {currentQuestion.options?.map((option) => {
                      const isSelected = userAnswers.find(a => a.questionId === currentQuestion.id)?.selectedOptions.includes(option.id);
                      
                      return (
                        <div
                          key={option.id}
                          onClick={() => {
                            handleAnswerSubmit({
                              questionId: currentQuestion.id,
                              selectedOptions: [option.id]
                            });
                          }}
                          className={`flex items-center p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                            isSelected
                              ? "bg-blue-600 text-white border border-blue-500 shadow-lg shadow-blue-900/20"
                              : "bg-gray-800 text-gray-300 hover:bg-gray-750 border border-gray-700"
                          }`}
                        >
                          <div className={`w-6 h-6 flex items-center justify-center rounded-full mr-3 transition-colors ${
                            isSelected ? "bg-white text-blue-500" : "bg-gray-700 text-gray-600"
                          }`}>
                            {isSelected && <FaCheck className="w-3 h-3" />}
                          </div>
                          <span className="text-sm">{option.text}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
                
                {(currentQuestion?.type === "text" || currentQuestion?.type === "coding") && (
                  <div className="space-y-4">
                    <textarea
                      value={userAnswers.find(a => a.questionId === currentQuestion.id)?.text || ""}
                      onChange={(e) => {
                        setUserAnswers(prev => {
                          const updatedAnswers = [...prev];
                          const existingIndex = updatedAnswers.findIndex(a => a.questionId === currentQuestion.id);
                          
                          const updatedAnswer = {
                            questionId: currentQuestion.id,
                            selectedOptions: [],
                            text: e.target.value
                          };
                          
                          if (existingIndex >= 0) {
                            updatedAnswers[existingIndex] = updatedAnswer;
                          } else {
                            updatedAnswers.push(updatedAnswer);
                          }
                          
                          return updatedAnswers;
                        });
                      }}
                      rows={8}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder={currentQuestion.type === "coding" ? "Write your code here..." : "Write your answer here..."}
                    />
                    {currentQuestion.type === "coding" && currentQuestion.codeSnippet && (
                      <div className="mt-3">
                        <div className="text-sm font-medium text-gray-300 mb-1 flex items-center">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                          Reference Code
                        </div>
                        <pre className="bg-gray-800 p-4 rounded-lg text-sm text-gray-300 overflow-x-auto border border-gray-700">
                          {currentQuestion.codeSnippet}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <button
                onClick={goToPreviousQuestion}
                disabled={currentQuestionIndex === 0}
                className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200 ${
                  currentQuestionIndex === 0
                    ? "bg-gray-800 text-gray-600 cursor-not-allowed opacity-50"
                    : "bg-gray-800 border border-gray-700 text-white hover:bg-gray-700"
                }`}
              >
                <FaArrowLeft className="w-4 h-4 mr-2" />
                <span>Previous</span>
              </button>
              
              {currentQuestionIndex < questions.length - 1 ? (
                <button
                  onClick={goToNextQuestion}
                  className="flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-lg shadow-blue-900/20 transition-all duration-200"
                >
                  <span>Next</span>
                  <FaArrowRight className="w-4 h-4 ml-2" />
                </button>
              ) : (
                <button
                  onClick={submitAssessment}
                  className="flex items-center px-5 py-2.5 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white rounded-lg shadow-lg shadow-green-900/20 transition-all duration-200"
                >
                  <span>Submit Assessment</span>
                  <FaCheck className="w-4 h-4 ml-2" />
                </button>
              )}
            </div>
            
            {/* Hidden eye tracking components */}
            <div className="hidden">
              {proctorActive && !showProctorVideo && (
                <EyeTrackingProctor
                  isActive={proctorActive}
                  onCheatingDetected={handleCheatingDetected}
                  showVideo={false}
                  disqualificationThreshold={5}
                />
              )}
            </div>
            
            <div className="fixed bottom-4 right-4">
              <div className="flex flex-col items-end space-y-2">
                {proctorActive && showProctorVideo && (
                  <div className="bg-gray-900 border border-gray-800 rounded-xl p-2 shadow-2xl overflow-hidden transition-all duration-300 hover:scale-105">
                    <EyeTrackingProctor
                      isActive={proctorActive}
                      onCheatingDetected={handleCheatingDetected}
                      showVideo={true}
                      disqualificationThreshold={5}
                    />
                  </div>
                )}
                
                {proctorActive && (
                  <button
                    onClick={toggleProctorVideo}
                    className="bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 border border-gray-700"
                    title={showProctorVideo ? "Hide webcam" : "Show webcam"}
                  >
                    {showProctorVideo ? <FaVideo /> : <FaEye />}
                  </button>
                )}
              </div>
            </div>
          </>
        )}
        
        {/* Proctor consent modal */}
        <ProctorConsentModal
          isOpen={showConsentModal}
          onAccept={handleConsentAccept}
          onDecline={handleConsentDecline}
        />
        
        {/* Environment detection modal */}
        {detectionResult && (
          <EnvironmentDetectionModal
            isOpen={showEnvironmentModal}
            onProceed={handleEnvironmentProceed}
            onCancel={handleEnvironmentCancel}
            detectionResult={detectionResult}
          />
        )}
      </div>
      </div>
    </EnvironmentDetectionProvider>
  );
} 