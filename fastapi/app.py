import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from dotenv import load_dotenv

# Import the AI animation router
from ai_animation.route import router as ai_animation_router
from system_design.route import router as system_design_router

# Import the roadmap generation router
from roadmap_gen.route import router as roadmap_router

# Load environment variables
load_dotenv()

# Media directory setup
MEDIA_DIR = Path("media")
MEDIA_DIR.mkdir(exist_ok=True)

# Create FastAPI app
app = FastAPI(
    title="Interview AI Platform",
    description="AI-powered platform for interviews with animation generation, system design, and career roadmap capabilities",
    version="1.0.0",
)

cors_origins = [
    "http://localhost:3000",
    "https://chakrigo-240946f06d7b.herokuapp.com/",
]

if os.getenv("CORS_ORIGINS"):
    cors_origins.extend(os.getenv("CORS_ORIGINS").split(","))

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files directory
app.mount("/media", StaticFiles(directory=str(MEDIA_DIR.absolute())), name="media")

# Include routers
app.include_router(ai_animation_router)
app.include_router(system_design_router)
app.include_router(roadmap_router)


@app.get("/")
def read_root():
    """Root endpoint with welcome message"""
    return {
        "message": "Welcome to the Interview AI Platform",
        "documentation": "/docs",
        "api_version": "1.0.0",
        "services": {
            "ai_animation": "/ai-animation",
            "system_design": "/system-design",
            "roadmap_generation": "/roadmap",
        },
    }


@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "services": {
            "ai_animation": "active",
            "system_design": "active",
            "roadmap_gen": "active",
        },
        "media_directory": str(MEDIA_DIR.absolute()),
    }


@app.get("/api-info")
def get_api_info():
    """Get detailed API information"""
    return {
        "platform": "Interview AI Platform",
        "version": "1.0.0",
        "services": {
            "ai_animation": {
                "description": "Generate AI-powered animations and avatars",
                "endpoints": ["/ai-animation/generate", "/ai-animation/health"],
                "features": [
                    "Avatar generation",
                    "Animation creation",
                    "Media management",
                ],
            },
            "system_design": {
                "description": "Generate system architecture diagrams and explanations",
                "endpoints": [
                    "/system-design/generate",
                    "/system-design/generate-stream",
                    "/system-design/health",
                ],
                "features": [
                    "PlantUML diagrams",
                    "Architecture analysis",
                    "Streaming generation",
                ],
            },
            "roadmap_generation": {
                "description": "Generate career learning roadmaps and guides",
                "endpoints": [
                    "/roadmap/generate",
                    "/roadmap/generate-stream",
                    "/roadmap/health",
                    "/roadmap/examples",
                ],
                "features": [
                    "Career analysis",
                    "Interactive roadmaps",
                    "Learning resources",
                    "Progress tracking",
                ],
            },
        },
        "common_features": [
            "Streaming responses",
            "Progress tracking",
            "Error handling",
            "Health monitoring",
        ],
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
        "media_directory": str(MEDIA_DIR.absolute()),
    }


@app.get("/media-info")
async def media_info_legacy():
    """Legacy media info endpoint for backward compatibility"""
    try:
        from ai_animation.agent import AnimationAgent

        animation_agent = AnimationAgent(MEDIA_DIR)
        return animation_agent.get_media_info()
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error getting media info: {str(e)}"
        )


@app.get("/service-status")
async def get_service_status():
    """Get detailed status of all services"""
    status = {"overall_status": "healthy", "services": {}}

    # Check AI Animation service
    try:
        from ai_animation.agent import AnimationAgent

        animation_agent = AnimationAgent(MEDIA_DIR)
        status["services"]["ai_animation"] = {
            "status": "healthy",
            "media_directory": str(MEDIA_DIR.absolute()),
        }
    except Exception as e:
        status["services"]["ai_animation"] = {"status": "error", "error": str(e)}

    # Check System Design service
    try:
        from system_design.agent import SystemDesignGenerationSystem

        system_design_system = SystemDesignGenerationSystem()
        status["services"]["system_design"] = {
            "status": "healthy",
            "features": ["LangGraph workflow", "PlantUML generation", "Streaming"],
        }
    except Exception as e:
        status["services"]["system_design"] = {"status": "error", "error": str(e)}

    # Check Roadmap Generation service
    try:
        from roadmap_gen.agent import RoadmapGenerationSystem

        roadmap_system = RoadmapGenerationSystem()
        status["services"]["roadmap_generation"] = {
            "status": "healthy",
            "features": [
                "Career analysis",
                "Interactive roadmaps",
                "React Flow",
                "Streaming",
            ],
        }
    except Exception as e:
        status["services"]["roadmap_generation"] = {"status": "error", "error": str(e)}

    # Check if any service has errors
    if any(service.get("status") == "error" for service in status["services"].values()):
        status["overall_status"] = "degraded"

    return status


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
