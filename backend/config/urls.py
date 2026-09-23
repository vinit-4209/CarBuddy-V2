from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse


def root_view(request):
    return JsonResponse({
        "status": "online",
        "app": "CarBuddy V2 Backend API",
        "version": "2.0",
        "health": "/api/health/",
        "endpoints": {
            "chat": "/api/chat/",
            "upload": "/api/upload/",
            "diagnosis": "/api/diagnosis/",
            "booking": "/api/booking/",
            "admin": "/admin/"
        }
    })


urlpatterns = [
    path("", root_view, name="root"),
    path("admin/", admin.site.urls),
    path("api/", include("api.urls")),
]

if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT
    )