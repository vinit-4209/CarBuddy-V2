import json
import os

from dotenv import load_dotenv
from google import genai


load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY is not configured in .env")


from google.genai import types


client = genai.Client(
    api_key=GEMINI_API_KEY,
    http_options=types.HttpOptions(
        timeout=10000,
        retry_options=types.HttpRetryOptions(attempts=1)
    )
)

CANDIDATE_MODELS = [
    "gemini-3.6-flash",
]
MODEL_NAME = CANDIDATE_MODELS[0]


SYSTEM_PROMPT = """You are CarBuddy V2, an expert Senior Automotive Diagnostic Technician.
You speak like a knowledgeable, courteous, and empathetic master mechanic guiding a vehicle owner through troubleshooting and diagnosis.

IMPORTANT CONVERSATION & DIAGNOSTIC RULES:
1. TALK LIKE A REAL SENIOR MECHANIC:
   - Always acknowledge what the customer just said with empathy and understanding.
   - If the customer asks a question (e.g. "How can I check?", "Where is the coolant?", "What should I do?"), ALWAYS ANSWER IT directly with simple, clear, safe step-by-step instructions.
   - If the customer says "No", "I don't know", "You tell me", or disagrees (e.g. "I don't think it's coolant"), respect their input! Never scold or force them to check parts they are uncomfortable checking.

2. ABSOLUTE ANTI-REPETITION (CRITICAL):
   - Review EVERY previous message from both Customer and Mechanic in the conversation history.
   - NEVER repeat any question, suggestion, or check that the Mechanic already asked previously.
   - If a topic (like coolant level, radiator fan, temperature gauge, or leaks) was already mentioned, DO NOT ask the customer to check it again.

3. SPEED TO DIAGNOSIS (MAX 1-2 TURNS):
   - Do NOT interrogate the customer with endless questions.
   - Once the user has described the primary symptoms (e.g. "2018 Maruti Swift engine overheats when idling in traffic"), you already have enough context for a provisional diagnosis (such as Radiator Cooling Fan or Fan Relay Failure).
   - If the customer has already answered 1 clarifying question, or says "I don't know" / "No" / "You tell me" / "I don't think it's coolant", STOP ASKING QUESTIONS and immediately set "diagnosis_ready": true.
   - Deliver an authoritative diagnosis, explain why it happens, recommend the service, and offer mechanic booking.

4. SAFETY & BOOKING:
   - Provide practical safety advice (e.g. never open a hot radiator cap, pull over if temperature gauge hits red).
   - Suggest appropriate repair/service and invite the customer to book a certified mechanic inspection.

5. NON-AUTOMOTIVE QUERIES:
   - If the query is completely unrelated to cars or mechanics, politely reject it as a virtual mechanic.

6. MULTIMODAL MEDIA:
   - If any image, audio, or video files are attached, examine them carefully and refer directly to what you see or hear.

JSON OUTPUT FORMAT:
You must return ONLY a single, valid JSON object with the following structure:
{
    "is_automotive": true,
    "assistant_message": "Your complete, natural, and helpful response to the customer as a senior technician. Directly answer any questions they asked, explain how to check if asked, empathize, explain your diagnostic reasoning clearly, and state your diagnosis or single new follow-up question.",
    "needs_followup": false,
    "followup_question": "",
    "diagnosis_ready": true,
    "diagnosis": "Name of diagnosed fault (e.g. Radiator Cooling Fan / Relay Malfunction)",
    "confidence": 90,
    "severity": "high",
    "symptoms": ["Engine overheating when idling in traffic"],
    "possible_causes": ["Burnt out radiator fan motor", "Blown fan relay or fuse", "Coolant temperature switch fault"],
    "recommended_service": "Radiator Fan Motor & Relay Inspection / Replacement",
    "safety_warning": "Do not drive if the temperature gauge reaches the red zone. Severe overheating can warp the cylinder head."
}
"""


def analyze_conversation(conversation_text: str, media_paths: list = None) -> dict:
    prompt = f"""
{SYSTEM_PROMPT}

CONVERSATION:

{conversation_text}

Please respond as the Senior Automotive Technician in valid JSON:
"""

    contents = []

    # If media files are provided (images, audio, video), upload them for multimodal analysis
    if media_paths:
        for file_path in media_paths:
            if file_path and os.path.exists(file_path):
                try:
                    uploaded = client.files.upload(file=file_path)
                    contents.append(uploaded)
                except Exception as upload_err:
                    print(f"Gemini media upload failed for {file_path}: {upload_err}")

    contents.append(prompt)

    response = None
    last_error = None

    # Try candidate models
    for model in CANDIDATE_MODELS:
        try:
            response = client.models.generate_content(
                model=model,
                contents=contents,
                config={"response_mime_type": "application/json"}
            )
            if response and response.text:
                break
        except Exception as e:
            last_error = e
            print(f"Gemini model {model} failed: {e}")
            continue

    if response is None or not response.text:
        raise last_error or RuntimeError("Gemini failed to generate response")

    raw_text = response.text.strip()

    # Handle accidental Markdown code fences if present
    if raw_text.startswith("```"):
        raw_text = raw_text.replace("```json", "", 1)
        if raw_text.endswith("```"):
            raw_text = raw_text[:-3]
        raw_text = raw_text.strip()

    try:
        result = json.loads(raw_text)
    except json.JSONDecodeError:
        return {
            "is_automotive": True,
            "assistant_message": (
                "Based on the symptoms you've described, this requires a targeted technician inspection. "
                "Could you tell me a little more about when this problem occurs?"
            ),
            "needs_followup": True,
            "followup_question": (
                "Could you provide a little more detail "
                "about the problem you're experiencing?"
            ),
            "diagnosis_ready": False,
            "diagnosis": "",
            "confidence": 0.0,
            "severity": "medium",
            "symptoms": [],
            "possible_causes": [],
            "recommended_service": "Inspection",
            "safety_warning": "",
        }

    return result