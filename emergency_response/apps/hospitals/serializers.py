from rest_framework import serializers

from apps.emergencies.serializers import EmergencySerializer

from .models import Hospital, HospitalPatient

class HospitalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hospital
        fields = ('id', 'name', 'lat', 'lng', 'total_beds', 'available_beds')


class HospitalPatientSerializer(serializers.ModelSerializer):
    emergency_details = EmergencySerializer(source='emergency', read_only=True)

    class Meta:
        model = HospitalPatient
        fields = ('id', 'hospital', 'emergency', 'emergency_details', 'eta_minutes', 'severity', 'arrived', 'created_at')


class HospitalNotifySerializer(serializers.Serializer):
    hospital_id = serializers.IntegerField()
    emergency_id = serializers.IntegerField()
    eta_minutes = serializers.IntegerField(min_value=0)
