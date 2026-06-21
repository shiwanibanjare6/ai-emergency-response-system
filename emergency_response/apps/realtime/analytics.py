from django.utils import timezone

from apps.emergencies.models import Emergency, EmergencyStatus
from apps.hospitals.models import Hospital
from apps.responders.models import Responder, ResponderStatus


def build_analytics_snapshot() -> dict:
    active = Emergency.objects.exclude(
        status__in=[EmergencyStatus.RESOLVED, EmergencyStatus.CANCELLED]
    )
    responders = Responder.objects.all()
    hospitals = Hospital.objects.all()

    total_beds = sum(h.total_beds for h in hospitals)
    occupied = sum(h.total_beds - h.available_beds for h in hospitals)
    capacity_pct = round((occupied / total_beds) * 100) if total_beds else 0

    severity_breakdown = {
        'critical': active.filter(severity='critical').count(),
        'medium': active.filter(severity='medium').count(),
        'low': active.filter(severity='low').count(),
    }

    responder_breakdown = {
        'available': responders.filter(status=ResponderStatus.AVAILABLE).count(),
        'busy': responders.filter(status=ResponderStatus.BUSY).count(),
        'offline': responders.filter(status=ResponderStatus.OFFLINE).count(),
    }

    return {
        'active_emergencies': active.count(),
        'critical_incidents': severity_breakdown['critical'],
        'available_responders': responder_breakdown['available'],
        'hospital_capacity_pct': capacity_pct,
        'severity_breakdown': severity_breakdown,
        'responder_breakdown': responder_breakdown,
        'total_hospitals': hospitals.count(),
        'timestamp': timezone.now().isoformat(),
    }
