import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || '');

export async function POST(req: NextRequest) {
  let filePath = '';
  try {
    const body = await req.json();
    const { message, type, image } = body;

    // Create uploads folder if not exists
    if (!fs.existsSync('./public/uploads')) {
      fs.mkdirSync('./public/uploads', { recursive: true });
    }
    
    filePath = `./public/uploads/${Date.now()}.png`;
    if (image) {
      const base64Data = image.replace(/^data:image\/png;base64,/, '');
      fs.writeFileSync(filePath, base64Data, 'base64');
      console.log('Image saved to:', filePath);
    }

    // Mock delay to simulate processing
    await new Promise(resolve => setTimeout(resolve, 500));

    if (type === 'message') {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `You are a helpful assistant. Respond to the following message: ${message} in short concise manner. Without any extra info, just the precise answer.`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return NextResponse.json({
        text: text.trim(),
        success: true
      });

    } else if (type === 'diagram') {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `You are a helpful assistant. Generate a mermaid diagram code based on the following description: ${message}. 
      
      Rules:
      - No extra info or any text, just the mermaid code
      - Do not wrap in code blocks or backticks
      - Do not include any explanation
      - Just return the raw mermaid syntax
      
      Example format:
      graph TD
          A[Client] --> B[Load Balancer]
          B --> C[Server1]
          B --> D[Server2]
      
      Make sure to use proper mermaid syntax and return only the code.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let mermaidCode = response.text().trim();
      
      // Clean up the response to ensure it's just mermaid code
      mermaidCode = mermaidCode
        .replace(/```mermaid/g, '')
        .replace(/```/g, '')
        .replace(/<code>/g, '')
        .replace(/<\/code>/g, '')
        .trim();

      return NextResponse.json({
        mermaidCode,
        success: true
      });
      
    } else if (type === 'summarize') {
      // Handle image summarization
      if (!image) {
        return NextResponse.json({
          text: "No image data provided",
          success: false
        }, { status: 400 });
      }

      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const base64ImageFile = fs.readFileSync(filePath, {
        encoding: "base64",
      });

      const prompt = `You are an expert at analyzing visual content. This is an image of a whiteboard with various elements.
      Provide a clear, concise summary of what you see on this whiteboard. Focus on:
      1. The main topics or concepts
      2. Any key relationships between elements
      3. The overall structure and organization
      
      Keep your summary under 150 words and make it actionable for someone who wants to understand the main points quickly.`;

      const imagePart = {
        inlineData: {
          data: base64ImageFile,
          mimeType: "image/png",
        },
      };

      const result = await model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text();
      
      return NextResponse.json({
        text: text,
        success: true
      });
    }

    return NextResponse.json({
      text: "Invalid request type",
      success: false
    });

  } catch (error) {
    console.error('Error processing whiteboard request:', error);
    return NextResponse.json({
      text: "An error occurred while processing your request: " + (error instanceof Error ? error.message : 'Unknown error'),
      success: false
    }, { status: 500 });
  } finally {
    // Clean up the saved image file if it exists
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log('Image file deleted:', filePath);
    }
  }
}