import os
import asyncio
import tempfile
import json
import logging
import shutil
from typing import Optional
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from pathlib import Path

# Import your existing modules
from .script_generator import script_generator
from .main_code_generator import manim_generator
from .animation_creator import create_animation_from_code

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ai-animation", tags=["AI Animation"])

class AnimationRequest(BaseModel):
    prompt: str

class AnimationResponse(BaseModel):
    status: str
    message: str
    video_url: Optional[str] = None
    analysis: Optional[dict] = None
    code: Optional[str] = None
    error: Optional[str] = None

@router.post("/generate", response_model=AnimationResponse)
async def generate_animation(request: AnimationRequest):
    """
    Generate a video animation from a text prompt using Manim and Gemini.
    
    Workflow:
    1. User provides text prompt
    2. Generate educational breakdown using Gemini
    3. Create Manim code using Gemini
    4. Render video using Manim
    5. Return video URL
    """
    try:
        logger.info(f"Received animation request: {request.prompt}")
        
        # Check if generators are initialized
        if script_generator is None:
            raise HTTPException(
                status_code=500,
                detail="Script generator not initialized. Please check GOOGLE_GENERATIVE_AI_API_KEY in environment variables."
            )
        
        if manim_generator is None:
            raise HTTPException(
                status_code=500,
                detail="Manim generator not initialized. Please check GOOGLE_GENERATIVE_AI_API_KEY in environment variables."
            )
        
        # Step 1: Generate educational breakdown and video plan
        logger.info("Step 1: Generating educational breakdown...")
        video_plan = script_generator.generate_complete_video_plan(request.prompt)
        
        if not video_plan:
            raise HTTPException(
                status_code=400, 
                detail="Failed to generate educational breakdown from prompt"
            )
        
        # Step 2: Generate Manim code
        logger.info("Step 2: Generating Manim code...")
        manim_code = manim_generator.generate_3b1b_manim_code(video_plan)
        
        if not manim_code:
            raise HTTPException(
                status_code=400, 
                detail="Failed to generate Manim code"
            )
        
        # Step 3: Create animation video
        logger.info("Step 3: Rendering animation...")
        video_path = create_animation_from_code(manim_code)
        
        if not video_path:
            raise HTTPException(
                status_code=500, 
                detail="Failed to render animation video"
            )
        
        # Convert absolute path to relative URL
        media_dir = Path("media")
        video_path_obj = Path(video_path)
        
        # Find relative path from media directory
        try:
            relative_path = video_path_obj.relative_to(media_dir.absolute())
            video_url = f"/media/{relative_path}"
        except ValueError:
            # If video is not in media directory, copy it there
            import shutil
            filename = video_path_obj.name
            new_path = media_dir / "videos" / filename
            new_path.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(video_path, new_path)
            video_url = f"/media/videos/{filename}"
        
        logger.info(f"Animation generated successfully: {video_url}")
        
        return AnimationResponse(
            status="success",
            message="Animation generated successfully",
            video_url=video_url,
            analysis=video_plan.get("educational_breakdown"),
            code=manim_code
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating animation: {str(e)}")
        return AnimationResponse(
            status="error",
            message="Failed to generate animation",
            error=str(e)
        )

@router.post("/generate-stream")
async def generate_animation_stream(request: AnimationRequest):
    """
    Generate animation with streaming progress updates.
    """
    async def generate():
        try:
            # Check if generators are initialized
            if script_generator is None:
                yield f"data: {json.dumps({'status': 'error', 'error': 'Script generator not initialized. Please check GOOGLE_GENERATIVE_AI_API_KEY.'})}\n\n"
                return
            
            if manim_generator is None:
                yield f"data: {json.dumps({'status': 'error', 'error': 'Manim generator not initialized. Please check GOOGLE_GENERATIVE_AI_API_KEY.'})}\n\n"
                return
            
            # Initial response
            yield f"data: {json.dumps({'status': 'in_progress', 'progress': 0, 'stage': 'starting', 'stage_description': 'Initializing animation generation...'})}\n\n"
            
            # Step 1: Educational breakdown
            yield f"data: {json.dumps({'status': 'in_progress', 'progress': 20, 'stage': 'analysis', 'stage_description': 'Analyzing prompt and creating educational breakdown...'})}\n\n"
            
            video_plan = script_generator.generate_complete_video_plan(request.prompt)
            if not video_plan:
                yield f"data: {json.dumps({'status': 'error', 'error': 'Failed to generate educational breakdown'})}\n\n"
                return
            
            # Step 2: Code generation
            yield f"data: {json.dumps({'status': 'in_progress', 'progress': 50, 'stage': 'code_generation', 'stage_description': 'Generating Manim animation code...'})}\n\n"
            
            manim_code = manim_generator.generate_3b1b_manim_code(video_plan)
            if not manim_code:
                yield f"data: {json.dumps({'status': 'error', 'error': 'Failed to generate Manim code'})}\n\n"
                return
            
            # Step 3: Video rendering
            yield f"data: {json.dumps({'status': 'in_progress', 'progress': 80, 'stage': 'rendering', 'stage_description': 'Rendering video animation...'})}\n\n"
            
            video_path = create_animation_from_code(manim_code)
            if not video_path:
                yield f"data: {json.dumps({'status': 'error', 'error': 'Failed to render video'})}\n\n"
                return
            
            # Process video URL
            media_dir = Path("media")
            video_path_obj = Path(video_path)
            
            try:
                relative_path = video_path_obj.relative_to(media_dir.absolute())
                video_url = f"/media/{relative_path}"
            except ValueError:
                import shutil
                filename = video_path_obj.name
                new_path = media_dir / "videos" / filename
                new_path.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(video_path, new_path)
                video_url = f"/media/videos/{filename}"
            
            # Final success response
            final_response = {
                'status': 'complete',
                'progress': 100,
                'stage': 'complete',
                'stage_description': 'Animation generated successfully!',
                'video_url': video_url,
                'analysis': video_plan.get("educational_breakdown"),
                'code': manim_code,
                'explanation': f"Successfully generated animation for: {request.prompt}"
            }
            
            yield f"data: {json.dumps(final_response)}\n\n"
            
        except Exception as e:
            logger.error(f"Streaming error: {str(e)}")
            yield f"data: {json.dumps({'status': 'error', 'error': str(e)})}\n\n"
    
    return StreamingResponse(
        generate(),
        media_type="text/plain",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*",
        }
    )

@router.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "AI Animation Generator"}

@router.post("/test-prompt")
async def test_prompt_analysis(request: AnimationRequest):
    """Test endpoint to analyze prompt without generating video."""
    try:
        if script_generator is None:
            raise HTTPException(
                status_code=500,
                detail="Script generator not initialized. Please check GOOGLE_GENERATIVE_AI_API_KEY."
            )
            
        video_plan = script_generator.generate_complete_video_plan(request.prompt)
        
        if not video_plan:
            raise HTTPException(status_code=400, detail="Failed to analyze prompt")
        
        return {
            "status": "success",
            "analysis": video_plan.get("educational_breakdown"),
            "manim_structure": video_plan.get("manim_structure")
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error analyzing prompt: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@router.post("/test-code-generation")
async def test_code_generation(request: AnimationRequest):
    """Test endpoint to generate Manim code without rendering."""
    try:
        if script_generator is None:
            raise HTTPException(
                status_code=500,
                detail="Script generator not initialized. Please check GOOGLE_GENERATIVE_AI_API_KEY."
            )
            
        if manim_generator is None:
            raise HTTPException(
                status_code=500,
                detail="Manim generator not initialized. Please check GOOGLE_GENERATIVE_AI_API_KEY."
            )
        
        # Generate video plan
        video_plan = script_generator.generate_complete_video_plan(request.prompt)
        if not video_plan:
            raise HTTPException(status_code=400, detail="Failed to generate video plan")
        
        # Generate Manim code
        manim_code = manim_generator.generate_3b1b_manim_code(video_plan)
        if not manim_code:
            raise HTTPException(status_code=400, detail="Failed to generate Manim code")
        
        return {
            "status": "success",
            "code": manim_code,
            "analysis": video_plan.get("educational_breakdown")
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating code: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Code generation failed: {str(e)}")