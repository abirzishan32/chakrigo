"use server";

import { isAdmin } from "./auth.action";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { AssessmentOption, AssessmentQuestion, DifficultyLevel, QuestionType, SkillAssessment, SkillCategory, UserQuestionAttempt } from "./skill-assessment.action";

// Define schema for multiple-choice question generation
const multipleChoiceQuestionSchema = z.object({
  questions: z.array(z.object({
    question: z.string(),
    options: z.array(z.object({
      text: z.string(),
      isCorrect: z.boolean()
    })).min(2).max(5)
  })).min(1).max(20)
});

// Define schema for study recommendations
const studyRecommendationsSchema = z.object({
  topics: z.array(z.object({
    topic: z.string(),
    description: z.string(),
    relevance: z.string(),
    resources: z.array(z.object({
      title: z.string(),
      description: z.string().optional(),
      type: z.enum(["article", "video", "course", "documentation", "practice", "other"]).optional(),
    })).min(1).max(3)
  })).min(1).max(5)
});

// Define parameters for question generation
export interface GenerateAssessmentQuestionsParams {
  category: SkillCategory;
  difficulty: DifficultyLevel;
  count: number;
  questionType: QuestionType;
  title?: string;
  description?: string;
  currentQuestions?: string[];
}

// Define tools for the study recommendations agent
interface AnalyzeMissedQuestionsArgs {
  questions: {
    question: string;
    timeTaken: number;
    isCorrect: boolean;
  }[];
  category: string;
}

interface GenerateLearningResourcesArgs {
  topic: string;
  difficulty: string;
  category: string;
}

// New schemas for agent tools
const topicAnalysisSchema = z.object({
  topics: z.array(z.object({
    name: z.string(),
    relevance: z.number().min(1).max(10),
    subtopics: z.array(z.string()),
    difficulty: z.enum(["beginner", "intermediate", "advanced"])
  })).min(1).max(5)
});

const resourceRecommendationsSchema = z.object({
  resources: z.array(z.object({
    title: z.string(),
    type: z.enum(["article", "video", "course", "documentation", "practice", "other"]),
    url: z.string().optional(),
    description: z.string(),
    estimatedTimeInMinutes: z.number().optional()
  })).min(1).max(5)
});

/**
 * Generate assessment questions using AI
 */
export async function generateAssessmentQuestionsWithAI(params: GenerateAssessmentQuestionsParams) {
  try {
    // Verify that the user is an admin
    const userIsAdmin = await isAdmin();
    if (!userIsAdmin) {
      return {
        success: false,
        message: "Unauthorized: Only admins can use AI generation",
        data: []
      };
    }

    const { 
      category, 
      difficulty, 
      count, 
      questionType, 
      title, 
      description, 
      currentQuestions = [] 
    } = params;

    // Validate parameters
    if (!category || !difficulty) {
      return {
        success: false,
        message: "Category and difficulty level are required",
        data: []
      };
    }

    if (count <= 0 || count > 20) {
      return {
        success: false,
        message: "Number of questions must be between 1 and 20",
        data: []
      };
    }

    // Build the prompt for question generation
    let prompt = `Generate ${count} high-quality ${difficulty} level assessment questions about ${category}`;
    
    if (title) {
      prompt += ` for an assessment titled "${title}"`;
    }
    
    if (description) {
      prompt += `\n\nAssessment description: ${description}`;
    }


    // Add specifics based on question type
    if (questionType === "multiple-choice") {
      prompt += `\n\nEach question should have 4 options, with exactly one correct answer. 
      The correct answer should be challenging to identify without proper knowledge.
      The incorrect options should be plausible and related to the topic.`;
    } else if (questionType === "coding") {
      prompt += `\n\nEach question should involve coding challenges related to ${category}.
      Include clear instructions and expected outcomes.`;
    } else if (questionType === "text") {
      prompt += `\n\nEach question should require a short text answer.
      Focus on questions that test understanding and application rather than memorization.`;
    } else if (questionType === "true-false") {
      prompt += `\n\nEach question should be a statement that is either true or false.
      Make the statements nuanced and challenging, requiring proper understanding of the subject.`;
    }

    // Add guidance based on difficulty
    if (difficulty === "beginner") {
      prompt += "\n\nFocus on fundamental concepts and basic knowledge.";
    } else if (difficulty === "intermediate") {
      prompt += "\n\nFocus on applying concepts in straightforward scenarios.";
    } else if (difficulty === "advanced") {
      prompt += "\n\nFocus on complex applications and deeper understanding.";
    } else if (difficulty === "expert") {
      prompt += "\n\nFocus on edge cases, uncommon scenarios, and specialized knowledge.";
    }

    // Add existing questions to avoid duplicates
    if (currentQuestions.length > 0) {
      prompt += "\n\nAvoid generating questions similar to these existing questions:";
      currentQuestions.forEach((q, i) => {
        if (i < 10) { // Limit to first 10 to avoid token limits
          prompt += `\n- ${q}`;
        }
      });
    }

    // Use generateObject with Google's Gemini model for structured output
    try {
      // For multiple-choice questions, use the schema to get structured data
      if (questionType === "multiple-choice") {
        const { object } = await generateObject({
          model: google("gemini-2.0-flash-001", {
            structuredOutputs: true,
          }),
          schema: multipleChoiceQuestionSchema,
          prompt: prompt,
          system: "You are a professional assessment question creator. Create high-quality, challenging, and relevant assessment questions with clear options."
        });

        return {
          success: true,
          data: object.questions
        };
      } 
      // For other question types (to be implemented)
      else {
        return {
          success: false,
          message: "Only multiple-choice questions are currently supported",
          data: []
        };
      }
    } catch (aiError) {
      console.error("AI generation error:", aiError);
      return {
        success: false,
        message: "Failed to generate questions with AI",
        data: []
      };
    }
  } catch (error) {
    console.error("Error in generateAssessmentQuestionsWithAI:", error);
    return {
      success: false,
      message: "An error occurred while generating questions",
      data: []
    };
  }
}

/**
 * Analyzes missed questions to identify knowledge gaps
 */
async function analyzeMissedQuestions(args: AnalyzeMissedQuestionsArgs) {
  try {
    const { questions, category } = args;
    
    // Filter out correct answers
    const incorrectQuestions = questions.filter(q => !q.isCorrect);
    
    if (incorrectQuestions.length === 0) {
      return JSON.stringify({
        topics: [{
          name: "General Review",
          relevance: 10,
          subtopics: ["Comprehensive review"],
          difficulty: "beginner"
        }]
      });
    }
    
    // Generate structured response using Gemini
    const { object } = await generateObject({
      model: google("gemini-2.0-flash-001", {
        structuredOutputs: true,
      }),
      schema: topicAnalysisSchema,
      prompt: `
        Analyze these incorrect questions from a ${category} assessment:
        ${incorrectQuestions.map((q, i) => `
          Question ${i+1}: "${q.question}"
          Time taken: ${Math.floor(q.timeTaken / 60)}m ${q.timeTaken % 60}s
        `).join('\n')}
        
        Based on these questions:
        1. Identify 2-3 specific knowledge gap topics
        2. Rate each topic's relevance on a scale of 1-10
        3. List 2-3 subtopics for each main topic
        4. Assess the difficulty level needed for study resources
      `,
      system: "You are an expert educational analyst who excels at identifying knowledge gaps from assessment results."
    });
    
    return JSON.stringify(object);
  } catch (error) {
    console.error("Error in analyzeMissedQuestions:", error);
    return JSON.stringify({ 
      error: "Failed to analyze questions", 
      topics: [{ 
        name: "General Knowledge Gaps", 
        relevance: 8, 
        subtopics: ["Review core concepts"], 
        difficulty: "intermediate" 
      }] 
    });
  }
}

/**
 * Generates specific learning resources for identified topics
 */
async function generateLearningResources(args: GenerateLearningResourcesArgs) {
  try {
    const { topic, difficulty, category } = args;
    
    const { object } = await generateObject({
      model: google("gemini-2.0-flash-001", {
        structuredOutputs: true,
      }),
      schema: resourceRecommendationsSchema,
      prompt: `
        Recommend specific learning resources for studying "${topic}" in the field of ${category}.
        The learner needs ${difficulty} level materials.
        
        For each resource:
        1. Provide a specific, actionable title
        2. Classify the resource type (article, video, etc.)
        3. Give a brief description of what they'll learn
        4. Estimate how long it will take to complete (in minutes)
      `,
      system: "You are an expert educational resource curator who provides highly relevant, practical learning materials."
    });
    
    return JSON.stringify(object);
  } catch (error) {
    console.error("Error in generateLearningResources:", error);
    return JSON.stringify({ 
      error: "Failed to generate resources",
      resources: [{ 
        title: `${args.topic} fundamentals`,
        type: "course",
        description: "A comprehensive overview of the core concepts",
        estimatedTimeInMinutes: 60
      }]
    });
  }
}

const availableFunctions: Record<string, Function> = {
  analyzeMissedQuestions,
  generateLearningResources
};

/**
 * Agent-based study recommendations system that mimics a simplified version
 * to work around the existing limits of the Google AI JS SDK
 */
export async function generateStudyRecommendationsAgent(params: {
  assessmentTitle: string;
  assessmentCategory: SkillCategory;
  questions: AssessmentQuestion[];
  userAttempts: UserQuestionAttempt[];
}) {
  try {
    const { assessmentTitle, assessmentCategory, questions, userAttempts } = params;
    
    // Prepare the data for the agent
    const struggledQuestions = userAttempts
      .filter(attempt => !attempt.isCorrect || attempt.timeSpentInSeconds > 60)
      .map(attempt => {
        const question = questions.find(q => q.id === attempt.questionId);
        return {
          question: question?.question || "",
          timeTaken: attempt.timeSpentInSeconds,
          isCorrect: attempt.isCorrect
        };
      })
      .filter(q => q.question !== "");
    
    if (struggledQuestions.length === 0) {
      return {
        success: true,
        data: {
          topics: [{
            topic: "General Review",
            description: "You did great on the assessment! Here are some general resources to further improve your skills.",
            relevance: "General review to reinforce your knowledge",
            resources: [
              {
                title: "Continue practicing with more advanced exercises",
                type: "practice"
              }
            ]
          }]
        }
      };
    }

    // First, analyze the missed questions to identify knowledge gaps
    console.log("Analyzing missed questions...");
    const analyzeResult = await analyzeMissedQuestions({
      questions: struggledQuestions,
      category: assessmentCategory
    });
    
    let topicsData;
    try {
      topicsData = JSON.parse(analyzeResult);
    } catch (e) {
      console.error("Error parsing analysis result:", e);
      topicsData = { 
        topics: [{ 
          name: "General Knowledge Gaps", 
          relevance: 8, 
          subtopics: ["Review core concepts"], 
          difficulty: "intermediate" 
        }] 
      };
    }
    
    // For each identified topic, find learning resources
    const enhancedTopics: {
      topic: string;
      description: string;
      relevance: string;
      resources: {
        title: string;
        type: string;
      }[];
    }[] = [];

    for (const topic of topicsData.topics) {
      console.log(`Finding resources for topic: ${topic.name}`);
      
      try {
        const resourcesResult = await generateLearningResources({
          topic: topic.name,
          difficulty: topic.difficulty,
          category: assessmentCategory
        });
        
        let resourcesData;
        try {
          resourcesData = JSON.parse(resourcesResult);
        } catch (e) {
          console.error(`Error parsing resources for ${topic.name}:`, e);
          resourcesData = { 
            resources: [{ 
              title: `${topic.name} fundamentals`, 
              type: "course",
              description: "A comprehensive overview of the topic"
            }] 
          };
        }
        
        enhancedTopics.push({
          topic: topic.name,
          description: `${topic.name} is highly relevant to your assessment results (relevance score: ${topic.relevance}/10). Focus on these subtopics: ${topic.subtopics.join(", ")}.`,
          relevance: `Relevance score: ${topic.relevance}/10`,
          resources: resourcesData.resources.map((res: any) => ({
            title: res.title,
            type: res.type || "article",
            description: res.description || ""
          }))
        });
      } catch (err) {
        console.error(`Error generating resources for ${topic.name}:`, err);
        
        // Add a basic topic even if resource generation failed
        enhancedTopics.push({
          topic: topic.name,
          description: `Focus on these subtopics: ${topic.subtopics.join(", ")}.`,
          relevance: `Relevance score: ${topic.relevance}/10`,
          resources: [{ 
            title: `Study ${topic.name} fundamentals`,
            type: "course"
          }]
        });
      }
    }
    
    return {
      success: true,
      data: { 
        topics: enhancedTopics.length > 0 ? enhancedTopics : [{
          topic: "Assessment Review",
          description: "Review the concepts covered in your assessment questions.",
          relevance: "Based on assessment performance",
          resources: [{ 
            title: "General study resources for " + assessmentCategory,
            type: "article"
          }]
        }] 
      }
    };
  } catch (error) {
    console.error("Error in generateStudyRecommendationsAgent:", error);
    return {
      success: false,
      message: "An error occurred while generating study recommendations",
      data: null
    };
  }
} 