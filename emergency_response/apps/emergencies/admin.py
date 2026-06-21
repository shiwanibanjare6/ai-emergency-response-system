from django.contrib import admin

from .models import Emergency, EmergencyStatusHistory


@admin.register(Emergency)
class EmergencyAdmin(admin.ModelAdmin):
    list_display = ('id', 'citizen', 'severity', 'status', 'responder', 'created_at')
    list_filter = ('severity', 'status', 'created_at')
    search_fields = ('description', 'citizen__username', 'citizen__email')


@admin.register(EmergencyStatusHistory)
class EmergencyStatusHistoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'emergency', 'status', 'timestamp')
    list_filter = ('status', 'timestamp')
