from django.urls import path
from .views import health_check, chat, diagnosis_view

from .views import (
    health_check,
    chat,
    diagnosis_view,
    upload_media,
    create_booking,
    get_booking,
)


urlpatterns = [
    path(
        "health/",
        health_check,
        name="health"
    ),

    path(
        "chat/",
        chat,
        name="chat"
    ),
    path("diagnosis/", diagnosis_view),
    path("upload/", upload_media),
    path("booking/", create_booking),
    path("booking/<int:booking_id>/", get_booking),
]