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
        
# ---------------- Severity Scoring ----------------

    severity_score = 0

    critical_weights = {
        "heart attack": 60,
        "cardiac arrest": 60,
        "not breathing": 60,
        "unconscious": 55,
        "unconsciousness": 55,
        "stroke": 55,
        "major crash": 45,
        "accident": 35,
        "collision": 35,
        "collided": 35,
        "serious injury": 35,
        "serious injuries": 35,
        "heavy bleeding": 50,
        "bleeding": 35,
        "fire": 50,
        "explosion": 60,
        "shooting": 60,
        "gun": 45,
        "dying": 60,
    }

    medium_weights = {
        "injury": 20,
        "hurt": 18,
        "pain": 15,
        "fracture": 25,
        "broken bone": 25,
        "burn": 25,
        "smoke": 20,
        "fight": 25,
        "gas leak": 30,
        "collapse": 25,
        "choking": 30,
    }
    possible_conditions = []

    for keyword, weight in critical_weights.items():
        if keyword in description_lower:
            severity_score += weight
            possible_conditions.append(keyword.title())

    for keyword, weight in medium_weights.items():
        if keyword in description_lower:
            severity_score += weight
            possible_conditions.append(keyword.title())

    if has_image:
        severity_score += 12

    if has_voice:
        severity_score += 8

    severity_score = min(100, severity_score)
    if severity_score >= 60:
       severity = "critical"
       priority = "P1"

    elif severity_score >= 30:
        severity = "medium"
        priority = "P2"

    else:
        severity = "low"
        priority = "P3"

    confidence = min(95, 60 + severity_score // 2)
        
    explanation = "Analyzed locally using keyword heuristics."
    if has_image:
        explanation += " Image uploaded (assumed active incident)."
    if has_voice:
        explanation += " Voice note uploaded (assumed urgent request)."
    
    print(description_lower)
    print(severity_score)
    print(severity)
    print(possible_conditions)
        
    return {
    "severity": severity,
    "severity_score": severity_score,
    "confidence": confidence,
    "priority": priority,
    "responder_type": responder_type,
    "required_units": [responder_type],
    "possible_conditions": possible_conditions,
    "recommended_hospital_type": (
        "Trauma Center"
        if responder_type == "ambulance"
        else "General Hospital"
    ),
    "estimated_response_minutes": (
        5 if severity == "critical"
        else 10 if severity == "medium"
        else 20
    ),
    "explanation": explanation,
    "transcribed_text": (
        "[Voice transcription not available in offline mode]"
        if has_voice
        else ""
    ),
}


def analyze_emergency_report(
    description: str, image_path: str = None, voice_path: str = None
) -> dict:
    """
    Main entry point for emergency report analysis.
    Uses Gemini API if configured, otherwise falls back.
    """
    genai = _get_genai()

    if not genai:
        logger.info("Using local rule-based engine (Gemini API not configured).")
        return run_local_rules_analysis(
            description,
            has_image=bool(image_path),
            has_voice=bool(voice_path),
        )

    try:
        model = genai.GenerativeModel("gemini-2.5-flash")

        prompt = """
You are an expert Emergency Medical Triage AI used by a national emergency response system.

Analyze the citizen's emergency report using the text, image and audio if provided.

Return ONLY valid JSON.

{
    "severity":"low|medium|critical",
    "severity_score":0,
    "confidence":0,
    "priority":"P1|P2|P3",
    "responder_type":"ambulance|fire|police",
    "required_units":[
        "ambulance"
    ],
    "possible_conditions":[
        "condition"
    ],
    "recommended_hospital_type":"",
    "estimated_response_minutes":0,
    "transcribed_text":"",
    "explanation":""
}

Rules

severity_score must be between 0 and 100.

confidence must be between 0 and 100.

Priority

P1 = Immediate life threat

P2 = Serious

P3 = Non critical

Return JSON only.
"""

        contents = [prompt, f"Citizen Description: {description}"]

        if image_path:
            try:
                img = Image.open(image_path)
                contents.append(img)
            except Exception as e:
                logger.error(f"Failed to open image for Gemini: {e}")

        if voice_path:
            try:
                with open(voice_path, "rb") as f:
                    audio_data = f.read()

                mime_type = "audio/wav"

                if voice_path.endswith(".mp3"):
                    mime_type = "audio/mp3"
                elif voice_path.endswith(".ogg"):
                    mime_type = "audio/ogg"

                contents.append(
                    {
                        "mime_type": mime_type,
                        "data": audio_data,
                    }
                )

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

        # ---------- Validation ----------

        if result.get("severity") not in ["low", "medium", "critical"]:
            result["severity"] = "low"

        if result.get("responder_type") not in [
            "ambulance",
            "fire",
            "police",
        ]:
            result["responder_type"] = "ambulance"

        try:
            result["severity_score"] = max(
                0,
                min(100, int(result.get("severity_score", 0))),
            )
        except (ValueError, TypeError):
            result["severity_score"] = 0

        try:
            result["confidence"] = max(
                0,
                min(100, float(result.get("confidence", 0))),
            )
        except (ValueError, TypeError):
            result["confidence"] = 0

        if result.get("priority") not in ["P1", "P2", "P3"]:
            result["priority"] = "P3"

        result.setdefault("possible_conditions", [])
        result.setdefault(
            "required_units",
            [result["responder_type"]],
        )
        result.setdefault("recommended_hospital_type", "")
        result.setdefault("estimated_response_minutes", 15)
        result.setdefault("transcribed_text", "")
        result.setdefault("explanation", "")

        return result

    except Exception as e:
        logger.error(f"Gemini API analysis failed, falling back: {e}")
        return run_local_rules_analysis(
            description,
            has_image=bool(image_path),
            has_voice=bool(voice_path),
        )