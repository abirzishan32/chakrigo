import OpenAI from "openai";
import { ResumeAnalysisSchema } from "@/schemas/ResumeAnalysisSchema";
import { db } from "@/firebase/admin";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/actions/auth.action";

export const config = { api: { bodyParser: false } };
const ai = new OpenAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

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
`;

export async function POST(req) {
    const user = await getCurrentUser();
    if (!user) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
        });
    }

    try {
        const formData = await req.formData();
        const file = formData.get("resume");
        const targetRole = formData.get("targetRole");
        const targetDescription = formData.get("targetDescription");

        if (!file) {
            return new Response(JSON.stringify({ error: "No file uploaded" }), {
                status: 400,
            });
        }
        if (!targetRole || !targetDescription) {
            return new Response(
                JSON.stringify({
                    error: "Job title and description are required",
                }),
                { status: 400 }
            );
        }

        // Read file as base64
        const arrayBuffer = await file.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString("base64");

        const userPrompt = `
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
        - Skills match to: ${targetDescription.substring(0, 100)}...
        - Formatting and structure
        
        Some additional context:
        - The current date is ${new Date().toISOString()}
        `;

        const response = await ai.chat.completions.create({
            model: "gemini-2.5-flash-preview-04-17",
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: userPrompt,
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: `data:application/pdf;base64,${base64}`,
                            },
                        },
                    ],
                },
            ],
            response_format: {
                type: "json_schema",
                json_schema: {
                    name: "resume_analysis",
                    schema: ResumeAnalysisSchema,
                    strict: true,
                },
            },
        });

        if (!response || !response.choices || response.choices.length === 0) {
            return new Response(
                JSON.stringify({ error: "Failed to analyze resume" }),
                { status: 500 }
            );
        }
        //console.log("Raw API response:", response.choices[0].message.content);
        const parsedContent = JSON.parse(response.choices[0].message.content);
        //console.log("Parsed content:", parsedContent);

        // Save analysis to Firestore
        const analysisData = {
            userId: user.id,
            targetRole: targetRole,
            description: targetDescription,
            summary: parsedContent.summary || "No summary provided",
            overallScore: parsedContent.overallScore,
            jobFitAnalysis: parsedContent.jobFitAnalysis,
            parsedData: parsedContent.parsedContent,
            analysis: parsedContent.sections,
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

        return NextResponse.json(
            {
                message: "Resume analysis completed successfully",
                data: savedAnalysis,
            },
            { status: 200 }
        );
    } catch (e) {
        console.error(e);
        return NextResponse.json(
            { error: e.message },
            {
                status: 500,
            }
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
