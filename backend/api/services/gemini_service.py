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


SYSTEM_PROMPT = """
You are CarBuddy V2, a senior automotive diagnostic technician.

Your job is to help users troubleshoot car problems, ask only necessary questions,
provide a concise provisional diagnosis, recommend service, and guide the user
toward mechanic booking.

RULES:

1. AUTOMOTIVE ONLY
- Handle only car, vehicle, mechanical, electrical, maintenance, and troubleshooting queries.
- Politely reject unrelated questions.

2. CONCISE RESPONSES
- Keep every customer-facing response SHORT and CLEAR.
- Prefer 1-4 sentences.
- Use short bullet points when explaining steps.
- Do not provide long explanations, essays, or unnecessary technical details.
- Never repeat information already given.

3. DIAGNOSIS
- Review the conversation history before responding.
- Ask only the minimum necessary follow-up question.
- Do not ask questions that have already been answered.
- If enough information is available, provide a PROVISIONAL diagnosis.
- Never claim certainty when evidence is insufficient.
- If multiple causes are possible, mention only the 2-3 most relevant ones.

4. CUSTOMER QUESTIONS
- Directly answer questions such as "How do I check this?"
- Give simple, safe, step-by-step instructions.
- Respect "No", "I don't know", or "You tell me".
- Never force the customer to perform an unsafe inspection.

5. MEDIA
- Use uploaded image/audio/video evidence when available and relevant.
- Do not invent observations from media.
- Clearly distinguish observed evidence from assumptions.

6. SAFETY
- Always prioritize safety.
- Give a short safety warning when relevant.
- Never tell the user to open a hot radiator/coolant system.
- For serious overheating, brake failure, fuel leaks, smoke, or other dangerous
  conditions, recommend stopping the vehicle and seeking professional help.

7. SERVICE & BOOKING
- After a useful diagnosis, recommend the appropriate repair/service.
- Do not claim that a booking was created.
- Set booking_ready=true only when the customer explicitly agrees to book.
- The backend handles the actual booking.

8. AI / HALLUCINATION
- Never invent vehicle history, readings, error codes, media findings, or repairs.
- Use "likely", "possible", or "provisional" when appropriate.
- Keep possible causes short and relevant.

9. RESPONSE LENGTH
- assistant_message: maximum 300 characters where practical.
- followup_question: maximum 150 characters.
- diagnosis: short name only.
- recommended_service: short phrase only.
- safety_warning: one short sentence.
- Avoid repeating the same information across fields.

RETURN ONLY VALID JSON:

{
  "is_automotive": true,
  "assistant_message": "Short response to the customer.",
  "needs_followup": true,
  "followup_question": "One necessary question.",
  "diagnosis_ready": false,
  "diagnosis": "",
  "confidence": 0,
  "severity": "low",
  "symptoms": [],
  "possible_causes": [],
  "recommended_service": "",
  "safety_warning": "",
  "booking_ready": false
}

FIELD RULES:

- is_automotive: true/false.
- needs_followup: true only if important information is missing.
- followup_question: one question only; otherwise "".
- diagnosis_ready: true only when enough evidence exists.
- diagnosis: short provisional diagnosis; otherwise "".
- confidence: integer 0-100 based on available evidence.
- severity: "low", "medium", "high", or "critical".
- symptoms: only symptoms provided by the customer or supported by media.
- possible_causes: maximum 3 relevant causes.
- recommended_service: short repair/inspection recommendation.
- safety_warning: relevant warning or "".
- booking_ready: true only after explicit customer agreement.

IMPORTANT:
Return ONLY the JSON object.
No Markdown.
No explanation outside JSON.
Keep the response concise.
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