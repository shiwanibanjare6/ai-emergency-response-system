from django.conf import settings
from django.db import models


class EmergencySeverity(models.TextChoices):
    LOW = 'low', 'Low'
    MEDIUM = 'medium', 'Medium'
    CRITICAL = 'critical', 'Critical'


class EmergencyStatus(models.TextChoices):
    REPORTED = 'reported', 'Reported'
    ASSIGNED = 'assigned', 'Assigned'
    ON_THE_WAY = 'on_the_way', 'On the way'
    ARRIVED_AT_SCENE = 'arrived_at_scene', 'Arrived at scene'
    PATIENT_PICKED_UP = 'patient_picked_up', 'Patient picked up'
    AT_HOSPITAL = 'at_hospital', 'At hospital'
    RESOLVED = 'resolved', 'Resolved'
    CANCELLED = 'cancelled', 'Cancelled'


def emergency_image_path(instance, filename: str) -> str:
    return f'emergencies/{instance.id or "new"}/images/{filename}'


def emergency_voice_path(instance, filename: str) -> str:
    return f'emergencies/{instance.id or "new"}/voice/{filename}'


class Emergency(models.Model):
    citizen = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='emergencies',
    )
    description = models.TextField()
    image = models.ImageField(upload_to=emergency_image_path, blank=True, null=True)
    voice_file = models.FileField(upload_to=emergency_voice_path, blank=True, null=True)
    lat = models.FloatField()
    lng = models.FloatField()
    severity = models.CharField(max_length=20, choices=EmergencySeverity.choices, default=EmergencySeverity.LOW)
    status = models.CharField(max_length=30, choices=EmergencyStatus.choices, default=EmergencyStatus.REPORTED)
    responder = models.ForeignKey(
        'responders.Responder',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_emergencies',
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self) -> str:
        return f'Emergency #{self.pk} ({self.severity})'


class EmergencyStatusHistory(models.Model):
    emergency = models.ForeignKey(Emergency, on_delete=models.CASCADE, related_name='status_history')
    status = models.CharField(max_length=30, choices=EmergencyStatus.choices)
    timestamp = models.DateTimeField(auto_now_add=True)
    note = models.TextField(blank=True)

    class Meta:
        ordering = ['timestamp']

    def __str__(self) -> str:
        return f'Emergency #{self.emergency_id}: {self.status}'
