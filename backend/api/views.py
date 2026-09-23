import os
from datetime import datetime
from django.utils import timezone
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .models import Conversation, Message, Diagnosis, Booking
from .services.automotive_filter import (
    is_automotive_query,
    get_rejection_message,
    is_greeting,
    get_greeting_response,
)
from .services.chat_service import (
    build_conversation_context,
    get_conversation_media_paths,
    process_message,
)
from .services.gemini_service import analyze_conversation
from .services.groq_service import analyze_conversation as analyze_with_groq


@api_view(["GET"])
def health_check(request):
    return Response({
        "status": "success",
        "message": "CarBuddy V2 backend is running"
    })


@api_view(["POST"])
def chat(request):
    message_text = request.data.get("message", "").strip()
    conversation_id = request.data.get("conversation_id")

    # If message is empty but there's a conversation with media, permit inspection
    if not message_text and not request.data.get("media_ids"):
        return Response(
            {
                "success": False,
                "error": "Message is required."
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    # -------------------------
    # Get or create conversation
    # -------------------------
    if conversation_id:
        try:
            conversation = Conversation.objects.get(id=conversation_id)
        except Conversation.DoesNotExist:
            return Response(
                {
                    "success": False,
                    "error": "Conversation not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )
    else:
        conversation = Conversation.objects.create()

    # -------------------------
    # Save user message
    # -------------------------
    user_message = Message.objects.create(
        conversation=conversation,
        role="user",
        content=message_text,
        media_type="text"
    )

    # -------------------------
    # Traditional logic: Check greetings first (zero AI cost)
    # -------------------------
    if is_greeting(message_text):
        assistant_text = get_greeting_response()
        assistant_message = Message.objects.create(
            conversation=conversation,
            role="assistant",
            content=assistant_text,
            media_type="text"
        )
        return Response({
            "success": True,
            "conversation_id": conversation.id,
            "user_message": {
                "id": user_message.id,
                "content": user_message.content,
                "role": "user",
            },
            "assistant_message": {
                "id": assistant_message.id,
                "content": assistant_message.content,
                "role": "assistant",
            },
            "is_automotive": True,
            "needs_followup": True,
            "followup_question": assistant_text,
            "diagnosis_ready": False,
        })

    # -------------------------
    # Traditional logic: Check booking intent if already diagnosed
    # -------------------------
    try:
        existing_diag = conversation.diagnosis
    except Exception:
        existing_diag = None

    is_booking_intent = any(w in message_text.lower() for w in [
        "book", "booking", "schedule", "appointment", "yes book", "yes please",
        "please book", "book mechanic", "i agree", "proceed with booking"
    ])

    if existing_diag and is_booking_intent:
        assistant_text = (
            f"I have your diagnostic report ready for **{existing_diag.title}**! "
            f"Please click the **'Book Mechanic'** button below to choose your preferred date, time, and address, "
            f"and our certified technician will be assigned to service your vehicle."
        )
        assistant_message = Message.objects.create(
            conversation=conversation,
            role="assistant",
            content=assistant_text,
            media_type="text"
        )
        return Response({
            "success": True,
            "conversation_id": conversation.id,
            "user_message": {
                "id": user_message.id,
                "content": user_message.content,
                "role": "user",
            },
            "assistant_message": {
                "id": assistant_message.id,
                "content": assistant_message.content,
                "role": "assistant",
            },
            "is_automotive": True,
            "needs_followup": False,
            "diagnosis_ready": True,
            "diagnosis_id": existing_diag.id,
            "diagnosis": existing_diag.title,
            "confidence": existing_diag.confidence,
            "severity": existing_diag.severity,
            "symptoms": existing_diag.symptoms,
            "possible_causes": existing_diag.possible_causes,
            "recommended_service": existing_diag.recommended_service,
            "safety_warning": existing_diag.safety_notes,
        })

    # -------------------------
    # Traditional logic: Check automotive domain
    # -------------------------
    previous_messages = conversation.messages.filter(role="user").exclude(id=user_message.id).order_by("-created_at")[:10]
    previous_context = " ".join(m.content for m in previous_messages if m.content)
    has_media = conversation.messages.exclude(media="").exclude(media__isnull=True).exists()

    is_automotive = (
        is_automotive_query(message_text)
        or is_automotive_query(previous_context)
        or has_media
    )

    # Reject unrelated queries politely
    if not is_automotive:
        assistant_text = get_rejection_message()
        assistant_message = Message.objects.create(
            conversation=conversation,
            role="assistant",
            content=assistant_text,
            media_type="text"
        )
        return Response({
            "success": True,
            "conversation_id": conversation.id,
            "user_message": {
                "id": user_message.id,
                "content": user_message.content,
                "role": "user",
            },
            "assistant_message": {
                "id": assistant_message.id,
                "content": assistant_message.content,
                "role": "assistant",
            },
            "is_automotive": False,
            "needs_followup": False,
            "diagnosis_ready": False,
        })

    # -------------------------
    # AI Reasoning: Gemini -> Groq -> Rule-based fallback
    # -------------------------
    conversation_context = build_conversation_context(conversation)
    media_paths = get_conversation_media_paths(conversation)
    ai_result = None

    # 1. Try Gemini
    try:
        ai_result = analyze_conversation(conversation_context, media_paths=media_paths)
    except Exception as gemini_error:
        print(f"Gemini unavailable: {gemini_error}")
        print("Falling back to Groq...")

        # 2. Try Groq
        try:
            ai_result = analyze_with_groq(conversation_context)
        except Exception as groq_error:
            print(f"Groq unavailable: {groq_error}")
            print("Falling back to traditional rule-based logic...")

            # 3. Rule-based traditional backend logic
            ai_result = process_message(message_text, conversation)

    if not ai_result:
        ai_result = process_message(message_text, conversation)

    # -------------------------
    # Determine assistant message text
    # -------------------------
    assistant_text = (
        ai_result.get("assistant_message")
        or ai_result.get("message")
        or ai_result.get("content")
    )

    if not assistant_text:
        if ai_result.get("diagnosis_ready"):
            diag_title = ai_result.get("diagnosis") or "Vehicle Diagnostic Issue"
            rec_service = ai_result.get("recommended_service") or "Professional mechanic inspection recommended."
            assistant_text = f"Based on the symptoms you've reported, the most likely issue is: **{diag_title}**.\n\n**Recommended Service:** {rec_service}"
            safety_warning = ai_result.get("safety_warning")
            if safety_warning:
                assistant_text += f"\n\n**Safety Precaution:** {safety_warning}"
            assistant_text += "\n\nWould you like me to book a certified mechanic to inspect and repair this for you?"
        else:
            assistant_text = (
                ai_result.get("followup_question")
                or ai_result.get("question")
                or "Could you provide a few more details about when this vehicle problem happens?"
            )

    # -------------------------
    # Anti-repetition guard (strictly prevent repeating questions)
    # -------------------------
    prev_assistant_msgs = list(
        conversation.messages.filter(role="assistant").order_by("-created_at")[:5].values_list("content", flat=True)
    )
    norm_new = assistant_text.strip().lower()
    is_repeated = any(
        len(prev) > 20 and (prev.lower() in norm_new or norm_new in prev.lower())
        for prev in prev_assistant_msgs
    )

    if is_repeated and not ai_result.get("diagnosis_ready"):
        # Intervene immediately: stop interrogating, deliver diagnosis based on symptoms
        ai_result["diagnosis_ready"] = True
        if not ai_result.get("diagnosis"):
            if any(w in conversation_context.lower() for w in ["overheat", "temperature", "traffic"]):
                ai_result["diagnosis"] = "Radiator Cooling Fan / Relay Malfunction"
                ai_result["recommended_service"] = "Radiator Fan Motor & Relay Inspection / Replacement"
                ai_result["severity"] = "high"
                ai_result["safety_warning"] = "Do not drive if engine temperature reaches red zone."
            elif any(w in conversation_context.lower() for w in ["battery", "crank", "click"]):
                ai_result["diagnosis"] = "Discharged Car Battery or Corroded Battery Terminals"
                ai_result["recommended_service"] = "Battery Health Test & Terminal Cleaning / Replacement"
                ai_result["severity"] = "medium"
            else:
                ai_result["diagnosis"] = "Vehicle Component Wear / Diagnostic Inspection Required"
                ai_result["recommended_service"] = "Comprehensive Diagnostic Inspection"
                ai_result["severity"] = "medium"

        assistant_text = (
            f"Understood! We have enough information to proceed. "
            f"Based on what you've described, the primary issue is: **{ai_result['diagnosis']}**.\n\n"
            f"**Recommended Service:** {ai_result.get('recommended_service', 'Inspection & Repair')}.\n\n"
            f"You can click **'Book Mechanic'** below to schedule a certified technician to inspect and fix this for you."
        )

    # Save assistant message
    assistant_message = Message.objects.create(
        conversation=conversation,
        role="assistant",
        content=assistant_text,
        media_type="text"
    )

    # -------------------------
    # Save diagnosis if ready
    # -------------------------
    diagnosis = None
    if ai_result.get("diagnosis_ready"):
        diagnosis, _ = Diagnosis.objects.update_or_create(
            conversation=conversation,
            defaults={
                "title": ai_result.get("diagnosis") or "Vehicle Diagnostic Issue",
                "confidence": ai_result.get("confidence") or 85.0,
                "severity": ai_result.get("severity", "medium"),
                "symptoms": ai_result.get("symptoms", []),
                "possible_causes": ai_result.get("possible_causes", []),
                "recommended_service": ai_result.get("recommended_service") or "General Mechanic Inspection",
                "safety_notes": ai_result.get("safety_warning") or "",
            }
        )
        conversation.status = "diagnosed"
        conversation.save(update_fields=["status", "updated_at"])

    # -------------------------
    # Return response for ALL turns (follow-up or diagnosis)
    # -------------------------
    return Response({
        "success": True,
        "conversation_id": conversation.id,
        "user_message": {
            "id": user_message.id,
            "content": user_message.content,
            "role": user_message.role,
        },
        "assistant_message": {
            "id": assistant_message.id,
            "content": assistant_message.content,
            "role": assistant_message.role,
        },
        "is_automotive": ai_result.get("is_automotive", True),
        "needs_followup": ai_result.get("needs_followup", False),
        "followup_question": ai_result.get("followup_question") or ai_result.get("question"),
        "diagnosis_ready": ai_result.get("diagnosis_ready", False),
        "diagnosis_id": diagnosis.id if diagnosis else None,
        "diagnosis": ai_result.get("diagnosis"),
        "confidence": ai_result.get("confidence"),
        "severity": ai_result.get("severity", "medium"),
        "symptoms": ai_result.get("symptoms", []),
        "possible_causes": ai_result.get("possible_causes", []),
        "recommended_service": ai_result.get("recommended_service"),
        "safety_warning": ai_result.get("safety_warning"),
    })


@api_view(["POST"])
def diagnosis_view(request):
    conversation_id = request.data.get("conversation_id")

    if not conversation_id:
        return Response(
            {
                "success": False,
                "error": "conversation_id is required."
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        conversation = Conversation.objects.get(id=conversation_id)
    except Conversation.DoesNotExist:
        return Response(
            {
                "success": False,
                "error": "Conversation not found."
            },
            status=status.HTTP_404_NOT_FOUND
        )

    # If diagnosis already exists, return it
    try:
        diagnosis = Diagnosis.objects.get(conversation=conversation)
    except Diagnosis.DoesNotExist:
        # Generate diagnosis on-demand from the conversation history
        context = build_conversation_context(conversation)
        media_paths = get_conversation_media_paths(conversation)
        ai_result = None

        try:
            ai_result = analyze_conversation(context, media_paths=media_paths)
        except Exception:
            try:
                ai_result = analyze_with_groq(context)
            except Exception:
                ai_result = process_message("", conversation)

        if not ai_result or not ai_result.get("diagnosis"):
            ai_result = {
                "diagnosis": "Comprehensive Vehicle Inspection Required",
                "confidence": 80.0,
                "severity": "medium",
                "symptoms": [m.content for m in conversation.messages.filter(role="user")[:3]],
                "possible_causes": ["Mechanical wear", "Component sensor fault"],
                "recommended_service": "Multi-point Vehicle Diagnostic & Safety Inspection",
                "safety_warning": "Have a professional technician inspect the vehicle prior to extended driving."
            }

        diagnosis = Diagnosis.objects.create(
            conversation=conversation,
            title=ai_result.get("diagnosis", "Vehicle Diagnostic Issue"),
            confidence=ai_result.get("confidence") or 80.0,
            severity=ai_result.get("severity", "medium"),
            symptoms=ai_result.get("symptoms", []),
            possible_causes=ai_result.get("possible_causes", []),
            recommended_service=ai_result.get("recommended_service", "Vehicle Diagnostic Check"),
            safety_notes=ai_result.get("safety_warning", ""),
        )
        conversation.status = "diagnosed"
        conversation.save(update_fields=["status", "updated_at"])

    return Response({
        "success": True,
        "diagnosis": {
            "id": diagnosis.id,
            "conversation": conversation.id,
            "title": diagnosis.title,
            "severity": diagnosis.severity,
            "confidence": diagnosis.confidence,
            "symptoms": diagnosis.symptoms,
            "possible_causes": diagnosis.possible_causes,
            "recommended_service": diagnosis.recommended_service,
            "safety_notes": diagnosis.safety_notes,
        }
    }, status=status.HTTP_200_OK)


@api_view(["POST"])
def upload_media(request):
    uploaded_file = request.FILES.get("file")
    conversation_id = request.data.get("conversation_id")

    if not uploaded_file:
        return Response(
            {
                "success": False,
                "error": "File is required."
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    # If conversation_id is missing or doesn't exist, automatically create a new conversation
    conversation = None
    if conversation_id:
        try:
            conversation = Conversation.objects.get(id=conversation_id)
        except (Conversation.DoesNotExist, ValueError):
            pass

    if not conversation:
        conversation = Conversation.objects.create()

    # Validate file type
    allowed_types = {
        "image": ["image/jpeg", "image/png", "image/webp", "image/gif"],
        "audio": ["audio/mpeg", "audio/wav", "audio/x-wav", "audio/webm", "audio/mp4", "audio/ogg"],
        "video": ["video/mp4", "video/webm", "video/quicktime"],
    }

    content_type = uploaded_file.content_type
    media_type = None

    for file_type, mime_types in allowed_types.items():
        if content_type in mime_types:
            media_type = file_type
            break

    # Fallback check based on file extension if mime type is generic
    if not media_type and uploaded_file.name:
        ext = os.path.splitext(uploaded_file.name)[1].lower()
        if ext in [".jpg", ".jpeg", ".png", ".webp", ".gif"]:
            media_type = "image"
        elif ext in [".mp3", ".wav", ".webm", ".ogg", ".m4a"]:
            media_type = "audio"
        elif ext in [".mp4", ".mov", ".webm", ".avi"]:
            media_type = "video"

    if not media_type:
        return Response(
            {
                "success": False,
                "error": "Unsupported file type. Only image, audio, and video files are allowed."
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    # Max size 20 MB
    if uploaded_file.size > 20 * 1024 * 1024:
        return Response(
            {
                "success": False,
                "error": "File size must be 20 MB or less."
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    message = Message.objects.create(
        conversation=conversation,
        role="user",
        content="",
        media=uploaded_file,
        media_type=media_type
    )

    return Response({
        "success": True,
        "conversation_id": conversation.id,
        "message": {
            "id": message.id,
            "conversation_id": conversation.id,
            "media_type": message.media_type,
            "file_name": uploaded_file.name,
            "file_size": uploaded_file.size,
            "url": request.build_absolute_uri(message.media.url),
        }
    }, status=status.HTTP_201_CREATED)


def parse_preferred_date(date_str):
    if not date_str:
        return timezone.now().date()
    val = str(date_str).strip()
    if "T" in val:
        val = val.split("T")[0]
    for fmt in ["%Y-%m-%d", "%d/%m/%Y", "%m/%d/%Y", "%d-%m-%Y"]:
        try:
            return datetime.strptime(val, fmt).date()
        except ValueError:
            pass
    try:
        return datetime.fromisoformat(val).date()
    except Exception:
        return timezone.now().date()


def parse_preferred_time(time_str):
    if not time_str:
        return datetime.strptime("10:00:00", "%H:%M:%S").time()
    val = str(time_str).strip()
    for fmt in ["%I:%M %p", "%I:%M%p", "%I:%M:%S %p", "%H:%M:%S", "%H:%M"]:
        try:
            return datetime.strptime(val, fmt).time()
        except ValueError:
            pass
    return datetime.strptime("10:00:00", "%H:%M:%S").time()


@api_view(["POST"])
def create_booking(request):
    data = request.data

    # Support nested address object from frontend or flat parameters
    addr_obj = data.get("address") if isinstance(data.get("address"), dict) else {}

    diagnosis_id = data.get("diagnosis_id")
    customer_name = data.get("customer_name") or addr_obj.get("name") or data.get("name")
    phone = data.get("phone") or addr_obj.get("phone")
    email = data.get("email") or addr_obj.get("email", "")
    vehicle = data.get("vehicle") or data.get("vehicle_info") or "Customer Vehicle"
    service = data.get("service") or data.get("serviceId") or "Standard Mechanic Service"
    address_line = addr_obj.get("address") or (data.get("address") if isinstance(data.get("address"), str) else "") or "Customer Address"
    city = data.get("city") or addr_obj.get("city") or "Local Area"
    pincode = data.get("pincode") or addr_obj.get("pincode") or "000000"
    raw_date = data.get("preferred_date") or data.get("date")
    raw_time = data.get("preferred_time") or data.get("time")

    if not customer_name or not phone or not raw_date or not raw_time:
        return Response(
            {
                "success": False,
                "error": "Required fields are missing: customer_name, phone, preferred_date, and preferred_time are mandatory."
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    preferred_date = parse_preferred_date(raw_date)
    preferred_time = parse_preferred_time(raw_time)

    # Resolve diagnosis
    diagnosis = None
    if diagnosis_id:
        try:
            diagnosis = Diagnosis.objects.get(id=diagnosis_id)
        except (Diagnosis.DoesNotExist, ValueError):
            pass

    if not diagnosis:
        # Fall back to latest diagnosis or create a placeholder diagnosis for the booking
        latest = Diagnosis.objects.order_by("-created_at").first()
        if latest:
            diagnosis = latest
        else:
            conv = Conversation.objects.create(status="diagnosed")
            diagnosis = Diagnosis.objects.create(
                conversation=conv,
                title="Direct Booking Inspection",
                recommended_service=service,
            )

    booking = Booking.objects.create(
        diagnosis=diagnosis,
        customer_name=customer_name,
        phone=phone,
        email=email or "",
        vehicle=vehicle,
        service=service,
        address=address_line,
        city=city,
        pincode=pincode,
        preferred_date=preferred_date,
        preferred_time=preferred_time,
        status="confirmed",
    )

    return Response({
        "success": True,
        "message": "Mechanic booking created successfully.",
        "booking": {
            "id": booking.id,
            "diagnosis_id": diagnosis.id,
            "customer_name": booking.customer_name,
            "phone": booking.phone,
            "email": booking.email,
            "vehicle": booking.vehicle,
            "service": booking.service,
            "address": booking.address,
            "city": booking.city,
            "pincode": booking.pincode,
            "preferred_date": str(booking.preferred_date),
            "preferred_time": str(booking.preferred_time),
            "status": booking.status,
            "created_at": booking.created_at,
        },
    }, status=status.HTTP_201_CREATED)


@api_view(["GET"])
def get_booking(request, booking_id):
    try:
        booking = Booking.objects.get(id=booking_id)
    except Booking.DoesNotExist:
        return Response(
            {
                "success": False,
                "error": "Booking not found."
            },
            status=status.HTTP_404_NOT_FOUND
        )

    return Response({
        "success": True,
        "booking": {
            "id": booking.id,
            "diagnosis_id": booking.diagnosis.id if booking.diagnosis else None,
            "customer_name": booking.customer_name,
            "phone": booking.phone,
            "email": booking.email,
            "vehicle": booking.vehicle,
            "service": booking.service,
            "address": booking.address,
            "city": booking.city,
            "pincode": booking.pincode,
            "preferred_date": str(booking.preferred_date),
            "preferred_time": str(booking.preferred_time),
            "status": booking.status,
            "created_at": booking.created_at,
        }
    }, status=status.HTTP_200_OK)