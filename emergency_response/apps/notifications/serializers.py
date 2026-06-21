from rest_framework import serializers
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ('id', 'user', 'message', 'is_read', 'emergency', 'created_at')
        read_only_fields = ('id', 'user', 'message', 'emergency', 'created_at')
