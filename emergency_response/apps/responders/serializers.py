from rest_framework import serializers

from .models import Responder


class ResponderSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Responder
        fields = ('id', 'user', 'username', 'type', 'status', 'lat', 'lng')


class ResponderLocationUpdateSerializer(serializers.Serializer):
    lat = serializers.FloatField()
    lng = serializers.FloatField()
