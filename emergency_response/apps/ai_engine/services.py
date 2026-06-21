import math
import logging
import json
from pathlib import Path

from decouple import Config, RepositoryEnv
from PIL import Image

logger = logging.getLogger(__name__)

_env_file = Path(__file__).resolve().parents[3] / '.env'
_config = Config(RepositoryEnv(_env_file)) if _env_file.exists() else Config(RepositoryEnv())
GEMINI_API_KEY = _config('GEMINI_API_KEY', default=None)

_genai = None


def _get_genai():
    """Lazy-load Gemini SDK only when an API key is configured."""
    global _genai
    if _genai is not None:
        return _genai
    if not GEMINI_API_KEY:
        return None
    try:
        import google.generativeai as genai
    except ImportError:
        return None
    genai.configure(api_key=GEMINI_API_KEY)
    _genai = genai
    return _genai


def calculate_distance(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """
    Calculate the great-circle distance between two points on the Earth's surface
    using the Haversine formula. Returns distance in kilometers.
    """
    R = 6371.0  # Earth's radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a = (math.sin(dlat / 2)**2 + 
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlng / 2)**2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


def run_local_rules_analysis(description: str, has_image: bool = False, has_voice: bool = False) -> dict:
    """
    Fallback local rule-based analysis for emergency reports.
    """
    description_lower = description.lower()
    
    # Keyword detection for responder types
    fire_keywords = ['fire', 'smoke', 'burn', 'explosion', 'trapped', 'flame', 'gas leak', 'spill', 'blaze']
    police_keywords = ['thief', 'robber', 'weapon', 'gun', 'fight', 'assault', 'stole', 'theft', 'break-in', 'crime', 'violence', 'shooting', 'robbery', 'burglar', 'suspicious']
    ambulance_keywords = ['heart', 'chest', 'breath', 'unconscious', 'bleed', 'pain', 'accident', 'crash', 'injury', 'stroke', 'choke', 'collapse', 'sick', 'hurt', 'medical']
    
    # Assign points
    fire_score = sum(1 for kw in fire_keywords if kw in description_lower)
    police_score = sum(1 for kw in police_keywords if kw in description_lower)
    ambulance_score = sum(1 for kw in ambulance_keywords if kw in description_lower)
    
    # Defaults
    responder_type = 'ambulance'
    if fire_score > 0 or police_score > 0 or ambulance_score > 0:
        scores = {'fire': fire_score, 'police': police_score, 'ambulance': ambulance_score}
        responder_type = max(scores, key=scores.get)
        
    # Severity assessment
    critical_keywords = ['unconscious', 'heart attack', 'explosion', 'gun', 'shooting', 'active fire', 'not breathing', 'dying', 'major crash']
    medium_keywords = ['accident', 'injury', 'fight', 'gas leak', 'smoke', 'pain', 'broken bone', 'bleeding']
    
    is_critical = any(kw in description_lower for kw in critical_keywords)
    is_medium = any(kw in description_lower for kw in medium_keywords)
    
    if is_critical or (has_image and responder_type == 'fire'):
        severity = 'critical'
    elif is_medium or has_image or has_voice:
        severity = 'medium'
    else:
        severity = 'low'
        
    explanation = "Analyzed locally using keyword heuristics."
    if has_image:
        explanation += " Image uploaded (assumed active incident)."
    if has_voice:
        explanation += " Voice note uploaded (assumed urgent request)."
        
    return {
        'severity': severity,
        'responder_type': responder_type,
        'explanation': explanation,
        'transcribed_text': "[Voice transcription not available in offline mode]" if has_voice else ""
    }


def analyze_emergency_report(description: str, image_path: str = None, voice_path: str = None) -> dict:
    """
    Main entry point for emergency report analysis. Uses Gemini API if configured, otherwise falls back.
    """
    genai = _get_genai()
    if not genai:
        logger.info("Using local rule-based engine (Gemini API not configured).")
        return run_local_rules_analysis(description, has_image=bool(image_path), has_voice=bool(voice_path))

    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        prompt = (
            "You are an AI dispatcher for an Emergency Response System. "
            "Analyze the description of this incident and any attached media (image/audio). "
            "Determine:\n"
            "1. The severity (must be exactly 'low', 'medium', or 'critical')\n"
            "2. The required responder type (must be exactly 'ambulance', 'police', or 'fire')\n"
            "3. If an audio recording is provided, transcribe it. Otherwise leave 'transcribed_text' blank.\n"
            "4. A brief explanation for your choice.\n\n"
            "Respond ONLY with a valid JSON object matching this structure:\n"
            "{\n"
            "  \"severity\": \"low|medium|critical\",\n"
            "  \"responder_type\": \"ambulance|police|fire\",\n"
            "  \"explanation\": \"string\",\n"
            "  \"transcribed_text\": \"string\"\n"
            "}"
        )
        
        contents = [prompt, f"Citizen Description: {description}"]
        
        if image_path:
            try:
                img = Image.open(image_path)
                contents.append(img)
            except Exception as e:
                logger.error(f"Failed to open image for Gemini: {e}")
                
        if voice_path:
            try:
                with open(voice_path, 'rb') as f:
                    audio_data = f.read()
                mime_type = "audio/wav"
                if voice_path.endswith('.mp3'):
                    mime_type = "audio/mp3"
                elif voice_path.endswith('.ogg'):
                    mime_type = "audio/ogg"
                contents.append({
                    "mime_type": mime_type,
                    "data": audio_data
                })
            except Exception as e:
                logger.error(f"Failed to read audio file for Gemini: {e}")
                
        response = model.generate_content(contents)
        text = response.text.strip()
        
        # Clean markdown code block wraps if present
        if text.startswith("```json"):
            text = text[7:]
        if text.endswith("```"):
            text = text[:-3]
        text = text.strip()
        
        result = json.loads(text)
        
        # Validate values
        if result.get('severity') not in ['low', 'medium', 'critical']:
            result['severity'] = 'low'
        if result.get('responder_type') not in ['ambulance', 'police', 'fire']:
            result['responder_type'] = 'ambulance'
            
        return result
        
    except Exception as e:
        logger.error(f"Gemini API analysis failed, falling back: {e}")
        return run_local_rules_analysis(description, has_image=bool(image_path), has_voice=bool(voice_path))
