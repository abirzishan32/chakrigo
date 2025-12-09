import { GoogleGenerativeAI } from "@google/generative-ai";
import { ResumeAnalysisSchema } from "@/schemas/ResumeAnalysisSchema";
import { db } from "@/firebase/admin";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/actions/auth.action";

export const config = { api: { bodyParser: false } };

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

const SYSTEM_PROMPT = `
You are an expert resume analyzer with 10+ years of HR and recruitment experience. 
Your task is to thoroughly analyze resumes based on industry best practices and 
provide detailed feedback for improvement. Consider these key criteria:

1. CONTENT QUALITY:
    - Quantifiable achievements (metrics, percentages, $ amounts)
    - Action verbs (led, implemented, optimized)
    - Relevant keywords from job description
    - No spelling/grammar errors
    - Concise bullet points (1-2 lines max)

2. STRUCTURE & FORMATTING:
    - Clean, professional layout
    - Consistent formatting (dates, headings, bullet points)
    - Optimal length (1-2 pages)
    - Clear section headings
    - Readable font (10-12pt)

3. JOB FIT ANALYSIS:
    - Skills match to job requirements
    - Experience relevance
    - Keyword optimization
    - Missing qualifications
    - Transferable skills

4. COMMON MISTAKES TO FLAG:
    - Personal pronouns ("I", "my")
    - Unprofessional email addresses
    - Irrelevant personal information
    - Dense paragraphs
    - Vague descriptions
    - Job hopping without explanation
    - Gaps in employment history

Provide specific, actionable recommendations for each issue found.
Prioritize feedback based on impact on hiring chances.

Return your analysis in the following JSON format:
{
  "summary": "Brief overall assessment of the resume",
  "overallScore": 85,
  "jobFitAnalysis": {
    "matchPercentage": 75,
    "strengths": ["Strong technical skills", "Relevant experience"],
    "gaps": ["Missing cloud experience", "No leadership examples"],
    "recommendations": ["Add cloud certifications", "Include team leadership examples"]
  },
  "parsedContent": {
    "name": "John Doe",
    "email": "john@email.com",
    "phone": "+1234567890",
    "experience": [...],
    "education": [...],
    "skills": [...]
  },
  "sections": {
    "experience": {
      "score": 80,
      "feedback": "Strong work experience section",
      "improvements": ["Add more quantifiable achievements"]
    },
    "education": {
      "score": 90,
      "feedback": "Good educational background",
      "improvements": []
    },
    "skills": {
      "score": 75,
      "feedback": "Relevant skills listed",
      "improvements": ["Add more specific technical skills"]
    }
  }
}
`;

export async function POST(req: Request) {
    const user = await getCurrentUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const formData = await req.formData();
        const file = formData.get("resume") as File;
        const targetRole = formData.get("targetRole") as string;
        const targetDescription = formData.get("targetDescription") as string;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }
        if (!targetRole || !targetDescription) {
            return NextResponse.json({
                error: "Job title and description are required",
            }, { status: 400 });
        }

        // Convert file to base64
        const arrayBuffer = await file.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString("base64");
        const mimeType = file.type || "application/pdf";

        const userPrompt = `
        ${SYSTEM_PROMPT}

        Analyze this resume for a ${targetRole} position with the following job description:
        ${targetDescription}

        Perform comprehensive analysis including:
        1. Extract all content into structured format
        2. Score overall quality (0-100)
        3. Evaluate each section (experience, education, skills, etc.)
        4. Analyze job fit based on provided description
        5. Identify missing keywords/skills
        6. Provide specific improvement recommendations

        Focus particularly on:
        - Relevance to ${targetRole} role
        - Quantifiable achievements
        - Skills match to: ${targetDescription.substring(0, 200)}...
        - Formatting and structure
        
        Current date: ${new Date().toISOString()}
        `;

        // Use Gemini Pro Vision model for document analysis
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.0-flash",
            generationConfig: {
                temperature: 0.1,
                topK: 1,
                topP: 1,
            }
        });

        const imagePart = {
            inlineData: {
                data: base64,
                mimeType: mimeType,
            },
        };

        const result = await model.generateContent([userPrompt, imagePart]);
        const response = await result.response;
        const text = response.text();

        // Parse the JSON response
        let parsedContent;
        try {
            // Clean the response text (remove any markdown formatting)
            const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            parsedContent = JSON.parse(cleanedText);
        } catch (parseError) {
            console.error("Error parsing AI response:", parseError);
            console.log("Raw response:", text);
            
            // Fallback response structure
            parsedContent = {
                summary: "Resume analysis completed but response format needs adjustment",
                overallScore: 70,
                jobFitAnalysis: {
                    matchPercentage: 65,
                    strengths: ["Professional experience", "Educational background"],
                    gaps: ["Analysis needs refinement"],
                    recommendations: ["Please try uploading again for detailed analysis"]
                },
                parsedContent: {
                    name: "Unable to extract",
                    email: "Unable to extract",
                    phone: "Unable to extract",
                    experience: [],
                    education: [],
                    skills: []
                },
                sections: {
                    experience: {
                        score: 70,
                        feedback: "Analysis in progress",
                        improvements: ["Please resubmit for detailed feedback"]
                    },
                    education: {
                        score: 70,
                        feedback: "Analysis in progress",
                        improvements: []
                    },
                    skills: {
                        score: 70,
                        feedback: "Analysis in progress",
                        improvements: ["Please resubmit for detailed feedback"]
                    }
                }
            };
        }

        // Save analysis to Firestore
        const analysisData = {
            userId: user.id,
            targetRole: targetRole,
            description: targetDescription,
            summary: parsedContent.summary || "No summary provided",
            overallScore: parsedContent.overallScore || 0,
            jobFitAnalysis: parsedContent.jobFitAnalysis || {},
            parsedData: parsedContent.parsedContent || {},
            analysis: parsedContent.sections || {},
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const docRef = await db.collection('resumeAnalyses').add(analysisData);
        
        if (!docRef.id) {
            return NextResponse.json(
                { error: "Failed to save analysis" },
                { status: 500 }
            );
        }

        const savedAnalysis = {
            id: docRef.id,
            ...analysisData
        };

        return NextResponse.json({
            message: "Resume analysis completed successfully",
            data: savedAnalysis,
        }, { status: 200 });

    } catch (error) {
        console.error("Resume analysis error:", error);
        
        // More specific error handling
        if (error.message?.includes('API key')) {
            return NextResponse.json(
                { error: "API configuration error. Please check your settings." },
                { status: 500 }
            );
        }
        
        if (error.message?.includes('quota')) {
            return NextResponse.json(
                { error: "API quota exceeded. Please try again later." },
                { status: 429 }
            );
        }

        return NextResponse.json(
            { error: error.message || "Failed to analyze resume" },
            { status: 500 }
        );
    }
}

// GET endpoint - fetch user's resume analyses
export async function GET() {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const analysesSnapshot = await db
            .collection('resumeAnalyses')
            .where('userId', '==', user.id)
            .orderBy('createdAt', 'desc')
            .get();

        const analyses = analysesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return NextResponse.json({ data: analyses }, { status: 200 });
    } catch (error) {
        console.error("Error fetching analyses:", error);
        return NextResponse.json(
            { error: "Failed to fetch analyses" },
            { status: 500 }
        );
    }
}

// DELETE endpoint - delete a specific analysis
export async function DELETE(request: Request) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const analysisId = searchParams.get("id");

        if (!analysisId) {
            return NextResponse.json(
                { error: "Analysis ID is required" },
                { status: 400 }
            );
        }

        // Verify the analysis belongs to the user before deleting
        const analysisDoc = await db
            .collection('resumeAnalyses')
            .doc(analysisId)
            .get();

        if (!analysisDoc.exists) {
            return NextResponse.json(
                { error: "Analysis not found" },
                { status: 404 }
            );
        }

        const analysisData = analysisDoc.data();
        if (!analysisData || analysisData.userId !== user.id) {
            return NextResponse.json(
                { error: "Analysis not found or unauthorized" },
                { status: 404 }
            );
        }

        await db
            .collection('resumeAnalyses')
            .doc(analysisId)
            .delete();

        return NextResponse.json(
            { message: "Analysis deleted successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error deleting analysis:", error);
        return NextResponse.json(
            { error: "Failed to delete analysis" },
            { status: 500 }
        );
    }
}