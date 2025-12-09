import { NextResponse } from "next/server";
import { runNavigationAgent } from "../navigation-chatbot/agent";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { query } = body;
        
        console.log('Received navigation request:', { query });
        
        if (!query) {
            console.error('No query provided');
            return NextResponse.json({ error: "Query is required" }, { status: 400 });
        }
        
        // Check if API key is configured
        if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
            console.error('GOOGLE_GENERATIVE_AI_API_KEY is not configured');
            return NextResponse.json({ 
                error: "Navigation service is not configured. Please set up the GOOGLE_GENERATIVE_AI_API_KEY environment variable.",
                timestamp: new Date().toISOString()
            }, { status: 500 });
        }
        
        // Run the navigation agent with the user's query
        const result = await runNavigationAgent(query);
        
        console.log('Navigation agent result:', result);
        
        // Log the navigation request
        console.log({
            timestamp: new Date().toISOString(),
            query,
            navigate: result.navigate,
            response: result.response,
            type: "navigation"
        });
        
        return NextResponse.json(result);
    } catch (error: any) {
        console.error("Error processing navigation request:", error);
        return NextResponse.json({ 
            error: `Error: ${error.message || "Unknown error occurred"}. Please try again later.`,
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}