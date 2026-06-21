from django.contrib import admin

from .models import Hospital, HospitalPatient


@admin.register(Hospital)
class HospitalAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'total_beds', 'available_beds', 'lat', 'lng')
    search_fields = ('name',)


@admin.register(HospitalPatient)
class HospitalPatientAdmin(admin.ModelAdmin):
    list_display = ('id', 'hospital', 'emergency', 'eta_minutes', 'severity', 'arrived', 'created_at')
    list_filter = ('severity', 'arrived', 'created_at')
