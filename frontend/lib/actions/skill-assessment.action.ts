"use server";

import { db } from "@/firebase/admin";
import { revalidatePath } from "next/cache";
import { FieldValue } from "firebase-admin/firestore";
import { v4 as uuidv4 } from "uuid";

/**
 * Types for skill assessments
 */
export type SkillCategory = 'technical' | 'soft-skills' | 'certification';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type QuestionType = 'multiple-choice' | 'coding' | 'true-false' | 'text';
export type AnswerType = 'single' | 'multiple';

export interface SkillAssessment {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  category: SkillCategory;
  difficulty: DifficultyLevel;
  duration: number; // in minutes
  questionsCount: number;
  passPercentage: number;
  popularity: number; // 1-5 scale
  completions: number;
  averageScore: number;
  tags: string[];
  prerequisites?: string[];
  skills?: string[];
  questions?: string[]; // Reference to question IDs
  isPublished: boolean;
  createdAt: any; // Firestore timestamp
  updatedAt: any; // Firestore timestamp
}

export interface AssessmentOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface AssessmentQuestion {
  id: string;
  assessmentId: string;
  question: string;
  type: QuestionType;
  answerType?: AnswerType;
  options?: AssessmentOption[];
  explanation?: string;
  codeSnippet?: string;
  timeLimit?: number; // in seconds
  points: number;
  order: number;
  createdAt: any; // Firestore timestamp
  updatedAt: any; // Firestore timestamp
}

export interface CodingProblem {
  id: string;
  assessmentId: string;
  title: string;
  description: string;
  difficulty: DifficultyLevel;
  timeLimit: number; // in minutes
  memoryLimit: number; // in MB
  testCases: {
    input: string;
    expectedOutput: string;
  }[];
  starterCode: {
    [key: string]: string; // language -> code
  };
  solution: {
    [key: string]: string; // language -> code
  };
  points: number;
  createdAt: any;
  updatedAt: any;
}

// User assessment tracking interfaces
export interface UserQuestionAttempt {
  questionId: string;
  timeSpentInSeconds: number;
  selectedOptions: string[];
  isCorrect: boolean;
}

export interface UserAssessmentResult {
  id: string;
  userId: string;
  assessmentId: string;
  score: number;
  maxScore: number;
  percentage: number;
  isPassing: boolean;
  timeSpentInSeconds: number;
  questionAttempts: UserQuestionAttempt[];
  studyRecommendations?: string[];
  createdAt: any; // Firestore timestamp
}

// Helper function to serialize Firestore data
const serializeFirestoreData = (data: any) => {
  if (!data) return null;
  
  const serialized: any = { ...data };
  
  // Convert Firestore Timestamps to ISO strings
  if (data.createdAt && typeof data.createdAt.toDate === 'function') {
    serialized.createdAt = data.createdAt.toDate().toISOString();
  }
  if (data.updatedAt && typeof data.updatedAt.toDate === 'function') {
    serialized.updatedAt = data.updatedAt.toDate().toISOString();
  }
  
  // Handle nested objects and arrays
  Object.keys(serialized).forEach(key => {
    if (typeof serialized[key] === 'object' && serialized[key] !== null) {
      // Check if it's an array-like object (with numeric keys)
      if (!Array.isArray(serialized[key]) && typeof serialized[key] === 'object') {
        const keys = Object.keys(serialized[key]);
        const isArrayLike = keys.length > 0 && 
                            keys.every(k => !isNaN(Number(k))) && 
                            keys.length === Number(keys[keys.length - 1]) + 1;
        
        if (isArrayLike) {
          // Convert to a proper array
          const array: any[] = [];
          for (let i = 0; i < keys.length; i++) {
            const item = serialized[key][i];
            array.push(typeof item === 'object' && item !== null ? 
                      serializeFirestoreData(item) : item);
          }
          serialized[key] = array;
        } else {
          // Regular object
          serialized[key] = serializeFirestoreData(serialized[key]);
        }
      } else if (Array.isArray(serialized[key])) {
        // Handle regular arrays
        serialized[key] = serialized[key].map((item: any) => 
          typeof item === 'object' && item !== null ? 
            serializeFirestoreData(item) : item
        );
      } else {
        // Regular object
        serialized[key] = serializeFirestoreData(serialized[key]);
      }
    }
  });
  
  return serialized;
};

/**
 * Get all skill assessments with optional filtering
 */
export async function getSkillAssessments(params: {
  category?: SkillCategory | 'all' | 'trending';
  limit?: number;
  isAdmin?: boolean;
} = {}) {
  try {
    const { category = 'all', limit = 50, isAdmin = false } = params;
    
    let query = db.collection("skillAssessments")
      .orderBy("createdAt", "desc");
    
    // Only filter by published status for non-admin users
    if (!isAdmin) {
      query = query.where("isPublished", "==", true);
    }
    
    if (category !== 'all') {
      if (category === 'trending') {
        query = query.where("popularity", ">=", 4);
      } else {
        query = query.where("category", "==", category);
      }
    }
    
    if (limit) {
      query = query.limit(limit);
    }
    
    const assessmentsSnapshot = await query.get();
    
    const assessments = assessmentsSnapshot.docs.map(doc => {
      const data = doc.data() || {};
      return {
        id: doc.id,
        ...serializeFirestoreData(data)
      };
    }) as SkillAssessment[];
    
    return { success: true, data: assessments };
  } catch (error) {
    console.error("Error fetching skill assessments:", error);
    return { success: false, message: "Failed to fetch skill assessments" };
  }
}

/**
 * Get a single skill assessment by ID with its questions
 */
export async function getSkillAssessmentById(id: string) {
  console.log(`getSkillAssessmentById called with id: ${id}`);
  
  if (!id) {
    console.error('Invalid assessment ID: ID is empty or undefined');
    return { success: false, message: "Invalid assessment ID" };
  }
  
  try {
    // Get the assessment document
    console.log(`Fetching assessment document for ID: ${id}`);
    const assessmentDoc = await db.collection("skillAssessments").doc(id).get();
    
    if (!assessmentDoc.exists) {
      console.error(`Assessment not found: No document exists with ID ${id}`);
      return { success: false, message: "Assessment not found" };
    }
    
    const data = assessmentDoc.data() || {};
    console.log(`Raw assessment data:`, data);
    
    const assessment = {
      id: assessmentDoc.id,
      ...serializeFirestoreData(data)
    } as SkillAssessment;
    
    console.log(`Assessment serialized:`, assessment);
    
    // Fetch questions if they exist
    let questions: AssessmentQuestion[] = [];
    
    try {
      console.log('Fetching questions for assessment:', id);
      
      // IMPORTANT CHANGE: First try to get questions by assessmentId directly
      // This is more reliable as it gets all questions that reference this assessment
      const questionsByAssessmentIdSnapshot = await db.collection("assessmentQuestions")
        .where("assessmentId", "==", id)
        .orderBy("order", "asc")
        .get();
      
      if (!questionsByAssessmentIdSnapshot.empty) {
        console.log(`Found ${questionsByAssessmentIdSnapshot.size} question documents by assessmentId`);
        
        questions = questionsByAssessmentIdSnapshot.docs.map(doc => {
          const questionData = doc.data() || {};
          return {
            id: doc.id,
            ...serializeFirestoreData(questionData)
          };
        }) as AssessmentQuestion[];
        
        // Update the assessment's questions array with the found question IDs
        const foundQuestionIds = questions.map(q => q.id);
        if (foundQuestionIds.length > 0 && 
            (!assessment.questions || 
             !Array.isArray(assessment.questions) || 
             assessment.questions.length !== foundQuestionIds.length ||
             !assessment.questions.every(id => foundQuestionIds.includes(id)))) {
          console.log('Updating assessment with found question IDs:', foundQuestionIds);
          await db.collection("skillAssessments").doc(id).update({
            questions: foundQuestionIds,
            questionsCount: foundQuestionIds.length,
            updatedAt: FieldValue.serverTimestamp()
          });
          
          // Update the local assessment object
          assessment.questions = foundQuestionIds;
          assessment.questionsCount = foundQuestionIds.length;
        }
      } 
      // If no questions found by assessmentId, try to get by question IDs as fallback
      else if (assessment.questions && Array.isArray(assessment.questions) && assessment.questions.length > 0) {
        console.log(`No questions found by assessmentId, trying question IDs: ${assessment.questions.length} IDs`);
        
        // Firestore "in" queries have a limit of 10 items, so we may need to do multiple queries
        const chunks: any[] = [];
        const questionIds = assessment.questions;
        for (let i = 0; i < questionIds.length; i += 10) {
          chunks.push(questionIds.slice(i, i + 10));
        }
        
        let allQuestions: AssessmentQuestion[] = [];
        
        for (const chunk of chunks) {
          if (chunk.length === 0) continue;
          
          const questionsSnapshot = await db.collection("assessmentQuestions")
            .where("id", "in", chunk)
            .get();
          
          if (!questionsSnapshot.empty) {
            const chunkQuestions = questionsSnapshot.docs.map(doc => {
              const questionData = doc.data() || {};
              return {
                id: doc.id,
                ...serializeFirestoreData(questionData)
              };
            }) as AssessmentQuestion[];
            
            allQuestions = [...allQuestions, ...chunkQuestions];
          }
        }
        
        if (allQuestions.length > 0) {
          console.log(`Found ${allQuestions.length} questions by IDs`);
          questions = allQuestions.sort((a, b) => (a.order || 0) - (b.order || 0));
        } else {
          console.warn('No questions found by IDs either');
        }
      }
      
      // Update the assessment's questionsCount if necessary
      if (assessment.questionsCount !== questions.length) {
        console.log(`Updating assessment questionsCount from ${assessment.questionsCount} to ${questions.length}`);
        await db.collection("skillAssessments").doc(id).update({
          questionsCount: questions.length,
          updatedAt: FieldValue.serverTimestamp()
        });
        assessment.questionsCount = questions.length;
      }
      
      // If we still have no questions but there are IDs, there might be an issue with the IDs
      if (questions.length === 0 && assessment.questions && 
          Array.isArray(assessment.questions) && assessment.questions.length > 0) {
        console.warn('Assessment has question IDs but no questions found:', assessment.questions);
      }
      
    } catch (questionsError) {
      console.error(`Error fetching questions for assessment ${id}:`, questionsError);
      // Continue without questions rather than failing the whole request
    }
    
    // Make sure we have the correct questions array for the result
    const result = {
      success: true, 
      data: { 
        ...assessment,
        questions: questions // This is the critical part: returning the actual question objects
      } 
    };
    
    console.log(`Returning assessment result with ${questions.length} questions`);
    return result;
  } catch (error) {
    console.error(`Error fetching skill assessment ${id}:`, error);
    return { 
      success: false, 
      message: `Failed to fetch skill assessment: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Create a new skill assessment
 */
export async function createSkillAssessment(assessment: Omit<SkillAssessment, 'id' | 'createdAt' | 'updatedAt' | 'isPublished' | 'popularity' | 'questionsCount' | 'completions' | 'averageScore'>) {
  try {
    const assessmentId = uuidv4();
    const now = FieldValue.serverTimestamp();
    
    const newAssessment: SkillAssessment = {
      ...assessment,
      id: assessmentId,
      createdAt: now,
      updatedAt: now,
      questions: [],
      isPublished: false,
      questionsCount: 0,
      completions: 0,
      averageScore: 0,
      popularity: 1
    };
    
    await db.collection("skillAssessments").doc(assessmentId).set(newAssessment);
    
    revalidatePath('/manage-skill-assessment');
    return { 
      success: true, 
      data: {
        ...newAssessment,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error("Error creating skill assessment:", error);
    return { success: false, message: "Failed to create skill assessment" };
  }
}

/**
 * Update an existing skill assessment
 */
export async function updateSkillAssessment(id: string, assessment: Partial<SkillAssessment>) {
  try {
    const now = FieldValue.serverTimestamp();
    
    await db.collection("skillAssessments").doc(id).update({
      ...assessment,
      updatedAt: now
    });
    
    revalidatePath('/manage-skill-assessment');
    return { success: true };
  } catch (error) {
    console.error("Error updating skill assessment:", error);
    return { success: false, message: "Failed to update skill assessment" };
  }
}

/**
 * Delete a skill assessment
 */
export async function deleteSkillAssessment(id: string) {
  try {
    // First delete all associated questions
    const questionsSnapshot = await db.collection("assessmentQuestions")
      .where("assessmentId", "==", id)
      .get();
    
    const batch = db.batch();
    
    questionsSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    // Then delete the assessment
    batch.delete(db.collection("skillAssessments").doc(id));
    
    await batch.commit();
    
    revalidatePath('/manage-skill-assessment');
    return { success: true };
  } catch (error) {
    console.error("Error deleting skill assessment:", error);
    return { success: false, message: "Failed to delete skill assessment" };
  }
}

/**
 * Create a new assessment question
 */
export async function createAssessmentQuestion(question: Omit<AssessmentQuestion, 'id' | 'createdAt' | 'updatedAt'>) {
  try {
    const questionId = uuidv4();
    const now = FieldValue.serverTimestamp();
    
    // Ensure the question has all required fields
    if (!question.assessmentId) {
      console.error("Missing assessmentId in question data");
      return { success: false, message: "Assessment ID is required" };
    }
    
    const newQuestion: AssessmentQuestion = {
      ...question,
      id: questionId,
      createdAt: now,
      updatedAt: now
    };
    
    console.log(`Creating new question for assessment ${question.assessmentId}:`, newQuestion);
    
    // Save the question document
    await db.collection("assessmentQuestions").doc(questionId).set(newQuestion);
    console.log(`Question document created with ID: ${questionId}`);
    
    // Get the current assessment data
    const assessmentId = question.assessmentId;
    const assessmentRef = db.collection("skillAssessments").doc(assessmentId);
    const assessmentDoc = await assessmentRef.get();
    
    if (!assessmentDoc.exists) {
      console.error(`Cannot update assessment: Assessment with ID ${assessmentId} not found`);
      // Still return success as the question was created
      return { 
        success: true, 
        data: {
          ...newQuestion,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      };
    }
    
    const assessmentData = assessmentDoc.data() || {};
    console.log(`Retrieved assessment data for update:`, assessmentData);
    
    // Get existing questions array or create a new one
    const existingQuestions = Array.isArray(assessmentData.questions) ? assessmentData.questions : [];
    const newQuestions = [...existingQuestions, questionId];
    const newCount = (assessmentData.questionsCount || 0) + 1;
    
    console.log(`Updating assessment questions array to include new question. New count: ${newCount}`);
    
    // Update the assessment document
    await assessmentRef.update({
      // Update the questions array with the new question ID
      questions: newQuestions,
      // Update the questionsCount
      questionsCount: newCount,
      updatedAt: now
    });
    
    console.log(`Assessment updated successfully`);
    
    // Revalidate the paths
    revalidatePath(`/manage-skill-assessment/${question.assessmentId}`);
    revalidatePath(`/skill-assessment/${question.assessmentId}`);
    
    return { 
      success: true, 
      data: {
        ...newQuestion,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error("Error creating assessment question:", error);
    return { success: false, message: "Failed to create assessment question" };
  }
}

/**
 * Update an existing assessment question
 */
export async function updateAssessmentQuestion(id: string, question: Partial<AssessmentQuestion>) {
  try {
    const now = FieldValue.serverTimestamp();
    
    await db.collection("assessmentQuestions").doc(id).update({
      ...question,
      updatedAt: now
    });
    
    revalidatePath(`/manage-skill-assessment/${question.assessmentId}`);
    return { success: true };
  } catch (error) {
    console.error("Error updating assessment question:", error);
    return { success: false, message: "Failed to update assessment question" };
  }
}

/**
 * Delete an assessment question
 */
export async function deleteAssessmentQuestion(questionId: string, assessmentId: string) {
  try {
    const now = FieldValue.serverTimestamp();
    
    // Delete the question document
    await db.collection("assessmentQuestions").doc(questionId).delete();
    
    // Get the current assessment data to update both questions array and questionsCount
    const assessmentRef = db.collection("skillAssessments").doc(assessmentId);
    const assessmentDoc = await assessmentRef.get();
    
    if (assessmentDoc.exists) {
      const assessmentData = assessmentDoc.data() || {};
      
      // Update the assessment document
      await assessmentRef.update({
        // Remove the question ID from the questions array
        questions: FieldValue.arrayRemove(questionId),
        // Decrement the questionsCount, but don't go below 0
        questionsCount: Math.max(0, (assessmentData.questionsCount || 1) - 1),
        updatedAt: now
      });
    }
    
    // Revalidate the paths here
    revalidatePath(`/manage-skill-assessment/${assessmentId}`);
    revalidatePath(`/skill-assessment/${assessmentId}`);
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting assessment question:", error);
    return { success: false, message: "Failed to delete assessment question" };
  }
}

/**
 * Save user assessment results with timing data for analytics
 */
export async function saveUserAssessmentResults(userId: string, assessmentId: string, results: {
  score: number;
  maxScore: number;
  percentage: number;
  isPassing: boolean;
  timeSpentInSeconds: number;
  questionAttempts: UserQuestionAttempt[];
}) {
  try {
    const resultId = uuidv4();
    const now = FieldValue.serverTimestamp();
    
    // Create the assessment result document
    const userAssessmentResult: UserAssessmentResult = {
      id: resultId,
      userId,
      assessmentId,
      ...results,
      createdAt: now,
    };
    
    // Save to the userAssessmentResults collection
    await db.collection("userAssessmentResults").doc(resultId).set(userAssessmentResult);
    
    // Update the assessment document with completion stats
    const assessmentRef = db.collection("skillAssessments").doc(assessmentId);
    await assessmentRef.update({
      completions: FieldValue.increment(1),
      // Update average score (we'll need to get current average and recalculate)
      // This is a simplistic approach - a more accurate method might use a cloud function
      // to calculate the true average
      averageScore: results.percentage,
      updatedAt: now
    });
    
    return { 
      success: true, 
      data: { 
        ...userAssessmentResult, 
        createdAt: new Date().toISOString() 
      } 
    };
  } catch (error) {
    console.error("Error saving assessment results:", error);
    return { success: false, message: "Failed to save assessment results" };
  }
}

/**
 * Get the most recent assessment result for a user
 */
export async function getUserLatestAssessmentResult(userId: string) {
  try {
    const resultsSnapshot = await db.collection("userAssessmentResults")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .limit(1)
      .get();
    
    if (resultsSnapshot.empty) {
      return { success: true, data: null };
    }
    
    const resultDoc = resultsSnapshot.docs[0];
    const resultData = resultDoc.data() || {};
    
    const result = {
      id: resultDoc.id,
      ...serializeFirestoreData(resultData)
    } as UserAssessmentResult;
    
    return { success: true, data: result };
  } catch (error) {
    console.error("Error fetching user assessment result:", error);
    return { success: false, message: "Failed to fetch assessment result" };
  }
}

/**
 * Get all assessment results for admin analytics
 */
export async function getAllAssessmentResults(assessmentId: string) {
  try {
    const resultsSnapshot = await db.collection("userAssessmentResults")
      .where("assessmentId", "==", assessmentId)
      .orderBy("createdAt", "desc")
      .get();
    
    const results = resultsSnapshot.docs.map(doc => {
      const data = doc.data() || {};
      return {
        id: doc.id,
        ...serializeFirestoreData(data)
      };
    }) as UserAssessmentResult[];
    
    return { success: true, data: results };
  } catch (error) {
    console.error("Error fetching assessment results:", error);
    return { success: false, message: "Failed to fetch assessment results" };
  }
}
