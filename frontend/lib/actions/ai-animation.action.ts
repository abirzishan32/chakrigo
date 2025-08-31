"use server";

import { z } from "zod";

// API URL from environment or default to FastAPI's standard port 8000
const FASTAPI_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Schema for animation response validation
const animationResponseSchema = z.object({
  code: z.string(),
  explanation: z.string(),
  video_url: z.string().optional().nullable()
});

export type AnimationResponse = {
  success: boolean;
  message?: string;
  data?: {
    code: string;
    explanation: string;
    video_url?: string | null;
  };
};

/**
 * Server action to generate Manim animation code based on user prompt
 */
export async function generateAnimationCode(prompt: string): Promise<AnimationResponse> {
  try {
    if (!prompt.trim()) {
      return {
        success: false,
        message: "Please provide a prompt to generate animation"
      };
    }

    // Log the target URL for debugging
    console.log(`Attempting to connect to: ${FASTAPI_URL}/generate-animation`);

    try {
      // Using absolute URL with proper protocol
      const apiUrl = `${FASTAPI_URL}/generate-animation`
      
      console.log(`Final request URL: ${apiUrl}`);
      
      // Call the FastAPI backend with more robust error handling
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
        // Add a longer timeout for AI operations
        signal: AbortSignal.timeout(60000) // Extended timeout for rendering
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: `Server returned ${response.status}` }));
        return {
          success: false,
          message: errorData.detail || 'Failed to generate animation code'
        };
      }

      // Parse and validate the response
      const data = await response.json();
      const validatedData = animationResponseSchema.parse(data);
      
      return {
        success: true,
        data: {
          code: validatedData.code,
          explanation: validatedData.explanation,
          video_url: validatedData.video_url
        }
      };
    } catch (fetchError: any) {
      console.error("Connection error details:", {
        message: fetchError.message,
        cause: fetchError.cause,
        code: fetchError.cause?.code,
        stack: fetchError.stack
      });
      
      return {
        success: false,
        message: `Connection failed: ${fetchError.cause?.code || fetchError.message}. Make sure the FastAPI server is running on port 8000.`
      };
    }
  } catch (error) {
    console.error("Error generating animation code:", error);
    return {
      success: false,
      message: "An error occurred while generating the animation code"
    };
  }
}