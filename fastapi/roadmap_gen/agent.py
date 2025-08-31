import os
import re
import json
import logging
import uuid
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

class RoadmapGenerationSystem:
    def __init__(self):
        """Initialize the Roadmap Generation System with LangGraph"""
        
        # Set up the API key
        api_key = os.getenv("GOOGLE_GENERATIVE_AI_API_KEY")
        if not api_key:
            raise ValueError("GOOGLE_GENERATIVE_AI_API_KEY environment variable is not set")
        
        # Initialize LLM
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-1.5-flash",
            google_api_key=api_key,
            temperature=0.3  # Lower temperature for more consistent JSON output
        )
        
        logger.info("Roadmap Generation System initialized")
    
    def _analyze_career_path(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """First stage: Analyze the career path requirements"""
        try:
            career_path = state["career_path"]
            logger.info(f"Analyzing career path: {career_path}")
            
            analysis_prompt = ChatPromptTemplate.from_template(
                """Analyze the following career path and provide structured information:
                
                Career Path: {career_path}
                
                CRITICAL: Avoid using escape characters. Use simple apostrophes and quotes only.
                
                IMPORTANT: Provide your response ONLY as valid JSON in the following format. Do not include any text before or after the JSON:
                
                ```json
                {{
                    "title": "Professional title for this career path",
                    "category": "software_development/data_science/design/devops/testing/security/other",
                    "difficulty_level": "beginner/intermediate/advanced",
                    "estimated_duration": "6 months/1 year/2 years/3+ years",
                    "prerequisites": ["prerequisite1", "prerequisite2"],
                    "core_skills": ["skill1", "skill2", "skill3"],
                    "tools_technologies": ["tool1", "tool2", "tool3"],
                    "job_market": {{
                        "demand": "high/medium/low",
                        "average_salary": "salary range",
                        "growth_prospects": "excellent/good/moderate/limited"
                    }},
                    "learning_phases": [
                        {{
                            "phase": "Foundation",
                            "duration": "2-3 months",
                            "focus": "Basic concepts and fundamentals"
                        }},
                        {{
                            "phase": "Intermediate",
                            "duration": "3-4 months", 
                            "focus": "Practical application and projects"
                        }},
                        {{
                            "phase": "Advanced",
                            "duration": "4-6 months",
                            "focus": "Advanced concepts and specialization"
                        }}
                    ],
                    "career_progression": ["Junior -> Mid-level -> Senior -> Lead/Architect"]
                }}
                ```
                
                GUIDELINES:
                - Use simple quotes and apostrophes (do not escape them)
                - Provide accurate, industry-relevant information
                - Keep tool/framework names simple without complex descriptions
                - Use standard terminology without special characters
                - Focus on realistic salary ranges and market conditions
                
                Return ONLY the JSON, no other text.
                """
            )
            
            chain = analysis_prompt | self.llm
            response = chain.invoke({"career_path": career_path})
            
            # Extract JSON from response
            analysis = self._extract_json(response.content)
            
            return {
                **state,
                "analysis": analysis,
                "stage": "career_analyzed"
            }
            
        except Exception as e:
            logger.error(f"Error in _analyze_career_path: {str(e)}")
            return {
                **state,
                "error": f"Failed to analyze career path: {str(e)}",
                "stage": "error"
            }
    
    def _generate_roadmap_structure(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """Second stage: Generate detailed roadmap structure"""
        try:
            analysis = state["analysis"]
            career_path = state["career_path"]
            
            logger.info("Generating roadmap structure")
            
            roadmap_prompt = ChatPromptTemplate.from_template(
                """Based on the career analysis, create a React Flow tree-structured learning roadmap:
                
                Career Path: {career_path}
                Analysis: {analysis}
                
                CRITICAL INSTRUCTIONS:
                1. Create a vertical tree structure with meaningful x/y positions forming a logical flow
                2. Structure should be similar to roadmap.sh layout with hierarchical branching
                3. Steps should be ordered from fundamentals to advanced topics
                4. Include branching for different specializations when applicable
                5. Each node must have a title, short description, and learning resource link
                6. Use unique IDs for all nodes and edges
                7. Make node positions spacious (500px horizontal spacing, 320px vertical spacing minimum)
                8. Avoid escape characters - use simple apostrophes and quotes
                9. NEVER use arithmetic expressions in JSON values (e.g., -650 + 650)
                10. Use only calculated integer values for all coordinates
                11. Ensure all string values are properly quoted
                12. Avoid special characters that need escaping
                
                IMPORTANT: Provide your response ONLY as valid JSON. Do not include any text before or after the JSON:
                
                ```json
                {{
                    "roadmap_id": "unique_identifier",
                    "nodes": [
                        {{
                            "id": "node_1",
                            "title": "Topic/Skill Name",
                            "description": "Brief description (2-3 sentences max) of what to learn and why it matters",
                            "type": "foundation",
                            "duration": "2-3 weeks",
                            "prerequisites": [],
                            "resources": [
                                {{
                                    "type": "course",
                                    "title": "Specific course or tutorial name",
                                    "url": "https://example.com/resource",
                                    "estimated_time": "20 hours"
                                }},
                                {{
                                    "type": "documentation",
                                    "title": "Official documentation",
                                    "url": "https://docs.example.com",
                                    "estimated_time": "5 hours"
                                }}
                            ],
                            "skills_gained": ["skill1", "skill2"],
                            "projects": ["Build a simple project demonstrating this concept"],
                            "assessment": "Complete exercises and build practice project",
                            "position": {{
                                "x": 0,
                                "y": 0
                            }}
                        }}
                    ],
                    "edges": [
                        {{
                            "id": "edge_1_to_2",
                            "source": "node_1",
                            "target": "node_2",
                            "type": "smoothstep",
                            "animated": false,
                            "label": ""
                        }}
                    ],
                    "phases": [
                        {{
                            "name": "Foundation Phase",
                            "nodes": ["node_1", "node_2"],
                            "color": "#e3f2fd",
                            "description": "Master the fundamentals"
                        }}
                    ]
                }}
                ```
                
                ROADMAP STRUCTURE REQUIREMENTS:
                - Create 18-25 nodes total for comprehensive coverage
                - Foundation Phase (3-4 nodes): Basic concepts, prerequisites, core fundamentals
                - Core Skills Phase (6-8 nodes): Main technical skills, tools, frameworks
                - Advanced Phase (4-6 nodes): Specialized knowledge, advanced patterns
                - Practical Phase (3-4 nodes): Real projects, portfolio building
                - Career Phase (1-2 nodes): Job readiness, interview prep
                
                POSITIONING RULES (CRITICAL FOR TREE STRUCTURE):
                - Foundation nodes: y=100, x values: -600, 0, 600 (for 3 nodes) - USE EXACT NUMBERS ONLY
                - Core nodes: y=500, x values: -650, 0, 650, 1300, 1950 (spread evenly) - USE EXACT NUMBERS ONLY
                - Advanced nodes: y=900, x values: -300, 300, 900 (with branching) - USE EXACT NUMBERS ONLY
                - Project nodes: y=1300, x values: -300, 300, 900 (specialization branches) - USE EXACT NUMBERS ONLY
                - Career nodes: y=1700, x values: 0, 0 (centered) - USE EXACT NUMBERS ONLY
                - CRITICAL: Use only calculated integer values in position coordinates, NO arithmetic expressions
                - CRITICAL: Ensure minimum 400px spacing between any nodes
                - CRITICAL: Example position format: "position": {{ "x": 650, "y": 500 }} NOT "x": -650 + 1300
                
                EDGE REQUIREMENTS:
                - Connect foundation to core nodes (tree structure)
                - Connect core to advanced (create branches for specializations)
                - Connect advanced to projects (maintain flow)
                - Connect projects to career milestones
                - Use unique edge IDs like "edge_node1_to_node2"
                
                NODE TYPES TO USE:
                - "foundation": Basic concepts and prerequisites
                - "core": Main technical skills and tools  
                - "advanced": Specialized knowledge and patterns
                - "project": Hands-on building and practice
                - "milestone": Major achievements and career goals
                
                RESOURCE GUIDELINES:
                - Provide real, accessible learning resources
                - Include mix of: courses, documentation, tutorials, books
                - Add realistic time estimates
                - Prefer free/accessible resources when possible
                
                AVOID:
                - Escape characters like backslash-apostrophe
                - Overlapping node positions
                - Unrealistic time estimates
                - Generic or placeholder resource links
                - Complex nested quotes
                
                Return ONLY the JSON structure, no other text or explanation.
                """
            )
            
            chain = roadmap_prompt | self.llm
            response = chain.invoke({
                "career_path": career_path,
                "analysis": json.dumps(analysis, indent=2)
            })
            
            # Extract and validate roadmap structure
            roadmap_structure = self._extract_json(response.content)
            roadmap_structure = self._validate_roadmap_structure(roadmap_structure)
            
            return {
                **state,
                "roadmap_structure": roadmap_structure,
                "stage": "roadmap_generated"
            }
            
        except Exception as e:
            logger.error(f"Error in _generate_roadmap_structure: {str(e)}")
            return {
                **state,
                "error": f"Failed to generate roadmap: {str(e)}",
                "stage": "error"
            }
    
    def _generate_detailed_description(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """Third stage: Generate detailed career description and guidance"""
        try:
            analysis = state["analysis"]
            roadmap_structure = state["roadmap_structure"]
            career_path = state["career_path"]
            
            logger.info("Generating detailed description")
            
            description_prompt = ChatPromptTemplate.from_template(
                """Create a comprehensive career guide based on the analysis and roadmap:
                
                Career Path: {career_path}
                Analysis: {analysis}
                Roadmap: {roadmap_summary}
                
                Generate a detailed guide covering:
                
                1. **Career Overview:**
                   - What does a {career_path} do?
                   - Day-to-day responsibilities
                   - Industry context and importance
                
                2. **Skills & Competencies:**
                   - Technical skills required
                   - Soft skills needed
                   - Tools and technologies
                
                3. **Learning Path Strategy:**
                   - How to approach the learning journey
                   - Study tips and best practices
                   - Common pitfalls to avoid
                
                4. **Practical Experience:**
                   - Portfolio development
                   - Project ideas and implementations
                   - Open source contributions
                
                5. **Career Progression:**
                   - Entry-level positions
                   - Mid-level advancement
                   - Senior and leadership roles
                   - Specialization opportunities
                
                6. **Industry Insights:**
                   - Current market trends
                   - Salary expectations
                   - Job search strategies
                   - Interview preparation
                
                7. **Continuous Learning:**
                   - Staying updated with trends
                   - Professional development
                   - Community engagement
                
                Write in an engaging, motivational tone that provides practical guidance and realistic expectations.
                """
            )
            
            chain = description_prompt | self.llm
            response = chain.invoke({
                "career_path": career_path,
                "analysis": json.dumps(analysis, indent=2),
                "roadmap_summary": self._create_roadmap_summary(roadmap_structure)
            })
            
            detailed_description = response.content.strip()
            
            return {
                **state,
                "detailed_description": detailed_description,
                "stage": "description_generated"
            }
            
        except Exception as e:
            logger.error(f"Error in _generate_detailed_description: {str(e)}")
            return {
                **state,
                "error": f"Failed to generate description: {str(e)}",
                "stage": "error"
            }
    
    def _finalize_roadmap(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """Fourth stage: Finalize roadmap with metadata and validation"""
        try:
            logger.info("Finalizing roadmap")
            
            # Generate unique roadmap ID
            roadmap_id = str(uuid.uuid4())[:8]
            
            # Create metadata
            metadata = {
                "created_at": "2025-08-22",
                "version": "1.0",
                "total_duration": state["analysis"].get("estimated_duration", "12 months"),
                "difficulty": state["analysis"].get("difficulty_level", "intermediate"),
                "total_nodes": len(state["roadmap_structure"].get("nodes", [])),
                "completion_criteria": "Complete all nodes and projects in sequence"
            }
            
            return {
                **state,
                "roadmap_id": roadmap_id,
                "metadata": metadata,
                "stage": "roadmap_complete"
            }
            
        except Exception as e:
            logger.error(f"Error in _finalize_roadmap: {str(e)}")
            return {
                **state,
                "error": f"Failed to finalize roadmap: {str(e)}",
                "stage": "error"
            }
    
    def _should_continue_or_end(self, state: Dict[str, Any]) -> str:
        """Decision node: determine next step based on current stage"""
        stage = state.get("stage", "")
        
        if stage == "career_analyzed":
            return "generate_roadmap"
        elif stage == "roadmap_generated":
            return "generate_description"
        elif stage == "description_generated":
            return "finalize_roadmap"
        elif stage == "roadmap_complete":
            return END
        elif stage == "error":
            return END
        else:
            return END
    
    def _extract_json(self, text: str) -> Dict[str, Any]:
        """Extract JSON from LLM response text"""
        try:
            logger.info(f"Raw LLM response text: {text[:500]}...")  # Log first 500 chars
            
            json_str = ""
            
            # Try finding ```json blocks first
            if "```json" in text:
                match = text.split("```json", 1)
                if len(match) > 1 and "```" in match[1]:
                    json_str = match[1].split("```", 1)[0].strip()
                    logger.info(f"Found JSON in ```json block: {json_str[:200]}...")
            # Fallback to finding plain ``` blocks
            elif "```" in text:
                match = text.split("```", 1)
                if len(match) > 1 and "```" in match[1]:
                    json_str = match[1].split("```", 1)[0].strip()
                    logger.info(f"Found JSON in ``` block: {json_str[:200]}...")
            else:
                # Try to find JSON-like structure
                start = text.find('{')
                if start != -1:
                    # Find the matching closing brace
                    brace_count = 0
                    end = start
                    for i, char in enumerate(text[start:], start):
                        if char == '{':
                            brace_count += 1
                        elif char == '}':
                            brace_count -= 1
                            if brace_count == 0:
                                end = i + 1
                                break
                    json_str = text[start:end].strip()
                    logger.info(f"Found JSON structure: {json_str[:200]}...")
                else:
                    json_str = text
                    logger.info(f"No JSON structure found, using full text: {json_str[:200]}...")
            
            # Clean up common issues with JSON
            json_str = self._clean_json_string(json_str)
            logger.info(f"Cleaned JSON string: {json_str[:200]}...")
            
            # Try parsing the cleaned JSON
            try:
                parsed_json = json.loads(json_str)
                logger.info("Successfully parsed JSON")
                return parsed_json
            except json.JSONDecodeError as e:
                logger.warning(f"First JSON parse attempt failed: {str(e)}")
                # Try a more aggressive cleaning approach
                aggressively_cleaned = self._aggressive_json_clean(json_str)
                logger.info(f"Aggressively cleaned JSON: {aggressively_cleaned[:200]}...")
                
                try:
                    parsed_json = json.loads(aggressively_cleaned)
                    logger.info("JSON parsing successful after aggressive cleaning")
                    return parsed_json
                except json.JSONDecodeError as e2:
                    logger.error(f"JSON parsing failed even after aggressive cleaning: {str(e2)}")
                    # Try one more time with final rescue
                    final_attempt = self._final_json_rescue(aggressively_cleaned)
                    try:
                        parsed_json = json.loads(final_attempt)
                        logger.info("JSON parsing successful after final rescue attempt")
                        return parsed_json
                    except json.JSONDecodeError as e3:
                        logger.error(f"Final JSON rescue attempt failed: {str(e3)}")
                        logger.error(f"Problematic JSON string: {final_attempt}")
                        raise e3
                logger.info(f"Aggressively cleaned JSON: {json_str[:200]}...")
                parsed_json = json.loads(json_str)
                logger.info("Successfully parsed JSON after aggressive cleaning")
                return parsed_json
            
        except json.JSONDecodeError as e:
            logger.error(f"JSON parsing failed: {str(e)}")
            logger.error(f"Problematic JSON string: {json_str}")
            logger.warning("Failed to parse JSON, returning default structure")
            return self._get_default_structure()
        except Exception as e:
            logger.error(f"Unexpected error in JSON extraction: {str(e)}")
            logger.error(f"Original text: {text}")
            return self._get_default_structure()
    
    def _clean_json_string(self, json_str: str) -> str:
        """Clean JSON string to fix common formatting issues"""
        if not json_str:
            return json_str
        
        # Remove any leading/trailing whitespace
        json_str = json_str.strip()
        
        # Remove any text before the first {
        start_idx = json_str.find('{')
        if start_idx > 0:
            json_str = json_str[start_idx:]
        
        # Remove any text after the last }
        end_idx = json_str.rfind('}')
        if end_idx != -1 and end_idx < len(json_str) - 1:
            json_str = json_str[:end_idx + 1]
        
        # Fix mathematical expressions in JSON values (e.g., "x": -650 + 650)
        def evaluate_math_expression(match):
            try:
                expression = match.group(1)
                # Only evaluate simple arithmetic expressions with numbers and basic operators
                if re.match(r'^[-+*/\s\d.()]+$', expression):
                    result = eval(expression)
                    return f'"{match.group(0).split(":")[0]}": {result}'
                else:
                    return match.group(0)
            except:
                return match.group(0)
        
        # Fix arithmetic expressions like "x": -650 + 650
        json_str = re.sub(r'"([^"]+)":\s*([-+*/\s\d.()]+(?:[+\-*/]\s*[-+*/\s\d.()]+)+)', evaluate_math_expression, json_str)
        
        # Fix trailing commas before closing brackets/braces
        json_str = re.sub(r',(\s*[}\]])', r'\1', json_str)
        
        # Fix missing commas between array/object elements
        json_str = re.sub(r'}\s*{', r'},{', json_str)
        json_str = re.sub(r']\s*\[', r'],[', json_str)
        
        # Fix problematic escape sequences and apostrophes
        # Fix invalid escape sequences like \' that should be just '
        json_str = re.sub(r'\\\'', "'", json_str)
        
        # Fix quotes in strings - handle contractions and apostrophes properly
        # Replace unescaped single quotes within double-quoted strings
        def fix_quotes_in_string(match):
            content = match.group(1)
            # Replace single quotes with escaped single quotes only if they're not already escaped
            content = re.sub(r"(?<!\\)'", "\\'", content)
            return '"' + content + '"'
        
        json_str = re.sub(r'"([^"]*)"', fix_quotes_in_string, json_str)
        
        # Fix unquoted property names (simple case)
        json_str = re.sub(r'([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:', r'\1"\2":', json_str)
        
        # Fix common number formatting issues
        # Fix numbers that might have spaces around operators
        json_str = re.sub(r'(\d+)\s*\+\s*(\d+)', r'\1+\2', json_str)
        json_str = re.sub(r'(\d+)\s*-\s*(\d+)', r'\1-\2', json_str)
        json_str = re.sub(r'(\d+)\s*\*\s*(\d+)', r'\1*\2', json_str)
        json_str = re.sub(r'(\d+)\s*/\s*(\d+)', r'\1/\2', json_str)
        
        # Remove any non-JSON characters at the beginning or end
        json_str = re.sub(r'^[^{]*', '', json_str)
        json_str = re.sub(r'[^}]*$', '', json_str)
        
        return json_str
    
    def _aggressive_json_clean(self, json_str: str) -> str:
        """More aggressive JSON cleaning for problematic responses"""
        if not json_str:
            return json_str
        
        # Try to extract only the core JSON structure
        # Find the outermost braces
        first_brace = json_str.find('{')
        if first_brace == -1:
            return json_str
        
        # Count braces to find the matching closing brace
        brace_count = 0
        last_brace = first_brace
        
        for i in range(first_brace, len(json_str)):
            if json_str[i] == '{':
                brace_count += 1
            elif json_str[i] == '}':
                brace_count -= 1
                if brace_count == 0:
                    last_brace = i
                    break
        
        json_str = json_str[first_brace:last_brace + 1]
        
        # Replace problematic characters
        json_str = json_str.replace('\n', ' ').replace('\r', ' ').replace('\t', ' ')
        
        # Fix multiple spaces
        json_str = re.sub(r'\s+', ' ', json_str)
        
        # Fix arithmetic expressions in values (most critical fix)
        def fix_arithmetic(match):
            try:
                key = match.group(1)
                expression = match.group(2).strip()
                
                # Evaluate simple arithmetic expressions
                if re.match(r'^[-+]?\d+(?:\s*[+\-*\/]\s*[-+]?\d+)*$', expression):
                    result = eval(expression)
                    return f'"{key}": {result}'
                else:
                    return match.group(0)
            except:
                return match.group(0)
        
        # Fix expressions like "x": -650 + 650, "y": 500 + 100
        json_str = re.sub(r'"([^"]+)":\s*([-+]?\d+(?:\s*[+\-*\/]\s*[-+]?\d+)+)', fix_arithmetic, json_str)
        
        # Fix common escape sequence issues
        # Remove invalid escape sequences like \' and replace with '
        json_str = re.sub(r'\\\'', "'", json_str)
        
        # Fix other common invalid escapes (but preserve valid ones)
        json_str = re.sub(r'\\(?!["\\/bfnrtu])', '', json_str)
        
        # Try to fix common LLM JSON issues
        # Fix boolean values
        json_str = re.sub(r'\b(true|false|null)\b', lambda m: m.group(1).lower(), json_str, flags=re.IGNORECASE)
        
        # Fix numbers that might have been quoted unnecessarily
        json_str = re.sub(r'"\s*(\d+(?:\.\d+)?)\s*"(?=\s*[,}\]])', r'\1', json_str)
        
        # Fix trailing commas more aggressively
        json_str = re.sub(r',(\s*[}\]])', r'\1', json_str)
        
        # Fix missing quotes around string values
        json_str = re.sub(r':\s*([a-zA-Z][a-zA-Z0-9_\s]*[a-zA-Z0-9])\s*([,}\]])', r': "\1"\2', json_str)
        
        # Fix object/array separation issues
        json_str = re.sub(r'}\s*{', r'},{', json_str)
        json_str = re.sub(r']\s*\[', r'],[', json_str)
        
        return json_str
    
    def _final_json_rescue(self, json_str: str) -> str:
        """Final attempt to rescue malformed JSON"""
        if not json_str:
            return json_str
        
        # Remove all non-essential whitespace
        json_str = re.sub(r'\s+', ' ', json_str).strip()
        
        # Fix arithmetic expressions more aggressively
        def fix_all_arithmetic(match):
            try:
                full_match = match.group(0)
                key_part = match.group(1)
                value_part = match.group(2)
                
                # Try to evaluate any arithmetic in the value
                if re.search(r'[-+*/]', value_part):
                    # Replace common arithmetic patterns
                    value_part = re.sub(r'(-?\d+)\s*\+\s*(-?\d+)', lambda m: str(int(m.group(1)) + int(m.group(2))), value_part)
                    value_part = re.sub(r'(-?\d+)\s*-\s*(-?\d+)', lambda m: str(int(m.group(1)) - int(m.group(2))), value_part)
                    value_part = re.sub(r'(-?\d+)\s*\*\s*(-?\d+)', lambda m: str(int(m.group(1)) * int(m.group(2))), value_part)
                    
                    # If still has arithmetic, try eval as last resort
                    if re.search(r'[-+*/]', value_part):
                        try:
                            value_part = str(eval(value_part))
                        except:
                            pass
                
                return f'"{key_part}": {value_part}'
            except:
                return match.group(0)
        
        # More comprehensive arithmetic fix
        json_str = re.sub(r'"([^"]+)":\s*([-+]?\d+(?:\s*[+\-*/]\s*[-+]?\d+)*)', fix_all_arithmetic, json_str)
        
        # Fix common delimiter issues
        json_str = re.sub(r',\s*}', '}', json_str)
        json_str = re.sub(r',\s*]', ']', json_str)
        
        # Ensure all string values are quoted
        json_str = re.sub(r':\s*([^",\[\]{}\s]+)(?=\s*[,}\]])', r': "\1"', json_str)
        
        # Fix boolean and null values that got quoted
        json_str = re.sub(r':\s*"(true|false|null)"', r': \1', json_str)
        
        # Fix number values that got quoted
        json_str = re.sub(r':\s*"(-?\d+(?:\.\d+)?)"(?=\s*[,}\]])', r': \1', json_str)
        
        return json_str
    
    def _get_default_structure(self) -> Dict[str, Any]:
        """Return default structure when JSON parsing fails"""
        return {
            "title": "Software Developer",
            "category": "software_development",
            "difficulty_level": "intermediate",
            "estimated_duration": "12 months",
            "prerequisites": ["Basic programming knowledge"],
            "core_skills": ["Programming", "Problem solving"],
            "tools_technologies": ["IDE", "Version control"],
            "job_market": {
                "demand": "high",
                "average_salary": "$60,000 - $120,000",
                "growth_prospects": "excellent"
            },
            "learning_phases": [
                {
                    "phase": "Foundation",
                    "duration": "3 months",
                    "focus": "Basic programming concepts"
                }
            ],
            "career_progression": ["Junior", "Mid-level", "Senior"]
        }
    
    def _validate_roadmap_structure(self, roadmap: Dict[str, Any]) -> Dict[str, Any]:
        """Validate and fix roadmap structure with enhanced tree positioning for React Flow"""
        if not roadmap.get("nodes"):
            roadmap["nodes"] = []
        if not roadmap.get("edges"):
            roadmap["edges"] = []
        if not roadmap.get("phases"):
            roadmap["phases"] = []
        
        # Enhanced tree-based positioning system
        nodes = roadmap["nodes"]
        if nodes:
            # Build dependency graph for proper tree structure
            node_map = {node["id"]: node for node in nodes}
            children_map = {}
            parent_map = {}
            in_degree = {}
            
            # Initialize maps
            for node in nodes:
                children_map[node["id"]] = []
                parent_map[node["id"]] = []
                in_degree[node["id"]] = 0
            
            # Build dependency relationships from edges
            for edge in roadmap["edges"]:
                source = edge.get("source")
                target = edge.get("target")
                if source and target and source in node_map and target in node_map:
                    children_map[source].append(target)
                    parent_map[target].append(source)
                    in_degree[target] += 1
            
            # Find root nodes (no parents)
            root_nodes = [node_id for node_id, degree in in_degree.items() if degree == 0]
            
            # If no clear roots, use foundation nodes as roots
            if not root_nodes:
                foundation_nodes = [node for node in nodes if node.get("type") == "foundation"]
                root_nodes = [node["id"] for node in foundation_nodes[:3]]  # Limit to 3 roots
            
            # Professional tree layout configuration
            tree_config = {
                "horizontal_spacing": 600,     # Wider spacing to prevent overlap
                "vertical_spacing": 400,       # Taller spacing for clear levels
                "branch_offset": 300,          # Offset for branching paths
                "level_height": 350,           # Fixed height per level
                "center_x": 0,                 # Center point for tree
                "start_y": 100,                # Starting Y position
            }
            
            # Perform tree layout using level-order traversal
            levels = []
            level_map = {}
            visited = set()
            
            # BFS to assign levels
            queue = [(node_id, 0) for node_id in root_nodes]
            
            while queue:
                node_id, level = queue.pop(0)
                if node_id in visited:
                    continue
                    
                visited.add(node_id)
                level_map[node_id] = level
                
                # Initialize level if needed
                while len(levels) <= level:
                    levels.append([])
                
                levels[level].append(node_id)
                
                # Add children to queue
                for child_id in children_map.get(node_id, []):
                    if child_id not in visited:
                        queue.append((child_id, level + 1))
            
            # Handle orphaned nodes (not connected in tree)
            orphaned = [node["id"] for node in nodes if node["id"] not in visited]
            if orphaned:
                # Add orphaned nodes to appropriate levels based on type
                for node_id in orphaned:
                    node = node_map[node_id]
                    node_type = node.get("type", "core")
                    
                    if node_type == "foundation":
                        target_level = 0
                    elif node_type == "core":
                        target_level = min(2, len(levels))
                    elif node_type == "advanced":
                        target_level = min(3, len(levels))
                    elif node_type == "project":
                        target_level = min(4, len(levels))
                    else:  # milestone
                        target_level = len(levels)
                    
                    while len(levels) <= target_level:
                        levels.append([])
                    
                    levels[target_level].append(node_id)
                    level_map[node_id] = target_level
            
            # Calculate positions for each level
            for level_index, level_nodes in enumerate(levels):
                y_position = tree_config["start_y"] + (level_index * tree_config["level_height"])
                node_count = len(level_nodes)
                
                if node_count == 0:
                    continue
                elif node_count == 1:
                    # Center single node
                    node_id = level_nodes[0]
                    node_map[node_id]["position"] = {
                        "x": tree_config["center_x"],
                        "y": y_position
                    }
                else:
                    # Distribute multiple nodes evenly
                    total_width = (node_count - 1) * tree_config["horizontal_spacing"]
                    start_x = tree_config["center_x"] - (total_width / 2)
                    
                    for i, node_id in enumerate(level_nodes):
                        x_position = start_x + (i * tree_config["horizontal_spacing"])
                        
                        # Add slight variation for branching specializations
                        if level_index > 1 and node_count > 2:
                            # Create branching effect for specializations
                            branch_offset = (i - (node_count - 1) / 2) * tree_config["branch_offset"]
                            x_position += branch_offset * 0.3
                        
                        node_map[node_id]["position"] = {
                            "x": x_position,
                            "y": y_position
                        }
        
        # Ensure all nodes have required fields with defaults
        for i, node in enumerate(roadmap["nodes"]):
            if "id" not in node:
                node["id"] = f"node_{i+1}"
            if "position" not in node:
                node["position"] = {"x": i * 600, "y": 0}
            if "type" not in node:
                node["type"] = "core"
            if "title" not in node:
                node["title"] = f"Learning Step {i+1}"
            if "description" not in node:
                node["description"] = "Important learning milestone in your journey"
            if "duration" not in node:
                node["duration"] = "2-3 weeks"
            if "skills_gained" not in node:
                node["skills_gained"] = ["Core Skills"]
            if "resources" not in node:
                node["resources"] = [{
                    "type": "course",
                    "title": "Learning Resource",
                    "url": "#",
                    "estimated_time": "20 hours"
                }]
        
        # Create intelligent edges for tree structure if missing
        if not roadmap["edges"] and len(roadmap["nodes"]) > 1:
            edges = []
            
            # Create sequential connections between levels
            for level_index in range(len(levels) - 1):
                current_level = levels[level_index]
                next_level = levels[level_index + 1]
                
                if not current_level or not next_level:
                    continue
                
                # Connect each node in current level to appropriate nodes in next level
                for i, source_id in enumerate(current_level):
                    # Determine target connections based on position and type
                    targets_per_source = max(1, len(next_level) // len(current_level))
                    start_target_index = i * targets_per_source
                    
                    for j in range(targets_per_source):
                        target_index = start_target_index + j
                        if target_index < len(next_level):
                            target_id = next_level[target_index]
                            edges.append({
                                "id": f"edge_{source_id}_to_{target_id}",
                                "source": source_id,
                                "target": target_id,
                                "type": "smoothstep",
                                "animated": False,
                                "label": ""
                            })
            
            # Handle remaining connections for orphaned nodes
            if len(levels) > 1:
                last_level = levels[-2]  # Second to last level
                final_level = levels[-1]  # Final level
                
                for target_id in final_level:
                    # Connect to closest node in previous level if not already connected
                    has_connection = any(edge["target"] == target_id for edge in edges)
                    if not has_connection and last_level:
                        source_id = last_level[0]  # Connect to first node in previous level
                        edges.append({
                            "id": f"edge_{source_id}_to_{target_id}",
                            "source": source_id,
                            "target": target_id,
                            "type": "smoothstep",
                            "animated": False,
                            "label": ""
                        })
            
            roadmap["edges"] = edges
        
        # Ensure edges have proper formatting for React Flow
        for edge in roadmap["edges"]:
            if "id" not in edge:
                edge["id"] = f"edge_{edge.get('source', 'unknown')}_to_{edge.get('target', 'unknown')}"
            if "type" not in edge:
                edge["type"] = "smoothstep"
            if "animated" not in edge:
                edge["animated"] = False
            if "label" not in edge:
                edge["label"] = ""
        
        return roadmap
    
    def _create_roadmap_summary(self, roadmap_structure: Dict[str, Any]) -> str:
        """Create a summary of the roadmap for description generation"""
        nodes = roadmap_structure.get("nodes", [])
        phases = roadmap_structure.get("phases", [])
        
        summary = f"Roadmap contains {len(nodes)} learning nodes across {len(phases)} phases."
        return summary
    
    def build_graph(self):
        """Build the workflow graph for roadmap generation"""
        workflow = StateGraph(dict)
        
        # Add nodes for the workflow
        workflow.add_node("analyze_career", self._analyze_career_path)
        workflow.add_node("generate_roadmap", self._generate_roadmap_structure)
        workflow.add_node("generate_description", self._generate_detailed_description)
        workflow.add_node("finalize_roadmap", self._finalize_roadmap)
        
        # Set entry point
        workflow.set_entry_point("analyze_career")
        
        # Define conditional edges
        workflow.add_conditional_edges(
            "analyze_career",
            self._should_continue_or_end,
            {
                "generate_roadmap": "generate_roadmap",
                END: END
            }
        )
        
        workflow.add_conditional_edges(
            "generate_roadmap",
            self._should_continue_or_end,
            {
                "generate_description": "generate_description",
                END: END
            }
        )
        
        workflow.add_conditional_edges(
            "generate_description",
            self._should_continue_or_end,
            {
                "finalize_roadmap": "finalize_roadmap",
                END: END
            }
        )
        
        workflow.add_conditional_edges(
            "finalize_roadmap",
            self._should_continue_or_end,
            {
                END: END
            }
        )
        
        # Compile graph
        logger.info("Compiling roadmap generation workflow graph")
        compiled_graph = workflow.compile()
        return compiled_graph
    
    def create_roadmap_stream(self, career_path: str) -> Generator[Dict[str, Any], None, None]:
        """Generate roadmap with streaming progress updates"""
        logger.info(f"Starting roadmap generation for: {career_path}")
        
        workflow = self.build_graph()
        
        initial_state = {
            "career_path": career_path,
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
                    "career_analyzed": 25,
                    "roadmap_generated": 50,
                    "description_generated": 75,
                    "roadmap_complete": 100,
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
                    "roadmap_structure": current_state.get("roadmap_structure"),
                    "detailed_description": current_state.get("detailed_description"),
                    "roadmap_id": current_state.get("roadmap_id"),
                    "metadata": current_state.get("metadata")
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
    
    def create_roadmap(self, career_path: str) -> Dict[str, Any]:
        """Create roadmap and return final result (non-streaming)"""
        # Get the final state from the stream
        final_result = None
        for update in self.create_roadmap_stream(career_path):
            final_result = update
        
        if final_result and final_result.get("status") == "complete":
            return {
                "analysis": final_result.get("analysis"),
                "roadmap_structure": final_result.get("roadmap_structure"),
                "detailed_description": final_result.get("detailed_description"),
                "roadmap_id": final_result.get("roadmap_id"),
                "metadata": final_result.get("metadata")
            }
        else:
            error_msg = final_result.get("error", "Unknown error") if final_result else "No result received"
            return {
                "analysis": final_result.get("analysis") if final_result else None,
                "roadmap_structure": {"nodes": [], "edges": [], "phases": []},
                "detailed_description": f"Error: {error_msg}",
                "roadmap_id": None,
                "metadata": None
            }
    
    def _get_stage_description(self, stage: str) -> str:
        """Get human-readable description for each stage"""
        descriptions = {
            "starting": "Initializing roadmap generation...",
            "career_analyzed": "Analyzing career path and requirements...",
            "roadmap_generated": "Creating detailed learning roadmap...",
            "description_generated": "Generating comprehensive career guide...",
            "roadmap_complete": "Roadmap generated successfully!",
            "error": "An error occurred during processing"
        }
        return descriptions.get(stage, "Processing...")

# Legacy compatibility class
class RoadmapAgent:
    """Legacy wrapper for backward compatibility"""
    def __init__(self):
        self.system = RoadmapGenerationSystem()
    
    def create_roadmap(self, career_path: str) -> Dict[str, Any]:
        return self.system.create_roadmap(career_path)