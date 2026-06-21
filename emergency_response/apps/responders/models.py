from django.conf import settings
from django.db import models


class ResponderType(models.TextChoices):
    AMBULANCE = 'ambulance', 'Ambulance'
    POLICE = 'police', 'Police'
    FIRE = 'fire', 'Fire'


class ResponderStatus(models.TextChoices):
    AVAILABLE = 'available', 'Available'
    BUSY = 'busy', 'Busy'
    OFFLINE = 'offline', 'Offline'


class Responder(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='responder_profile')
    type = models.CharField(max_length=20, choices=ResponderType.choices)
    status = models.CharField(max_length=20, choices=ResponderStatus.choices, default=ResponderStatus.AVAILABLE)
    lat = models.FloatField(default=0.0)
    lng = models.FloatField(default=0.0)

    def __str__(self) -> str:
        return f'Responder #{self.pk} ({self.type})'
