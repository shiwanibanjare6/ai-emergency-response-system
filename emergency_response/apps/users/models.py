from django.contrib.auth.models import AbstractUser
from django.db import models


class UserRole(models.TextChoices):
    CITIZEN = 'citizen', 'Citizen'
    DISPATCHER = 'dispatcher', 'Dispatcher'
    RESPONDER = 'responder', 'Responder'
    HOSPITAL = 'hospital', 'Hospital'


class User(AbstractUser):
    role = models.CharField(max_length=20, choices=UserRole.choices)
    phone = models.CharField(max_length=30, blank=True)
