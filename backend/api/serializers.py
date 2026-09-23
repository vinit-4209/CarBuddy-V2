from rest_framework import serializers

from .models import (
    Conversation,
    Message,
    Diagnosis,
    Booking,
)


class MessageSerializer(serializers.ModelSerializer):
    media_url = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = [
            "id",
            "conversation",
            "role",
            "content",
            "media",
            "media_url",
            "media_type",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "created_at",
            "media_url",
        ]

    def get_media_url(self, obj):
        if not obj.media:
            return None

        request = self.context.get("request")

        if request:
            return request.build_absolute_uri(
                obj.media.url
            )

        return obj.media.url


class ConversationSerializer(serializers.ModelSerializer):
    messages = MessageSerializer(
        many=True,
        read_only=True
    )

    class Meta:
        model = Conversation
        fields = [
            "id",
            "vehicle_make",
            "vehicle_model",
            "vehicle_year",
            "status",
            "messages",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "status",
            "messages",
            "created_at",
            "updated_at",
        ]


class DiagnosisSerializer(serializers.ModelSerializer):
    class Meta:
        model = Diagnosis

        fields = [
            "id",
            "conversation",
            "title",
            "confidence",
            "severity",
            "symptoms",
            "possible_causes",
            "recommended_service",
            "safety_notes",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "created_at",
        ]


class BookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking

        fields = [
            "id",
            "diagnosis",
            "customer_name",
            "phone",
            "email",
            "vehicle",
            "service",
            "address",
            "city",
            "pincode",
            "preferred_date",
            "preferred_time",
            "status",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "status",
            "created_at",
        ]