import os
from .automotive_filter import (
    is_automotive_query,
    get_rejection_message,
)


def get_conversation_media_paths(conversation):
    """Collect file paths of all uploaded media in the conversation."""
    paths = []
    for msg in conversation.messages.all():
        if msg.media:
            try:
                if hasattr(msg.media, "path") and os.path.exists(msg.media.path):
                    paths.append(msg.media.path)
            except Exception:
                pass
    return paths


def build_conversation_context(conversation):
    messages = conversation.messages.order_by("created_at")

    lines = []

    for message in messages:
        role = "Customer" if message.role == "user" else "Mechanic"
        media_tag = ""
        if message.media_type and message.media_type != "text":
            media_tag = f"[{message.media_type.capitalize()} Attached: {os.path.basename(str(message.media))}] "

        content = message.content or ""
        if not content and media_tag:
            content = f"Shared a {message.media_type} file for technician inspection."

        lines.append(f"{role}: {media_tag}{content}".strip())

    return "\n".join(lines)


def process_message(message: str, conversation) -> dict:
    """
    Process a message using traditional rule-based backend logic.
    Provides helpful explanations, avoids repetition, and reaches a diagnosis
    without requiring external AI APIs.
    """
    text = (message or "").lower().strip()

    previous_messages = conversation.messages.order_by("created_at")[:10]
    previous_text = " ".join(
        (msg.content or "").lower() for msg in previous_messages
    )

    current_is_automotive = is_automotive_query(text)
    conversation_is_automotive = is_automotive_query(previous_text)

    is_automotive = current_is_automotive or conversation_is_automotive

    if not is_automotive:
        rejection = get_rejection_message()
        return {
            "is_automotive": False,
            "needs_followup": False,
            "diagnosis_ready": False,
            "followup_question": None,
            "assistant_message": rejection,
            "message": rejection,
        }

    # Detect user intent signals
    is_asking_how = any(phrase in text for phrase in [
        "how can i check", "how to check", "how do i check", "what should i do",
        "what i have to do", "provide me details", "explain how", "guide me"
    ])
    is_unable_or_uncertain = any(phrase in text for phrase in [
        "dont know", "don't know", "not sure", "you tell me", "no idea",
        "cant check", "can't check", "unable to check"
    ])
    has_disagreement = any(phrase in text for phrase in [
        "dont think", "don't think", "not coolant", "not the coolant"
    ])
    turn_count = conversation.messages.filter(role="user").count()

    is_requesting_steps = any(phrase in text for phrase in [
        "troubleshoot", "troubleshooting", "steps", "step by step", "process",
        "how to fix", "how can i fix", "guide me step by step", "give me steps"
    ])

    # ------------------------------------------------
    # OVERHEATING FLOW
    # ------------------------------------------------
    if "overheat" in previous_text or "overheating" in previous_text or "overheat" in text or "overheating" in text:
        has_idle_context = any(w in text or w in previous_text for w in ["traffic", "idle", "standing", "signal", "stopped"])
        has_fan_context = any(w in text or w in previous_text for w in ["fan", "not spinning", "not running", "does not turn on", "doesnt turn on", "stopped"])

        # Case 1: Customer asks "How can I check?" or asks for troubleshooting steps
        if is_asking_how or is_requesting_steps:
            msg = (
                "Here is the recommended step-by-step troubleshooting process for your vehicle's cooling system:\n\n"
                "### Step 1: Safe Cool-Down\n"
                "• Turn off the engine and let it cool completely for at least 30–45 minutes.\n"
                "• CAUTION: Never open the radiator pressure cap while the engine is hot.\n\n"
                "### Step 2: Coolant Level & Expansion Tank Check\n"
                "• Locate the translucent plastic coolant reservoir tank next to the radiator.\n"
                "• Ensure the fluid level is between the 'MIN' and 'MAX' marks. If low, top up with 50/50 premixed coolant.\n\n"
                "### Step 3: Radiator Fan Operation Test\n"
                "• Turn the vehicle ignition to ON and switch your Air Conditioning (AC) to MAX cool.\n"
                "• Pop the hood and inspect behind the radiator: the electric cooling fan should immediately start spinning.\n"
                "• If the fan stays completely still, the fan motor, fuse, or relay has failed.\n\n"
                "### Step 4: Cooling Fan Fuse & Relay Inspection\n"
                "• Open the under-hood fuse/relay box (refer to your vehicle's fuse diagram).\n"
                "• Inspect the 'RAD FAN' / 'COOLING FAN' fuse (typically 15A–30A). If the filament is broken, replace it.\n"
                "• Swap the cooling fan relay with an identical non-critical relay (such as the horn relay) to see if the fan engages.\n\n"
                "### Step 5: Temperature Switch & Motor Check\n"
                "• Inspect the wiring plug directly connected to the fan motor for corrosion, melting, or loose wires.\n"
                "• If the fuse and relay are good but the fan motor does not spin, the fan motor itself needs replacement.\n\n"
                "Let me know what you find during these checks!"
            )
            return {
                "is_automotive": True,
                "needs_followup": True,
                "diagnosis_ready": False,
                "assistant_message": msg,
                "followup_question": "Which of these checks are you able to try first?",
            }

        # Case 2: Customer is uncertain, unable to check, disagrees, or has had >= 2 turns -> MOVE TO DIAGNOSIS
        if has_idle_context and (has_fan_context or is_unable_or_uncertain or has_disagreement or turn_count >= 2):
            msg = (
                "Based on the symptoms you've reported—specifically engine overheating while idling in traffic—the "
                "evidence strongly points to a **Radiator Cooling Fan Failure or Faulty Fan Relay**.\n\n"
                "When your car is moving, air is forced through the radiator grille naturally, keeping the engine cool. "
                "However, when idling or stopped in traffic, the electric cooling fan must actively pull air. If the fan motor or relay "
                "fails, heat builds up rapidly.\n\n"
                "**Diagnosis:** Radiator Cooling Fan / Relay Malfunction\n"
                "**Recommended Service:** Radiator Fan Motor & Relay Inspection / Replacement\n"
                "**Safety Precaution:** Do not continue driving if the temperature gauge enters the red zone, as severe overheating can warp the cylinder head or blow the head gasket.\n\n"
                "Would you like me to book a certified mechanic to inspect and replace the fan assembly for you?"
            )
            return {
                "is_automotive": True,
                "needs_followup": False,
                "diagnosis_ready": True,
                "assistant_message": msg,
                "diagnosis": "Radiator Cooling Fan Failure / Fan Relay Malfunction",
                "confidence": 92,
                "severity": "high",
                "symptoms": [
                    "Engine overheating during idle or stationary traffic",
                    "Cooling system fails to regulate temperature without vehicle motion",
                    "Radiator cooling fan inoperative or delayed"
                ],
                "possible_causes": [
                    "Burnt out radiator cooling fan motor",
                    "Blown cooling fan fuse or faulty relay",
                    "Engine coolant temperature (ECT) sensor signal fault"
                ],
                "recommended_service": "Radiator Fan Motor & Relay Inspection / Replacement",
                "safety_warning": "Do not drive while the engine temperature is in the red zone. Severe overheating can warp the cylinder head or blow the head gasket.",
            }

        # Initial clarifying follow-up
        if has_idle_context:
            msg = (
                "Overheating while idling in traffic usually indicates an airflow issue through the radiator when stationary. "
                "Have you noticed if the radiator cooling fan spins when the engine is warm or when you turn the AC on to MAX?"
            )
            return {
                "is_automotive": True,
                "needs_followup": True,
                "diagnosis_ready": False,
                "assistant_message": msg,
                "followup_question": "Does the radiator fan turn on when the AC is running?",
            }

        msg = (
            "To narrow down the cause of the overheating: does the temperature spike primarily when idling in traffic, "
            "when driving at higher speeds on the highway, or continuously under all conditions?"
        )
        return {
            "is_automotive": True,
            "needs_followup": True,
            "diagnosis_ready": False,
            "assistant_message": msg,
            "followup_question": "When does the overheating happen most — while idling in traffic or on the highway?",
        }

    # ------------------------------------------------
    # BATTERY / STARTING FLOW
    # ------------------------------------------------
    if any(w in text or w in previous_text for w in ["battery", "won't start", "not starting", "starting problem", "crank", "dead"]):
        has_click = any(w in text or w in previous_text for w in ["click", "clicking", "rapid click"])
        has_lights = any(w in text or w in previous_text for w in ["dim", "flicker", "lights work", "radio works"])

        if has_click or (has_lights and any(w in text or w in previous_text for w in ["no crank", "won't crank"])) or turn_count >= 2:
            msg = (
                "Based on the starting behavior you described, the issue is a **Discharged Car Battery or Corroded Battery Terminals**.\n\n"
                "The clicking noise occurs when the starter solenoid engages but there is insufficient electrical amperage from the battery to rotate the engine flywheel.\n\n"
                "**Diagnosis:** Discharged Battery / Terminal Oxidation\n"
                "**Recommended Service:** Battery Health Test & Terminal Cleaning / Replacement\n"
                "**Safety Precaution:** Avoid repeated continuous cranking as this can overheat and burn out the starter motor.\n\n"
                "Would you like to book a mobile technician to test and jump/replace the battery?"
            )
            return {
                "is_automotive": True,
                "needs_followup": False,
                "diagnosis_ready": True,
                "assistant_message": msg,
                "diagnosis": "Discharged Car Battery or Corroded Battery Terminals",
                "confidence": 88,
                "severity": "medium",
                "symptoms": [
                    "Rapid clicking sound when turning key or pressing start button",
                    "Engine does not crank",
                    "Dashboard lights dimming during start attempt"
                ],
                "possible_causes": [
                    "Aged or depleted 12V battery",
                    "Corroded or loose battery cable terminals",
                    "Faulty alternator failing to recharge the battery"
                ],
                "recommended_service": "Battery Health Test & Terminal Cleaning / Replacement",
                "safety_warning": "Avoid repeated continuous cranking as this can overheat and burn out the starter motor.",
            }

        msg = (
            "When you attempt to start the engine, do you hear a rapid clicking sound, does the starter crank very slowly, "
            "or is there complete silence from the engine bay?"
        )
        return {
            "is_automotive": True,
            "needs_followup": True,
            "diagnosis_ready": False,
            "assistant_message": msg,
            "followup_question": "Do you hear rapid clicking or complete silence when trying to start?",
        }

    # ------------------------------------------------
    # BRAKE FLOW
    # ------------------------------------------------
    if any(w in text or w in previous_text for w in ["brake", "braking", "brakes"]):
        has_noise = any(w in text or w in previous_text for w in ["squeak", "squeal", "grinding", "grind"])
        if has_noise or turn_count >= 2:
            is_grinding = "grind" in text or "grinding" in text or "grind" in previous_text
            diag_title = "Worn Brake Pads & Rotor Wear" if is_grinding else "Brake Pad Wear Indicator Contact"
            msg = (
                f"Based on the braking noise you've described, the diagnosis is **{diag_title}**.\n\n"
                "Brake pads feature built-in metal wear indicators that squeal when the friction material drops below 3mm. "
                "A grinding noise indicates the pads have completely worn down and the metal backing plate is contacting the rotor disc.\n\n"
                f"**Diagnosis:** {diag_title}\n"
                "**Recommended Service:** Brake Pad & Rotor Inspection and Replacement\n"
                "**Safety Precaution:** Severely worn brakes significantly increase stopping distance. Have this serviced before highway driving.\n\n"
                "Would you like to book a certified mechanic to inspect and replace your brake pads?"
            )
            return {
                "is_automotive": True,
                "needs_followup": False,
                "diagnosis_ready": True,
                "assistant_message": msg,
                "diagnosis": diag_title,
                "confidence": 90,
                "severity": "high" if is_grinding else "medium",
                "symptoms": ["Audible metal grinding or squealing during braking", "Reduced pedal firmness"],
                "possible_causes": ["Brake pads worn down to friction limits", "Scored brake rotors", "Caliper slider pin sticking"],
                "recommended_service": "Brake Pad and Rotor Replacement Service",
                "safety_warning": "Severely worn brakes increase stopping distance significantly. Have your brake system inspected immediately.",
            }

        msg = (
            "To pinpoint the brake issue: are you experiencing a high-pitched squeal, a harsh metallic grinding noise, "
            "vibration in the brake pedal, or does the vehicle pull to one side when stopping?"
        )
        return {
            "is_automotive": True,
            "needs_followup": True,
            "diagnosis_ready": False,
            "assistant_message": msg,
            "followup_question": "Is the noise a high-pitched squeak or a metal-on-metal grinding?",
        }

    # ------------------------------------------------
    # GENERAL AUTOMOTIVE FOLLOW-UP
    # ------------------------------------------------
    msg = (
        "I'm here to help diagnose your vehicle. Could you tell me the year, make, and model of your car, "
        "and describe the main symptom you're noticing (e.g. strange noise, warning light, loss of power, or leak)?"
    )
    return {
        "is_automotive": True,
        "needs_followup": True,
        "diagnosis_ready": False,
        "assistant_message": msg,
        "followup_question": "What is the year, make, and model of your car, and what symptom are you noticing?",
    }