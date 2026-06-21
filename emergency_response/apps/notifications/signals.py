from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from apps.emergencies.models import Emergency, EmergencyStatusHistory
from apps.hospitals.models import HospitalPatient
from .models import Notification

User = get_user_model()


@receiver(post_save, sender=Emergency)
def handle_emergency_creation_and_updates(sender, instance, created, **kwargs):
    if created:
        # Notify all dispatchers that a new emergency is reported
        dispatchers = User.objects.filter(role='dispatcher')
        for dispatcher in dispatchers:
            Notification.objects.create(
                user=dispatcher,
                message=f"New emergency #{instance.id} reported by citizen {instance.citizen.username}.",
                emergency=instance
            )
    else:
        update_fields = kwargs.get('update_fields')
        if update_fields is not None and set(update_fields) <= {'severity'}:
            return

        # Check the latest status history to see the action log message
        try:
            latest_history = instance.status_history.order_by('-timestamp').first()
            if latest_history:
                msg = f"Emergency #{instance.id} status is now '{instance.status}'. Details: {latest_history.note}"
                
                # Notify citizen
                Notification.objects.create(
                    user=instance.citizen,
                    message=msg,
                    emergency=instance
                )
                
                # Notify responder if assigned
                if instance.responder and instance.responder.user:
                    Notification.objects.create(
                        user=instance.responder.user,
                        message=msg,
                        emergency=instance
                    )
                    
                # Notify dispatchers
                dispatchers = User.objects.filter(role='dispatcher')
                for dispatcher in dispatchers:
                    Notification.objects.create(
                        user=dispatcher,
                        message=msg,
                        emergency=instance
                    )
        except Exception:
            pass


@receiver(post_save, sender=HospitalPatient)
def handle_hospital_patient_notification(sender, instance, created, **kwargs):
    if created:
        # Notify all hospital role users
        hospital_users = User.objects.filter(role='hospital')
        for user in hospital_users:
            Notification.objects.create(
                user=user,
                message=f"Incoming patient alert: Emergency #{instance.emergency_id} redirected to your facility. ETA: {instance.eta_minutes} mins. Severity: {instance.severity}.",
                emergency=instance.emergency
            )
