from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from dotenv import load_dotenv
from typing import Optional

# Import the AI animation router
from ai_animation.route import router as ai_animation_router
from system_design.route import router as system_design_router

# Load environment variables
load_dotenv()

# Media directory setup
MEDIA_DIR = Path("media")
MEDIA_DIR.mkdir(exist_ok=True)

# Create FastAPI app
app = FastAPI(
    title="Interview AI Platform",
    description="AI-powered platform for interviews with animation generation capabilities",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development - restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files directory
app.mount("/media", StaticFiles(directory=str(MEDIA_DIR.absolute())), name="media")

# Include routers
app.include_router(ai_animation_router)
app.include_router(system_design_router)

@app.get("/")
def read_root():
    """Root endpoint with welcome message"""
    return {
        # not a real API, just a placeholder
        "message": "Welcome to the Interview AI Platform",
        "documentation": "/docs",
        "api_version": "1.0.0",
        
    }

@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
         "services": {
            "ai_animation": "active",
            "system_design": "active"
        },
        "media_directory": str(MEDIA_DIR.absolute())
    }

@app.get("/test-media")
async def test_media():
    """Test endpoint to verify media serving"""
    # Create a simple test file
    test_file = Path(MEDIA_DIR) / "test.txt"
    test_file.write_text("This is a test file from Interview AI Platform")
    return {
        "message": "Test file created successfully",
        "url": "/media/test.txt",
        "media_directory": str(MEDIA_DIR.absolute())
    }

# Legacy endpoint for backward compatibility
# @app.post("/generate-animation")
# async def generate_animation_legacy(request: dict):
#     """
#     Legacy endpoint for animation generation (redirects to new endpoint)
#     This maintains backward compatibility with existing frontend code
#     """
#     try:
#         # Import here to avoid circular imports
#         from ai_animation.agent import AnimationAgent
        
#         animation_agent = AnimationAgent(MEDIA_DIR)
        
#         if not request.get("prompt"):
#             raise HTTPException(status_code=400, detail="Prompt is required")
        
#         result = animation_agent.create_animation(request["prompt"])
        
#         return {
#             "code": result["code"],
#             "explanation": result["explanation"],
#             "video_url": result["video_url"]  # This can now be None
#         }
        
#     except Exception as e:
#         print(f"Error in legacy endpoint: {str(e)}")
#         raise HTTPException(status_code=500, detail=f"Error generating animation: {str(e)}")
    



@app.get("/media-info")
async def media_info_legacy():
    """Legacy media info endpoint for backward compatibility"""
    try:
        from ai_animation.agent import AnimationAgent
        animation_agent = AnimationAgent(MEDIA_DIR)
        return animation_agent.get_media_info()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting media info: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)