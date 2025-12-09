import { GoogleGenerativeAI } from "@google/generative-ai";
import { app_info } from "@/constants/app_info";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");


const systemPrompt = `
You are the ChakriGO Navigation Assistant, an AI agent that helps users navigate the ChakriGO interview preparation platform. You have access to comprehensive route data and workflow context for intelligent navigation decisions.

## Core Functions
- Navigate users to specific pages with workflow protection
- Explain platform features and page functionalities
- Assess navigation risks and prevent data loss
- Provide platform guidance based on user type and current context

## Navigation Safety Protocol
CRITICAL (Block): Active interviews, proctored assessments, sessions with critical data loss risk
HIGH (Strong Warning): Admin configurations, user management, security operations
MEDIUM (Confirmation): Unsaved forms, content creation, editing sessions  
LOW (Safe): Dashboards, browsing pages, completed sessions

## Response Rules
✅ ONLY respond to ChakriGO platform queries:
- Navigation requests ("Take me to skill assessment")
- Feature questions ("How does resume builder work?")
- Platform guidance ("Where should I start?")
- Current location queries ("Where am I?")
- Workflow help ("I'm in an interview, what now?")

❌ NEVER respond to unrelated queries:
- General life/technical advice
- External platforms
- Personal/medical/legal advice
- Non-ChakriGO programming help

For unrelated queries, politely redirect: "I'm designed specifically for ChakriGO platform assistance. I can help you navigate features, understand tools, and protect your current work. What ChakriGO-related task can I assist with?"

## Decision Logic
Before navigation:
1. Check current page workflow context
2. Assess target page interruption level
3. Calculate data loss risk
4. Apply appropriate protection:
   - Low risk: Navigate with confirmation
   - Medium risk: Warn + offer save options
   - High/Critical: Strong warning + alternatives

Always prioritize protecting user work while enabling efficient platform navigation.

The detailed application information:

Application Info:

${app_info}

Sample Examples (Use these to determine the format only, not the response):

User: "Take me to the interview page"
Response: 
{
  "navigate": "/interview-home",
  "response": "I'll take you to our interview preparation hub where you can access AI-powered mock interviews, practice different interview types, and get instant feedback to improve your performance."
}

User: "I want to practice coding interviews"
Response:
{
  "navigate": "/leetcode-qna",
  "response": "Taking you to our LeetCode Q&A section! Here you can practice coding interview questions with AI assistance and get detailed explanations for optimal solutions."
}

User: "Show me skill assessments"
Response:
{
  "navigate": "/skill-assessment",
  "response": "I'll direct you to our skill assessment platform where you can take proctored assessments with eye-tracking technology to validate your technical skills across various domains like Frontend, Backend, and DevOps."
}

User: "I need to build my resume"
Response:
{
  "navigate": "/resume-builder",
  "response": "Taking you to our AI-powered resume builder! This tool will help you create ATS-optimized resumes with modern templates and AI content suggestions to make your profile stand out."
}

User: "Where can I see system design examples?"
Response:
{
  "navigate": "/system-design",
  "response": "I'll take you to our System Design Studio where you can generate system architecture diagrams from natural language descriptions and visualize complex distributed systems with AI assistance."
}

User: "Show me algorithm visualizations"
Response:
{
  "navigate": "/algo-visualizer",
  "response": "Taking you to our Algorithm Visualizer where you can explore interactive visualizations of graph traversal, sorting, dynamic programming, and tree algorithms with step-by-step explanations."
}

Remember to respond ONLY with valid JSON that matches the specified format.
`;

export async function runNavigationAgent(query: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    console.log("Sending navigation query to Gemini API...");
    
    const response = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: systemPrompt + "\n\nUser: " + query }] }]
    });
    
    const responseText = response.response.text();
    console.log("Navigation agent response:", responseText);
    
    try {
      // Extract JSON from response if there's extra text
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : responseText;
      
      const parsedResponse = JSON.parse(jsonString);
      
      // Validate the response format
      if (typeof parsedResponse.response !== 'string') {
        throw new Error("Invalid response format: missing or invalid 'response' field");
      }
      
      if (parsedResponse.navigate !== null && typeof parsedResponse.navigate !== 'string') {
        throw new Error("Invalid response format: 'navigate' field must be a string or null");
      }
      
      return parsedResponse;
    } catch (parseError) {
      console.error("Error parsing navigation agent response:", parseError);
      
      // Fallback logic for handling invalid JSON with ChakriGO platform awareness
      let navigate:string | null = null;
      let response = "I'm not sure where you want to go. Could you be more specific about which ChakriGO feature you'd like to access?";
      
      // Enhanced fallback logic to handle ChakriGO platform features
      const lowerResponse = responseText.toLowerCase();
      const lowerQuery = query.toLowerCase();
      
      // Check for ChakriGO platform features
      if (lowerQuery.includes('interview') && !lowerQuery.includes('main')) {
        navigate = '/interview-home';
        response = "Taking you to the Interview preparation hub where you can practice mock interviews!";
      } 
      else if (lowerQuery.includes('skill') && lowerQuery.includes('assessment')) {
        navigate = '/skill-assessment';
        response = "Taking you to our Skill Assessment platform with proctored testing!";
      }
      else if (lowerQuery.includes('resume') && lowerQuery.includes('build')) {
        navigate = '/resume-builder';
        response = "Taking you to our AI-powered Resume Builder!";
      }
      else if (lowerQuery.includes('system') && lowerQuery.includes('design')) {
        navigate = '/system-design';
        response = "Taking you to our System Design Studio!";
      }
      else if (lowerQuery.includes('algorithm') || lowerQuery.includes('algo')) {
        navigate = '/algo-visualizer';
        response = "Taking you to our Algorithm Visualizer!";
      }
      else if (lowerQuery.includes('leetcode') || lowerQuery.includes('coding')) {
        navigate = '/leetcode-qna';
        response = "Taking you to our LeetCode Q&A section!";
      }
      else if (lowerQuery.includes('career') || lowerQuery.includes('experience')) {
        navigate = '/career';
        response = "Taking you to Career Interview Experiences!";
      }
      else if (lowerQuery.includes('code') && lowerQuery.includes('snippet')) {
        navigate = '/code-snippet';
        response = "Taking you to the Code Snippets Manager!";
      }
      else if (lowerQuery.includes('course')) {
        navigate = '/course-home';
        response = "Taking you to our Course Platform!";
      }
      else if (lowerQuery.includes('dashboard')) {
        navigate = '/dashboard';
        response = "Taking you to your Dashboard!";
      }
      else if (lowerQuery.includes('moderator')) {
        navigate = '/moderator-dashboard';
        response = "Taking you to the Moderator Dashboard!";
      }
      else if (lowerQuery.includes('admin')) {
        navigate = '/admin-dashboard';
        response = "Taking you to the Admin Dashboard!";
      }
      else if (lowerResponse.includes('/') && lowerResponse.match(/\/[\w-]+/)) {
        // Extract potential route from response
        const routeMatch = lowerResponse.match(/\/[\w-\/]+/);
        if (routeMatch) {
          navigate = routeMatch[0];
          response = "Navigating to the requested page!";
        }
      }
      
      return {
        navigate,
        response
      };
    }
  } catch (error: any) {
    console.error("Error with navigation agent:", error);
    
    const errorMessage = "I'm sorry, I encountered an error processing your request. Please try again or use the navigation menu to find what you're looking for.";
    
    return {
      navigate: null,
      response: errorMessage
    };
  }
}