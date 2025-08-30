import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { db } from "@/firebase/admin";
import { NextRequest } from 'next/server';
import { getProblemBySlug, getProblemSolution } from "@/lib/actions/leetcode.action";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const problemSlug = searchParams.get('slug');
  
  if (!problemSlug) {
    return Response.json({ success: false, error: 'Problem slug is required' }, { status: 400 });
  }

  try {
    // Query Firestore for existing questions
    const querySnapshot = await db.collection("leetcode_interviews")
      .where("problemSlug", "==", problemSlug)
      .limit(1)
      .get();
    
    if (!querySnapshot.empty) {
      // Found existing questions
      const interviewData = querySnapshot.docs[0].data();
      return Response.json({ 
        success: true, 
        data: {
          questions: interviewData.questions || [],
          problemTitle: interviewData.problemTitle,
          problemDifficulty: interviewData.problemDifficulty,
          language: interviewData.language
        } 
      });
    } else {
      // No questions found - this is OK, will trigger generation
      return Response.json({ 
        success: false, 
        error: 'No questions found for this problem' 
      }, { status: 404 });
    }
  } catch (error) {
    console.error('Error fetching interview questions:', error);
    return Response.json({ 
      success: false, 
      error: 'Server error' 
    }, { status: 500 });
  }
}


export async function POST(request: Request){
    const { problemSlug, language, userid } = await request.json();
    
    try {
        // Fetch problem details
        const problemResult = await getProblemBySlug(problemSlug);
        
        if (!problemResult.success) {
            return Response.json({ 
                success: false, 
                error: `Failed to fetch problem: ${problemResult.error}` 
            }, { status: 404 });
        }
        
        const problem = problemResult.data;
        
        // Get solution approach for the problem
        const solutionResult = await getProblemSolution(problemSlug);
        const solution = solutionResult.success ? solutionResult.data : null;
        
        // Generate interview questions based on the problem
        const { text: questionsRaw } = await generateText({
            model: google('gemini-2.0-flash-001'),
            prompt: `Prepare interview questions for a LeetCode coding interview about this problem:

Problem Title: ${problem?.title}
Difficulty: ${problem?.difficulty}
Problem Description: ${problem?.content.replace(/<[^>]*>/g, '')}

${solution ? `Optimal Solution Approach: ${solution.content}` : ''}

The candidate will code in ${language || 'C++'}.

Generate 5-8 interview questions that cover:
1. Problem understanding
2. Solution approach
3. Time and space complexity 
4. Edge cases
5. Implementation details

Return ONLY a JSON array of strings without any markdown formatting, code blocks, or comments.
Example of the expected format: ["Question 1", "Question 2", "Question 3"]
DO NOT include any text before or after the JSON array.
`,
        });

        // Parse questions - handle potential markdown and code blocks
        let parsedQuestions;
        try {
            // Clean the text by removing markdown code blocks and other formatting
            let cleanText = questionsRaw.trim();
            
            // Remove markdown code block formatting if present
            if (cleanText.startsWith('```') && cleanText.endsWith('```')) {
                // Extract content between first ``` and last ```
                cleanText = cleanText.substring(
                    cleanText.indexOf('\n') + 1, 
                    cleanText.lastIndexOf('\n')
                );
            }
            
            // Remove any language identifier like "json" if present
            cleanText = cleanText.replace(/^json\s*\n/i, '');
            
            // Try to parse the cleaned text
            parsedQuestions = JSON.parse(cleanText);
            
            // Ensure it's an array
            if (!Array.isArray(parsedQuestions)) {
                throw new Error('Parsed result is not an array');
            }
        } catch (parseError) {
            console.error('Error parsing questions:', parseError);
            console.log('Raw questions text:', questionsRaw);
            
            // Fallback: try to extract questions using regex
            const questionMatches = questionsRaw.match(/"([^"]+)"/g);
            if (questionMatches && questionMatches.length > 0) {
                parsedQuestions = questionMatches.map(q => q.replace(/"/g, ''));
            } else {
                // Last resort fallback: create generic questions
                parsedQuestions = [
                    `Can you explain your understanding of the ${problem?.title} problem?`,
                    `What approach would you use to solve this ${problem?.difficulty} level problem?`,
                    "What's the time and space complexity of your solution?",
                    "How would you handle edge cases in your solution?",
                    "Can you walk through your implementation step by step?"
                ];
            }
        }

        // Create the interview document with only the specified fields
        const lc_interview = {
            type: 'leetcode',
            problemTitle: problem?.title,
            problemDifficulty: problem?.difficulty,
            problemSlug: problemSlug,
            language: language || 'C++',
            questions: parsedQuestions,
            userId: userid,
            finalized: true,
            createdAt: new Date().toISOString()
        }

        // Save to database
        await db.collection("leetcode_interviews").add(lc_interview);
        
        return Response.json({
            success: true,
            interview: {
                id: lc_interview.problemTitle,
                title: `LeetCode: ${lc_interview.problemTitle}`,
                questions: lc_interview.questions
            }
        }, {status: 200});
    }
    catch (e) {
        console.error('Error generating LeetCode interview:', e);
        
        return Response.json({
            success: false, 
            error: e instanceof Error ? e.message : 'Unknown error occurred'
        }, {status: 500});
    }
}