from django.db import models


class Conversation(models.Model):
    STATUS_CHOICES = [
        ("active", "Active"),
        ("diagnosed", "Diagnosed"),
        ("closed", "Closed"),
    ]

    vehicle_make = models.CharField(max_length=100, blank=True)
    vehicle_model = models.CharField(max_length=100, blank=True)
    vehicle_year = models.PositiveIntegerField(null=True, blank=True)

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="active"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        vehicle = f"{self.vehicle_make} {self.vehicle_model}".strip()

        if vehicle:
            return f"Conversation #{self.id} - {vehicle}"

        return f"Conversation #{self.id}"


class Message(models.Model):
    ROLE_CHOICES = [
        ("user", "User"),
        ("assistant", "Assistant"),
    ]

    MEDIA_CHOICES = [
        ("text", "Text"),
        ("image", "Image"),
        ("audio", "Audio"),
        ("video", "Video"),
    ]

    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name="messages"
    )

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES
    )

    content = models.TextField(blank=True)

    media = models.FileField(
        upload_to="conversations/%Y/%m/%d/",
        null=True,
        blank=True
    )

    media_type = models.CharField(
        max_length=20,
        choices=MEDIA_CHOICES,
        default="text"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"{self.role} - Conversation #{self.conversation_id}"


class Diagnosis(models.Model):
    SEVERITY_CHOICES = [
        ("low", "Low"),
        ("medium", "Medium"),
        ("high", "High"),
        ("critical", "Critical"),
    ]

    conversation = models.OneToOneField(
        Conversation,
        on_delete=models.CASCADE,
        related_name="diagnosis"
    )

    title = models.CharField(max_length=255)

    confidence = models.FloatField(
        null=True,
        blank=True
    )

    severity = models.CharField(
        max_length=20,
        choices=SEVERITY_CHOICES,
        default="medium"
    )

    symptoms = models.JSONField(
        default=list,
        blank=True
    )

    possible_causes = models.JSONField(
        default=list,
        blank=True
    )

    recommended_service = models.CharField(
        max_length=255
    )

    safety_notes = models.TextField(
        blank=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"{self.title} - Conversation #{self.conversation_id}"


class Booking(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("confirmed", "Confirmed"),
        ("completed", "Completed"),
        ("cancelled", "Cancelled"),
    ]

    diagnosis = models.ForeignKey(
        Diagnosis,
        on_delete=models.CASCADE,
        related_name="bookings"
    )

    customer_name = models.CharField(
        max_length=150
    )

    phone = models.CharField(
        max_length=20
    )

    email = models.EmailField(
        blank=True
    )

    vehicle = models.CharField(
        max_length=255
    )

    service = models.CharField(
        max_length=255
    )

    address = models.TextField(
        blank=True
    )

    city = models.CharField(
        max_length=100,
        blank=True
    )

    pincode = models.CharField(
        max_length=10,
        blank=True
    )

    preferred_date = models.DateField()

    preferred_time = models.TimeField()

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="confirmed"
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"Booking #{self.id} - {self.customer_name}"