from django.contrib import admin

from .models import (
    Conversation,
    Message,
    Diagnosis,
    Booking,
)


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "vehicle_make",
        "vehicle_model",
        "status",
        "created_at",
    )

    list_filter = (
        "status",
        "created_at",
    )

    search_fields = (
        "vehicle_make",
        "vehicle_model",
    )


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "conversation",
        "role",
        "media_type",
        "created_at",
    )

    list_filter = (
        "role",
        "media_type",
    )


@admin.register(Diagnosis)
class DiagnosisAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "conversation",
        "title",
        "severity",
        "confidence",
        "created_at",
    )

    list_filter = (
        "severity",
    )

    search_fields = (
        "title",
        "recommended_service",
    )


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "customer_name",
        "vehicle",
        "service",
        "preferred_date",
        "preferred_time",
        "status",
    )

    list_filter = (
        "status",
        "preferred_date",
    )

    search_fields = (
        "customer_name",
        "phone",
        "vehicle",
    )