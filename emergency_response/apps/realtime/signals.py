from django.db.models.signals import post_save
from django.dispatch import receiver

from apps.notifications.models import Notification

from .broadcast import emit_notification


@receiver(post_save, sender=Notification)
def broadcast_notification_created(sender, instance, created, **kwargs):
    if created:
        emit_notification(instance)
        from apps.realtime.broadcast import emit_operations_refresh
        emit_operations_refresh()
