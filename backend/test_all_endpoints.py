import os
import sys
sys.stdout.reconfigure(encoding="utf-8")
import django
from io import BytesIO

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from rest_framework.test import APIRequestFactory
from django.core.files.uploadedfile import SimpleUploadedFile
from api.views import health_check, chat, upload_media, diagnosis_view, create_booking, get_booking

factory = APIRequestFactory()

def test_suite():
    print("=== 1. Health Check ===")
    req = factory.get("/api/health/")
    res = health_check(req)
    print("Health Status:", res.status_code, res.data)
    assert res.status_code == 200

    print("\n=== 2. Chat - Greeting (Traditional Logic) ===")
    req = factory.post("/api/chat/", {"message": "Hi, good morning!"}, format="json")
    res = chat(req)
    print("Greeting Status:", res.status_code, res.data.get("assistant_message"))
    assert res.status_code == 200
    assert res.data["is_automotive"] is True
    assert res.data["needs_followup"] is True
    conv_id = res.data["conversation_id"]

    print("\n=== 3. Chat - Irrelevant Query (Polite Rejection) ===")
    req = factory.post("/api/chat/", {"message": "What is the capital of France?"}, format="json")
    res = chat(req)
    print("Rejection Status:", res.status_code, res.data.get("assistant_message"))
    assert res.status_code == 200
    assert res.data["is_automotive"] is False

    print("\n=== 4. Chat - Automotive Query (Follow-up) ===")
    req = factory.post("/api/chat/", {
        "message": "My 2018 Honda Civic engine is overheating when idling in traffic",
        "conversation_id": conv_id
    }, format="json")
    res = chat(req)
    print("Automotive Query Status:", res.status_code)
    print("Assistant Reply:", res.data.get("assistant_message", {}).get("content"))
    assert res.status_code == 200

    print("\n=== 5. Media Upload ===")
    dummy_file = SimpleUploadedFile("engine_photo.jpg", b"fake image bytes", content_type="image/jpeg")
    req = factory.post("/api/upload/", {"file": dummy_file, "conversation_id": conv_id}, format="multipart")
    res = upload_media(req)
    print("Upload Status:", res.status_code, res.data)
    assert res.status_code == 201

    print("\n=== 6. Diagnosis View ===")
    req = factory.post("/api/diagnosis/", {"conversation_id": conv_id}, format="json")
    res = diagnosis_view(req)
    print("Diagnosis Status:", res.status_code, res.data)
    assert res.status_code == 200
    diagnosis_id = res.data["diagnosis"]["id"]

    print("\n=== 7. Create Booking ===")
    booking_payload = {
        "diagnosis_id": diagnosis_id,
        "customer_name": "John Doe",
        "phone": "+91 9876543210",
        "email": "john@example.com",
        "vehicle": "2018 Honda Civic",
        "service": "Cooling System Service",
        "address": "123 Main St",
        "city": "Mumbai",
        "pincode": "400001",
        "preferred_date": "2026-09-25",
        "preferred_time": "10:00:00"
    }
    req = factory.post("/api/booking/", booking_payload, format="json")
    res = create_booking(req)
    print("Create Booking Status:", res.status_code, res.data)
    assert res.status_code == 201
    booking_id = res.data["booking"]["id"]

    print("\n=== 8. Get Booking ===")
    req = factory.get(f"/api/booking/{booking_id}/")
    res = get_booking(req, booking_id)
    print("Get Booking Status:", res.status_code, res.data)
    assert res.status_code == 200

    print("\nALL 8 TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    test_suite()
