from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
import json
import asyncio
import logging
from .agent import RoadmapGenerationSystem

# Configure logging
logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/roadmap", tags=["Roadmap"])

# Initialize the roadmap system
roadmap_system = RoadmapGenerationSystem()

class RoadmapRequest(BaseModel):
    career_path: str

class RoadmapResponse(BaseModel):
    analysis: Optional[dict] = None
    roadmap_structure: dict
    detailed_description: str
    roadmap_id: Optional[str] = None
    metadata: Optional[dict] = None

class StreamingRoadmapRequest(BaseModel):
    career_path: str

@router.post("/generate", response_model=RoadmapResponse)
async def generate_roadmap(request: RoadmapRequest):
    """Generate a career roadmap based on user input (non-streaming)"""
    if not request.career_path or not request.career_path.strip():
        raise HTTPException(status_code=400, detail="Career path is required and cannot be empty")
    
    try:
        logger.info(f"Generating roadmap for: {request.career_path[:100]}...")
        result = roadmap_system.create_roadmap(request.career_path.strip())
        
        return RoadmapResponse(
            analysis=result["analysis"],
            roadmap_structure=result["roadmap_structure"],
            detailed_description=result["detailed_description"],
            roadmap_id=result["roadmap_id"],
            metadata=result["metadata"]
        )
        
    except Exception as e:
        logger.error(f"Error in generate_roadmap: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating roadmap: {str(e)}")

@router.post("/generate-stream")
async def generate_roadmap_stream(request: StreamingRoadmapRequest):
    """Generate a career roadmap with streaming progress updates"""
    if not request.career_path or not request.career_path.strip():
        raise HTTPException(status_code=400, detail="Career path is required and cannot be empty")
    
    async def event_stream():
        try:
            logger.info(f"Starting streaming generation for: {request.career_path[:100]}...")
            for update in roadmap_system.create_roadmap_stream(request.career_path.strip()):
                # Format as Server-Sent Events
                event_data = json.dumps(update)
                yield f"data: {event_data}\n\n"
                
                # Small delay to prevent overwhelming the client
                await asyncio.sleep(0.1)
                
        except Exception as e:
            logger.error(f"Streaming error: {str(e)}")
            error_data = json.dumps({
                "status": "error",
                "error": f"Error generating roadmap: {str(e)}",
                "progress": -1,
                "stage": "error",
                "stage_description": "Generation failed"
            })
            yield f"data: {error_data}\n\n"
    
    return StreamingResponse(
        event_stream(),
        media_type="text/plain",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Content-Type": "text/event-stream",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Allow-Methods": "*",
        }
    )

@router.get("/health")
async def health_check():
    """Health check endpoint for the roadmap service"""
    return {
        "status": "healthy",
        "service": "Career Roadmap Generator (LangGraph)",
        "features": [
            "LangGraph workflow",
            "Streaming progress updates", 
            "Multi-stage processing",
            "Career analysis",
            "React Flow roadmap",
            "Detailed descriptions"
        ]
    }

@router.get("/workflow-info")
async def get_workflow_info():
    """Get information about the LangGraph workflow stages"""
    return {
        "workflow_stages": [
            {
                "stage": "analyze_career",
                "description": "Analyze career path requirements and market context",
                "outputs": ["career_type", "difficulty", "duration", "skills"]
            },
            {
                "stage": "generate_roadmap", 
                "description": "Create detailed learning roadmap with React Flow structure",
                "outputs": ["nodes", "edges", "phases"]
            },
            {
                "stage": "generate_description",
                "description": "Generate comprehensive career guide and learning strategy",
                "outputs": ["detailed_description"]
            },
            {
                "stage": "finalize_roadmap",
                "description": "Add metadata and validate roadmap structure",
                "outputs": ["roadmap_id", "metadata"]
            }
        ],
        "benefits": [
            "Comprehensive career analysis",
            "Interactive React Flow roadmap", 
            "Detailed learning resources",
            "Phase-based progression",
            "Industry insights",
            "Streaming progress updates"
        ]
    }

@router.get("/examples")
async def get_career_examples():
    """Get example career paths that work well with the system"""
    return {
        "popular_paths": [
            "Frontend Developer",
            "Backend Developer",
            "Full Stack Developer",
            "Data Scientist",
            "Machine Learning Engineer",
            "DevOps Engineer",
            "Blockchain Developer",
            "Mobile App Developer",
            "UI/UX Designer",
            "Cybersecurity Specialist",
            "Cloud Architect",
            "SQA Engineer",
            "Product Manager",
            "AI Engineer",
            "Game Developer"
        ],
        "categories": {
            "Development": ["Frontend Developer", "Backend Developer", "Full Stack Developer"],
            "Data & AI": ["Data Scientist", "Machine Learning Engineer", "AI Engineer"],
            "Infrastructure": ["DevOps Engineer", "Cloud Architect", "Cybersecurity Specialist"],
            "Design": ["UI/UX Designer", "Game Developer"],
            "Quality": ["SQA Engineer", "Test Automation Engineer"],
            "Management": ["Product Manager", "Technical Lead"]
        }
    }