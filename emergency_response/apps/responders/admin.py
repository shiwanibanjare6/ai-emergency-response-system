from django.contrib import admin

from .models import Responder


@admin.register(Responder)
class ResponderAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'type', 'status', 'lat', 'lng')
    list_filter = ('type', 'status')
    search_fields = ('user__username', 'user__email')
