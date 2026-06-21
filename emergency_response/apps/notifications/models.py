from django.db import models
from django.conf import settings


class Notification(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications',
    )
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    emergency = models.ForeignKey(
        'emergencies.Emergency',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='notifications',
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self) -> str:
        return f"Notification for {self.user.username}: {self.message[:30]}"
