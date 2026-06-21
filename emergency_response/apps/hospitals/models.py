from django.db import models


class Hospital(models.Model):
    name = models.CharField(max_length=255)
    lat = models.FloatField()
    lng = models.FloatField()
    total_beds = models.PositiveIntegerField(default=0)
    available_beds = models.PositiveIntegerField(default=0)

    def __str__(self) -> str:
        return self.name


class HospitalPatient(models.Model):
    hospital = models.ForeignKey(Hospital, on_delete=models.CASCADE, related_name='incoming_patients')
    emergency = models.ForeignKey('emergencies.Emergency', on_delete=models.CASCADE, related_name='hospital_notifications')
    eta_minutes = models.PositiveIntegerField(default=0)
    severity = models.CharField(max_length=20)
    arrived = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self) -> str:
        return f'{self.hospital} - Emergency #{self.emergency_id}'
