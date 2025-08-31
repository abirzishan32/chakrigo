import os
import re
import json
import logging
import uuid
import base64
import zlib
from typing import Dict, Any, Generator
from dotenv import load_dotenv
from langgraph.graph import StateGraph, END
from langchain_core.prompts import ChatPromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()


def encode_plantuml(plantuml_text: str) -> str:
    """
    Encode PlantUML text using the PlantUML compression algorithm.
    Custom implementation to avoid dependency issues.
    """

    try:
        # UTF-8 encode
        utf8_bytes = plantuml_text.encode('utf-8')
        
        # Deflate compress
        compressed = zlib.compress(utf8_bytes, 9)[2:-4]  # Remove zlib header/footer
        
        # Base64 encode with PlantUML character set
        plantuml_alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_'
        standard_alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
        
        # Standard base64 encode
        b64 = base64.b64encode(compressed).decode('ascii')
        
        # Translate to PlantUML alphabet
        translated = ''
        for char in b64:
            if char in standard_alphabet:
                idx = standard_alphabet.index(char)
                translated += plantuml_alphabet[idx]
            else:
                translated += char
        
        return translated
    except Exception as e:
        logger.error(f"Error encoding PlantUML: {e}")
        # Fallback to simple base64 encoding
        return base64.b64encode(plantuml_text.encode('utf-8')).decode('ascii')


class SystemDesignGenerationSystem:
    def __init__(self):
        """Initialize the System Design Generation System with LangGraph"""
        
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
        
        logger.info("System Design Generation System initialized")
    
    def _analyze_requirements(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """First stage: Analyze the system design requirements"""
        try:
            prompt = state["user_prompt"]
            logger.info(f"Analyzing requirements: {prompt}")
            
            analysis_prompt = ChatPromptTemplate.from_template(
                """Analyze the following system design request and provide structured requirements:
                
                Request: {prompt}
                
                Provide your analysis in the following JSON format:
                {{
                    "system_type": "web_application/mobile_app/distributed_system/microservices/data_pipeline",
                    "scale": "small/medium/large/enterprise",
                    "key_components": ["component1", "component2", "component3"],
                    "data_flow": ["step1", "step2", "step3"],
                    "technologies": ["tech1", "tech2", "tech3"],
                    "patterns": ["pattern1", "pattern2"],
                    "non_functional_requirements": ["scalability", "reliability", "security"],
                    "estimated_complexity": "low/medium/high",
                    "recommended_architecture": "monolithic/microservices/serverless/hybrid"
                }}
                
                Focus on identifying the core architectural patterns, scalability requirements, and key system components.
                """
            )
            
            chain = analysis_prompt | self.llm
            response = chain.invoke({"prompt": prompt})
            
            # Extract JSON from response
            analysis = self._extract_json(response.content)
            
            return {
                **state,
                "analysis": analysis,
                "stage": "requirements_analyzed"
            }
            
        except Exception as e:
            logger.error(f"Error in _analyze_requirements: {str(e)}")
            return {
                **state,
                "error": f"Failed to analyze requirements: {str(e)}",
                "stage": "error"
            }
    
    def _generate_plantuml(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """Second stage: Generate PlantUML code based on analysis"""
        try:
            analysis = state["analysis"]
            prompt = state["user_prompt"]
            
            logger.info("Generating PlantUML code based on analysis")
            
            plantuml_prompt = ChatPromptTemplate.from_template(
                """Based on the following system analysis, generate a comprehensive PlantUML component diagram:
                
                Original Request: {prompt}
                System Analysis: {analysis}
                
                Create a PlantUML diagram following these requirements:
                
                1. **Syntax Rules:**
                   - Start with @startuml
                   - End with @enduml
                   - Use only valid PlantUML component syntax
                   - Include a meaningful title
                
                2. **Components to Include:**
                   - User interfaces: actor "User" as user
                   - Applications: [Web App] as webapp, [Mobile App] as mobile
                   - Services: [Service Name] as service
                   - Databases: database "DB Name" as db
                   - External systems: cloud "Service" as cloud
                   - APIs: interface "API" as api
                
                3. **Architecture Patterns:**
                   - For {system_type}: Use appropriate layered architecture
                   - Include {recommended_architecture} patterns
                   - Show {key_components} as main components
                   - Implement {patterns} design patterns
                
                4. **Relationships:**
                   - Use --> for dependencies and data flow
                   - Include meaningful labels for connections
                   - Show {data_flow} progression
                
                5. **Styling:**
                   - Group related components with packages
                   - Use consistent naming conventions
                   - Add colors for different component types
                
                Example structure:
                ```
                @startuml
                title {system_type} Architecture
                
                !define BLUE #4A90E2
                !define GREEN #7ED321
                !define ORANGE #F5A623
                !define RED #D0021B
                
                package "Frontend" {{
                    actor "Users" as users
                    [Web Application] as webapp BLUE
                    [Mobile App] as mobile BLUE
                }}
                
                package "Backend Services" {{
                    [API Gateway] as gateway GREEN
                    [Authentication Service] as auth GREEN
                    [Business Logic Service] as business GREEN
                }}
                
                package "Data Layer" {{
                    database "Primary DB" as maindb ORANGE
                    database "Cache" as cache ORANGE
                }}
                
                package "External" {{
                    cloud "CDN" as cdn RED
                    cloud "Payment Gateway" as payment RED
                }}
                
                users --> webapp : HTTP requests
                users --> mobile : mobile access
                webapp --> gateway : API calls
                mobile --> gateway : API calls
                gateway --> auth : authenticate
                gateway --> business : process requests
                business --> maindb : data operations
                business --> cache : cached data
                webapp --> cdn : static content
                business --> payment : payments
                
                @enduml
                ```
                
                Generate a similar comprehensive diagram for the given system.
                Provide ONLY the PlantUML code, nothing else.
                """
            )
            
            chain = plantuml_prompt | self.llm
            response = chain.invoke({
                "prompt": prompt,
                "analysis": json.dumps(analysis, indent=2),
                "system_type": analysis.get("system_type", "system"),
                "recommended_architecture": analysis.get("recommended_architecture", "layered"),
                "key_components": ", ".join(analysis.get("key_components", [])),
                "patterns": ", ".join(analysis.get("patterns", [])),
                "data_flow": " -> ".join(analysis.get("data_flow", []))
            })
            
            # Extract and clean PlantUML code
            plantuml_code = self._extract_plantuml_code(response.content)
            
            return {
                **state,
                "plantuml_code": plantuml_code,
                "stage": "plantuml_generated"
            }
            
        except Exception as e:
            logger.error(f"Error in _generate_plantuml: {str(e)}")
            return {
                **state,
                "error": f"Failed to generate PlantUML: {str(e)}",
                "stage": "error"
            }
    
    def _generate_explanation(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """Third stage: Generate detailed explanation of the architecture"""
        try:
            analysis = state["analysis"]
            plantuml_code = state["plantuml_code"]
            prompt = state["user_prompt"]
            
            logger.info("Generating architecture explanation")
            
            explanation_prompt = ChatPromptTemplate.from_template(
                """Based on the system analysis and PlantUML diagram, provide a comprehensive explanation:
                
                Original Request: {prompt}
                System Analysis: {analysis}
                PlantUML Code: {plantuml_code}
                
                Generate a detailed explanation covering:
                
                1. **Architecture Overview:**
                   - High-level architecture pattern used
                   - Key design decisions and rationale
                   - System boundaries and responsibilities
                
                2. **Component Details:**
                   - Purpose and responsibility of each major component
                   - Technology stack recommendations
                   - Scalability considerations
                
                3. **Data Flow:**
                   - How data moves through the system
                   - Key integration points
                   - API design patterns
                
                4. **Non-Functional Requirements:**
                   - Scalability strategies
                   - Security considerations
                   - Performance optimizations
                   - Reliability and fault tolerance
                
                5. **Implementation Recommendations:**
                   - Deployment strategies
                   - Development phases
                   - Technology choices
                   - Monitoring and observability
                
                Write in a clear, technical style suitable for software architects and engineers.
                Provide practical insights and best practices.
                """
            )
            
            chain = explanation_prompt | self.llm
            response = chain.invoke({
                "prompt": prompt,
                "analysis": json.dumps(analysis, indent=2),
                "plantuml_code": plantuml_code
            })
            
            explanation = response.content.strip()
            
            return {
                **state,
                "explanation": explanation,
                "stage": "explanation_generated"
            }
            
        except Exception as e:
            logger.error(f"Error in _generate_explanation: {str(e)}")
            return {
                **state,
                "error": f"Failed to generate explanation: {str(e)}",
                "stage": "error"
            }
    
    def _create_diagram_url(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """Fourth stage: Create PlantUML diagram URL and extract components for D3"""
        try:
            plantuml_code = state["plantuml_code"]
            
            logger.info("Creating diagram URL and extracting components")
            
            # Generate PlantUML diagram URL using our custom encoder
            encoded = encode_plantuml(plantuml_code)
            diagram_url = f"https://www.plantuml.com/plantuml/img/{encoded}"
            
            # Extract components and relationships for D3 visualization
            components = self._extract_d3_components(plantuml_code)
            
            # Generate unique ID for this diagram
            diagram_id = str(uuid.uuid4())[:8]
            
            return {
                **state,
                "diagram_url": diagram_url,
                "d3_components": components,
                "diagram_id": diagram_id,
                "stage": "diagram_complete"
            }
            
        except Exception as e:
            logger.error(f"Error in _create_diagram_url: {str(e)}")
            return {
                **state,
                "error": f"Failed to create diagram URL: {str(e)}",
                "stage": "error"
            }
    
    def _should_continue_or_end(self, state: Dict[str, Any]) -> str:
        """Decision node: determine next step based on current stage"""
        stage = state.get("stage", "")
        
        if stage == "requirements_analyzed":
            return "generate_plantuml"
        elif stage == "plantuml_generated":
            return "generate_explanation"
        elif stage == "explanation_generated":
            return "create_diagram_url"
        elif stage == "diagram_complete":
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
                "system_type": "web_application",
                "scale": "medium",
                "key_components": ["frontend", "backend", "database"],
                "data_flow": ["user_request", "processing", "response"],
                "technologies": ["web_framework", "database", "cache"],
                "patterns": ["layered_architecture", "MVC"],
                "non_functional_requirements": ["scalability", "security"],
                "estimated_complexity": "medium",
                "recommended_architecture": "layered"
            }
    
    def _extract_plantuml_code(self, text: str) -> str:
        """Extract PlantUML code from response"""
        # Remove code block markers
        text = re.sub(r'```plantuml\s*', '', text)
        text = re.sub(r'```\s*', '', text)
        text = text.strip()
        
        # Ensure proper format
        if not text.startswith('@startuml'):
            text = '@startuml\n' + text
        if not text.endswith('@enduml'):
            text = text + '\n@enduml'
        
        return text
    
    def _extract_d3_components(self, plantuml_code: str) -> Dict[str, Any]:
        """Extract components and relationships from PlantUML for D3 visualization"""
        nodes = []
        links = []
        
        lines = plantuml_code.split('\n')
        
        for line in lines:
            line = line.strip()
            
            # Parse actors
            if 'actor ' in line:
                match = re.search(r'actor\s+"([^"]+)"\s+as\s+(\w+)', line)
                if match:
                    nodes.append({
                        'id': match.group(2),
                        'label': match.group(1),
                        'type': 'actor',
                        'x': 100 + len(nodes) * 150,
                        'y': 100
                    })
            
            # Parse components
            if '[' in line and ']' in line:
                match = re.search(r'\[([^\]]+)\]\s+as\s+(\w+)', line)
                if match:
                    nodes.append({
                        'id': match.group(2),
                        'label': match.group(1),
                        'type': 'component',
                        'x': 100 + len(nodes) * 150,
                        'y': 200
                    })
            
            # Parse databases
            if 'database ' in line:
                match = re.search(r'database\s+"([^"]+)"\s+as\s+(\w+)', line)
                if match:
                    nodes.append({
                        'id': match.group(2),
                        'label': match.group(1),
                        'type': 'database',
                        'x': 100 + len(nodes) * 150,
                        'y': 350
                    })
            
            # Parse cloud services
            if 'cloud ' in line:
                match = re.search(r'cloud\s+"([^"]+)"\s+as\s+(\w+)', line)
                if match:
                    nodes.append({
                        'id': match.group(2),
                        'label': match.group(1),
                        'type': 'cloud',
                        'x': 100 + len(nodes) * 150,
                        'y': 300
                    })
            
            # Parse relationships
            if '-->' in line:
                match = re.search(r'(\w+)\s+-->\s+(\w+)(?:\s*:\s*(.+))?', line)
                if match:
                    links.append({
                        'source': match.group(1),
                        'target': match.group(2),
                        'label': match.group(3).strip() if match.group(3) else ''
                    })
        
        return {'nodes': nodes, 'links': links}
    
    def build_graph(self):
        """Build the workflow graph for system design generation"""
        workflow = StateGraph(dict)
        
        # Add nodes for the workflow
        workflow.add_node("analyze_requirements", self._analyze_requirements)
        workflow.add_node("generate_plantuml", self._generate_plantuml)
        workflow.add_node("generate_explanation", self._generate_explanation)
        workflow.add_node("create_diagram_url", self._create_diagram_url)
        
        # Set entry point
        workflow.set_entry_point("analyze_requirements")
        
        # Define conditional edges
        workflow.add_conditional_edges(
            "analyze_requirements",
            self._should_continue_or_end,
            {
                "generate_plantuml": "generate_plantuml",
                END: END
            }
        )
        
        workflow.add_conditional_edges(
            "generate_plantuml",
            self._should_continue_or_end,
            {
                "generate_explanation": "generate_explanation",
                END: END
            }
        )
        
        workflow.add_conditional_edges(
            "generate_explanation",
            self._should_continue_or_end,
            {
                "create_diagram_url": "create_diagram_url",
                END: END
            }
        )
        
        workflow.add_conditional_edges(
            "create_diagram_url",
            self._should_continue_or_end,
            {
                END: END
            }
        )
        
        # Compile graph
        logger.info("Compiling system design generation workflow graph")
        compiled_graph = workflow.compile()
        return compiled_graph
    
    def create_system_design_stream(self, prompt: str) -> Generator[Dict[str, Any], None, None]:
        """Generate system design with streaming progress updates"""
        logger.info(f"Starting system design generation for prompt: {prompt}")
        
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
                    "requirements_analyzed": 25,
                    "plantuml_generated": 50,
                    "explanation_generated": 75,
                    "diagram_complete": 100,
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
                    "plantuml_code": current_state.get("plantuml_code"),
                    "explanation": current_state.get("explanation"),
                    "diagram_url": current_state.get("diagram_url"),
                    "d3_components": current_state.get("d3_components"),
                    "diagram_id": current_state.get("diagram_id")
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
    
    def create_system_design(self, prompt: str) -> Dict[str, Any]:
        """Create system design and return final result (non-streaming)"""
        # Get the final state from the stream
        final_result = None
        for update in self.create_system_design_stream(prompt):
            final_result = update
        
        if final_result and final_result.get("status") == "complete":
            return {
                "analysis": final_result.get("analysis"),
                "plantuml_code": final_result.get("plantuml_code"),
                "explanation": final_result.get("explanation"),
                "diagram_url": final_result.get("diagram_url"),
                "d3_components": final_result.get("d3_components"),
                "diagram_id": final_result.get("diagram_id")
            }
        else:
            error_msg = final_result.get("error", "Unknown error") if final_result else "No result received"
            return {
                "analysis": final_result.get("analysis") if final_result else None,
                "plantuml_code": final_result.get("plantuml_code", "") if final_result else "",
                "explanation": f"Error: {error_msg}",
                "diagram_url": None,
                "d3_components": {"nodes": [], "links": []},
                "diagram_id": None
            }
    
    def _get_stage_description(self, stage: str) -> str:
        """Get human-readable description for each stage"""
        descriptions = {
            "starting": "Initializing system design generation...",
            "requirements_analyzed": "Analyzing system requirements and architecture patterns...",
            "plantuml_generated": "Generating PlantUML component diagram...",
            "explanation_generated": "Creating detailed architecture explanation...",
            "diagram_complete": "System design generated successfully!",
            "error": "An error occurred during processing"
        }
        return descriptions.get(stage, "Processing...")

# Legacy compatibility class
class SystemDesignAgent:
    """Legacy wrapper for backward compatibility"""
    def __init__(self):
        self.system = SystemDesignGenerationSystem()
    
    def create_system_design(self, prompt: str) -> Dict[str, Any]:
        return self.system.create_system_design(prompt)