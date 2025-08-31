import os
import re
import subprocess
import uuid
import tempfile
import json
import logging
from pathlib import Path
from typing import Optional, Dict, Any, Generator
from dotenv import load_dotenv
from langgraph.graph import StateGraph, END
from langchain_core.prompts import ChatPromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

HEROKU_MODE = os.getenv("HEROKU_MODE", "false").lower() == "true"

class AnimationGenerationSystem:
    def __init__(self, media_dir: Path):
        """Initialize the Animation Generation System with LangGraph"""
        self.media_dir = media_dir
        self.media_dir.mkdir(exist_ok=True)
        
        # Set up the API key
        api_key = os.getenv("GOOGLE_GENERATIVE_AI_API_KEY")
        if not api_key:
            raise ValueError("GOOGLE_GENERATIVE_AI_API_KEY environment variable is not set")
        
        # Initialize LLM
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-1.5-flash",
            google_api_key=api_key,
            temperature=0.7
        )
        
        logger.info("Animation Generation System initialized")
    
    def _analyze_prompt(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """First stage: Analyze the user prompt and determine animation requirements"""
        try:
            prompt = state["user_prompt"]
            logger.info(f"Analyzing prompt: {prompt}")
            
            analysis_prompt = ChatPromptTemplate.from_template(
                """Analyze the following animation request and provide structured information:
                
                Request: {prompt}
                
                Provide your analysis in the following JSON format:
                {{
                    "animation_type": "mathematical/scientific/algorithmic/educational/abstract",
                    "complexity": "simple/medium/complex",
                    "key_concepts": ["concept1", "concept2", "concept3"],
                    "suggested_duration": "5-15 seconds",
                    "visual_elements": ["element1", "element2"],
                    "manim_objects": ["Circle", "Square", "Text", "Arrow", etc.],
                    "animation_techniques": ["Create", "Transform", "FadeIn", "Write", etc.],
                    "requirements_summary": "Brief summary of what needs to be animated"
                }}
                
                Focus on identifying the core concepts that need visualization and the appropriate Manim objects and techniques to use.
                """
            )
            
            chain = analysis_prompt | self.llm
            response = chain.invoke({"prompt": prompt})
            
            # Extract JSON from response
            analysis = self._extract_json(response.content)
            
            return {
                **state,
                "analysis": analysis,
                "stage": "analysis_complete"
            }
            
        except Exception as e:
            logger.error(f"Error in _analyze_prompt: {str(e)}")
            return {
                **state,
                "error": f"Failed to analyze prompt: {str(e)}",
                "stage": "error"
            }
    
    def _generate_code(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """Second stage: Generate Manim code based on analysis"""
        try:
            analysis = state["analysis"]
            prompt = state["user_prompt"]
            
            logger.info("Generating Manim code based on analysis")
            
            code_generation_prompt = ChatPromptTemplate.from_template(
                """Based on the following analysis, generate complete Manim code for the animation:
                
                Original Request: {prompt}
                Analysis: {analysis}
                
                Generate Python code that uses the Manim library. Follow these requirements:
                
                1. Import Statement: Start with "from manim import *"
                2. Scene Class: Create a single Scene class that extends Scene
                3. Animation Duration: Make the animation {duration}
                4. Visual Elements: Use the suggested Manim objects: {manim_objects}
                5. Animation Techniques: Use techniques like: {animation_techniques}
                6. Code Quality: Include comments explaining each step
                7. Styling: Use appropriate colors, positioning, and visual hierarchy
                8. Smooth Transitions: Ensure smooth animations between states
                
                Key Concepts to Visualize: {key_concepts}
                
                Format your response as:
                ```python
                [Complete Manim code here]
                ```
                
                Then provide a brief explanation of how the animation works.
                
                Make sure the code is complete, executable, and follows Manim best practices.
                """
            )
            
            chain = code_generation_prompt | self.llm
            response = chain.invoke({
                "prompt": prompt,
                "analysis": json.dumps(analysis, indent=2),
                "duration": analysis.get("suggested_duration", "5-10 seconds"),
                "manim_objects": ", ".join(analysis.get("manim_objects", [])),
                "animation_techniques": ", ".join(analysis.get("animation_techniques", [])),
                "key_concepts": ", ".join(analysis.get("key_concepts", []))
            })
            
            # Extract code and explanation
            code = self._extract_python_code(response.content)
            explanation = self._extract_explanation(response.content)
            
            return {
                **state,
                "generated_code": code,
                "explanation": explanation,
                "stage": "code_generated"
            }
            
        except Exception as e:
            logger.error(f"Error in _generate_code: {str(e)}")
            return {
                **state,
                "error": f"Failed to generate code: {str(e)}",
                "stage": "error"
            }
    
    def _sanitize_code(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """Third stage: Sanitize and validate the generated code"""
        try:
            code = state["generated_code"]
            logger.info("Sanitizing generated code")
            
            # Basic sanitization - prevent dangerous imports and operations
            disallowed_imports = [
                'os.system', 'subprocess', 'eval', 'exec', 'shutil.rmtree', 
                'sys.exit', '__import__', 'open(', 'file(', 'input(',
                'raw_input(', 'compile(', 'globals(', 'locals('
            ]
            
            for item in disallowed_imports:
                if item in code:
                    raise ValueError(f"Code contains disallowed operation: {item}")
            
            # Ensure the code creates a scene class that extends Scene
            if not re.search(r'class\s+\w+\(\s*Scene\s*\)', code):
                raise ValueError("Code must define a Scene class")
            
            # Ensure required imports are present
            if 'from manim import *' not in code and 'import manim' not in code:
                code = 'from manim import *\n\n' + code
            
            return {
                **state,
                "sanitized_code": code,
                "stage": "code_sanitized"
            }
            
        except Exception as e:
            logger.error(f"Error in _sanitize_code: {str(e)}")
            return {
                **state,
                "error": f"Failed to sanitize code: {str(e)}",
                "stage": "error"
            }
    
    def _render_animation(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """Fourth stage: Render the animation using Manim"""
        try:
            code = state["sanitized_code"]
            animation_id = str(uuid.uuid4())[:8]
            
            logger.info(f"Rendering animation with ID: {animation_id}")
            
            if HEROKU_MODE:
                logger.info("Deployment mode: Skipping actual manim rendering")
                
                # Create mock output file for deployment
                mock_filename = f"{animation_id}.mp4"
                mock_file_path = self.media_dir / "videos" / "animation_code" / "1080p60" / mock_filename
                mock_file_path.parent.mkdir(parents=True, exist_ok=True)
                
                # Create a small placeholder file
                with open(mock_file_path, "w") as f:
                    f.write("Mock video file for deployment - Manim rendering not available on Heroku")
                
                return {
                    **state,
                    "animation_id": animation_id,
                    "video_url": f"/media/videos/animation_code/1080p60/{mock_filename}",
                    "stage": "render_complete",
                }
            
            # Create a temporary directory for the code
            with tempfile.TemporaryDirectory() as temp_dir:
                # Create a Python file with the code
                file_path = os.path.join(temp_dir, "animation_code.py")
                with open(file_path, "w") as f:
                    f.write(code)
                
                # Get the Scene class name from the code
                scene_match = re.search(r'class\s+(\w+)\(\s*Scene\s*\)', code)
                if not scene_match:
                    raise ValueError("Could not find Scene class in the code")
                
                scene_name = scene_match.group(1)
                
                # Ensure media directory structure exists
                videos_dir = self.media_dir / "videos"
                images_dir = self.media_dir / "images"
                texts_dir = self.media_dir / "texts"
                tex_dir = self.media_dir / "Tex"
                
                for dir_path in [videos_dir, images_dir, texts_dir, tex_dir]:
                    dir_path.mkdir(exist_ok=True)
                
                # Manim command
                command = [
                    "manim", 
                    "render",
                    file_path, 
                    scene_name,
                    "-o", f"{animation_id}.mp4",
                    "--media_dir", str(self.media_dir),
                    "-q", "m",
                    "--fps", "30",
                    "--format", "mp4",
                    "--disable_caching"
                ]
                
                logger.info(f"Running command: {' '.join(command)}")
                process = subprocess.run(
                    command,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    text=True,
                    timeout=120
                )
                
                if process.returncode != 0:
                    logger.error(f"Manim error: {process.stderr}")
                    raise ValueError(f"Failed to render animation: {process.stderr}")
                
                # Find the generated video file
                video_url = self._find_generated_video(animation_id)
                
                return {
                    **state,
                    "video_url": video_url,
                    "animation_id": animation_id,
                    "stage": "render_complete"
                }
                
        except Exception as e:
            logger.error(f"Error in _render_animation: {str(e)}")
            return {
                **state,
                "error": f"Failed to render animation: {str(e)}",
                "stage": "error"
            }
    
    def _should_continue_or_end(self, state: Dict[str, Any]) -> str:
        """Decision node: determine next step based on current stage"""
        stage = state.get("stage", "")
        
        if stage == "analysis_complete":
            return "generate_code"
        elif stage == "code_generated":
            return "sanitize_code"
        elif stage == "code_sanitized":
            return "render_animation"
        elif stage == "render_complete":
            return END
        elif stage == "error":
            return END
        else:
            return END
    
    def _extract_json(self, text: str) -> Dict[str, Any]:
        """Extract JSON from LLM response text"""
        try:
            # Try finding ```json blocks first
            if "```json" in text:
                match = text.split("```json", 1)
                if len(match) > 1 and "```" in match[1]:
                    json_str = match[1].split("```", 1)[0].strip()
            # Fallback to finding plain ``` blocks
            elif "```" in text:
                match = text.split("```", 1)
                if len(match) > 1 and "```" in match[1]:
                    json_str = match[1].split("```", 1)[0].strip()
            else:
                # Try to find JSON-like structure
                start = text.find('{')
                if start != -1:
                    json_str = text[start:]
                else:
                    json_str = text
            
            return json.loads(json_str)
            
        except json.JSONDecodeError:
            logger.warning("Failed to parse JSON, returning default structure")
            return {
                "animation_type": "general",
                "complexity": "medium",
                "key_concepts": ["visualization"],
                "suggested_duration": "5-10 seconds",
                "visual_elements": ["basic shapes"],
                "manim_objects": ["Circle", "Text"],
                "animation_techniques": ["Create", "FadeIn"],
                "requirements_summary": "General animation request"
            }
    
    def _extract_python_code(self, text: str) -> str:
        """Extract Python code blocks from the generated text"""
        python_pattern = r"```(?:python)?\s*([\s\S]*?)```"
        matches = re.findall(python_pattern, text)
        
        if matches:
            return matches[0].strip()
        return ""
    
    def _extract_explanation(self, text: str) -> str:
        """Extract explanation from the generated text"""
        parts = text.split("```")
        if len(parts) >= 3:
            return parts[-1].strip()
        return "No explanation provided."
    
    def _find_generated_video(self, filename: str) -> Optional[str]:
        """Find the generated video file in the media directory"""
        logger.info(f"Searching for video file with base name: {filename}")
        
        # Search recursively for any mp4 file with the filename
        for path in self.media_dir.rglob(f"*{filename}*.mp4"):
            if path.is_file():
                relative_path = path.relative_to(self.media_dir)
                video_url = f"/media/{relative_path}".replace("\\", "/")
                logger.info(f"Found video at: {video_url}")
                return video_url
        
        # Search for any recently created mp4 file
        mp4_files = list(self.media_dir.rglob("*.mp4"))
        if mp4_files:
            latest_file = max(mp4_files, key=lambda x: x.stat().st_mtime)
            relative_path = latest_file.relative_to(self.media_dir)
            video_url = f"/media/{relative_path}".replace("\\", "/")
            logger.info(f"Using most recent mp4 file: {video_url}")
            return video_url
        
        logger.warning("No video files found")
        return None
    
    def build_graph(self):
        """Build the workflow graph for animation generation"""
        workflow = StateGraph(dict)
        
        # Add nodes for the workflow
        workflow.add_node("analyze_prompt", self._analyze_prompt)
        workflow.add_node("generate_code", self._generate_code)
        workflow.add_node("sanitize_code", self._sanitize_code)
        workflow.add_node("render_animation", self._render_animation)
        
        # Set entry point
        workflow.set_entry_point("analyze_prompt")
        
        # Define conditional edges
        workflow.add_conditional_edges(
            "analyze_prompt",
            self._should_continue_or_end,
            {
                "generate_code": "generate_code",
                END: END
            }
        )
        
        workflow.add_conditional_edges(
            "generate_code",
            self._should_continue_or_end,
            {
                "sanitize_code": "sanitize_code",
                END: END
            }
        )
        
        workflow.add_conditional_edges(
            "sanitize_code",
            self._should_continue_or_end,
            {
                "render_animation": "render_animation",
                END: END
            }
        )
        
        workflow.add_conditional_edges(
            "render_animation",
            self._should_continue_or_end,
            {
                END: END
            }
        )
        
        # Compile graph
        logger.info("Compiling animation generation workflow graph")
        compiled_graph = workflow.compile()
        return compiled_graph
    
    def create_animation_stream(self, prompt: str) -> Generator[Dict[str, Any], None, None]:
        """Generate animation with streaming progress updates"""
        logger.info(f"Starting animation generation for prompt: {prompt}")
        
        workflow = self.build_graph()
        
        initial_state = {
            "user_prompt": prompt,
            "stage": "starting"
        }
        
        try:
            # Stream the execution
            for state_update in workflow.stream(initial_state, {"recursion_limit": 20}):
                # Get the actual state dictionary
                last_node = list(state_update.keys())[-1]
                current_state = state_update[last_node]
                
                # Determine progress based on stage
                stage = current_state.get("stage", "starting")
                progress_mapping = {
                    "starting": 0,
                    "analysis_complete": 25,
                    "code_generated": 50,
                    "code_sanitized": 75,
                    "render_complete": 100,
                    "error": -1
                }
                
                progress = progress_mapping.get(stage, 0)
                
                # Yield progress update
                yield {
                    "status": "error" if stage == "error" else "in_progress" if progress < 100 else "complete",
                    "progress": progress,
                    "stage": stage,
                    "stage_description": self._get_stage_description(stage),
                    "error": current_state.get("error"),
                    "analysis": current_state.get("analysis"),
                    "code": current_state.get("sanitized_code", current_state.get("generated_code")),
                    "explanation": current_state.get("explanation"),
                    "video_url": current_state.get("video_url"),
                    "animation_id": current_state.get("animation_id")
                }
                
        except Exception as e:
            logger.error(f"Workflow stream failed: {str(e)}")
            yield {
                "status": "error",
                "progress": -1,
                "stage": "error",
                "error": f"Workflow failed: {str(e)}",
                "stage_description": "Error occurred during processing"
            }
    
    def create_animation(self, prompt: str) -> Dict[str, Any]:
        """Create animation and return final result (non-streaming)"""
        # Get the final state from the stream
        final_result = None
        for update in self.create_animation_stream(prompt):
            final_result = update
        
        if final_result and final_result.get("status") == "complete":
            return {
                "code": final_result.get("code", ""),
                "explanation": final_result.get("explanation", ""),
                "video_url": final_result.get("video_url")
            }
        else:
            error_msg = final_result.get("error", "Unknown error") if final_result else "No result received"
            return {
                "code": final_result.get("code", "") if final_result else "",
                "explanation": f"Error: {error_msg}",
                "video_url": None
            }
    
    def _get_stage_description(self, stage: str) -> str:
        """Get human-readable description for each stage"""
        descriptions = {
            "starting": "Initializing animation generation...",
            "analysis_complete": "Analyzing your request and planning the animation...",
            "code_generated": "Generating optimized Manim code...",
            "code_sanitized": "Validating and securing the code...",
            "render_complete": "Animation rendered successfully!",
            "error": "An error occurred during processing"
        }
        return descriptions.get(stage, "Processing...")
    
    def get_media_info(self) -> Dict[str, Any]:
        """Get information about files in the media directory"""
        media_dir_path = self.media_dir.absolute()
        
        all_files = []
        mp4_files = []
        for path in media_dir_path.rglob('*'):
            if path.is_file():
                relative_path = path.relative_to(media_dir_path)
                all_files.append(str(relative_path))
                if path.suffix == '.mp4':
                    mp4_files.append(str(relative_path))
        
        return {
            "media_directory": str(media_dir_path),
            "file_count": len(all_files),
            "mp4_count": len(mp4_files),
            "all_files": all_files,
            "mp4_files": mp4_files
        }

# Legacy compatibility class
class AnimationAgent:
    """Legacy wrapper for backward compatibility"""
    def __init__(self, media_dir: Path):
        self.system = AnimationGenerationSystem(media_dir)
        self.media_dir = media_dir
    
    def create_animation(self, prompt: str) -> Dict[str, Any]:
        return self.system.create_animation(prompt)
    
    def get_media_info(self) -> Dict[str, Any]:
        return self.system.get_media_info()