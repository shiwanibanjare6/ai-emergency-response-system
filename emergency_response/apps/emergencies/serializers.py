from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Emergency, EmergencyStatus, EmergencyStatusHistory


User = get_user_model()


class EmergencyStatusHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = EmergencyStatusHistory
        fields = ('id', 'status', 'timestamp', 'note')


class EmergencySerializer(serializers.ModelSerializer):
    citizen = serializers.PrimaryKeyRelatedField(read_only=True)
    citizen_name = serializers.CharField(source='citizen.username', read_only=True)
    responder = serializers.PrimaryKeyRelatedField(read_only=True)
    status_history = EmergencyStatusHistorySerializer(many=True, read_only=True)
    image = serializers.SerializerMethodField()
    voice_file = serializers.SerializerMethodField()

    class Meta:
        model = Emergency
        fields = (
            'id',
            'citizen',
            'citizen_name',
            'description',
            'image',
            'voice_file',
            'lat',
            'lng',
            'severity',
            "severity",
            "severity_score",
            "confidence",
            "priority",
            "recommended_responder_type",
            "possible_conditions",
            "required_units",
            "recommended_hospital_type",
            "estimated_response_minutes",
            'status',
            'responder',
            'created_at',
            'status_history',
        )

    def _build_media_url(self, file_field):
        if not file_field:
            return None
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(file_field.url)
        return file_field.url

    def get_image(self, obj):
        return self._build_media_url(obj.image)

    def get_voice_file(self, obj):
        return self._build_media_url(obj.voice_file)


class EmergencyReportSerializer(serializers.ModelSerializer):
    citizen = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Emergency
        fields = ('id', 'citizen', 'description', 'image', 'voice_file', 'lat', 'lng', 'severity', 'status', 'created_at')
        read_only_fields = ('severity', 'status', 'created_at')

    def create(self, validated_data):
        request = self.context['request']
        emergency = Emergency.objects.create(citizen=request.user, **validated_data)
        
        # Run AI analysis automatically on report creation
        from apps.ai_engine.services import analyze_emergency_report
        
        image_path = emergency.image.path if emergency.image else None
        voice_path = emergency.voice_file.path if emergency.voice_file else None
        
        try:
            analysis = analyze_emergency_report(
            description=emergency.description,
            image_path=image_path,
            voice_path=voice_path,
            )

            emergency.severity = analysis["severity"]
            emergency.severity_score = analysis["severity_score"]
            emergency.confidence = analysis["confidence"]
            emergency.priority = analysis["priority"]
            emergency.recommended_responder_type = analysis["responder_type"]
            emergency.possible_conditions = analysis["possible_conditions"]
            emergency.required_units = analysis["required_units"]
            emergency.recommended_hospital_type = analysis["recommended_hospital_type"]
            emergency.estimated_response_minutes = analysis["estimated_response_minutes"]

            emergency.save(
                update_fields=[
                    "severity",
                    "severity_score",
                    "confidence",
                    "priority",
                    "recommended_responder_type",
                    "possible_conditions",
                    "required_units",
                    "recommended_hospital_type",
                    "estimated_response_minutes",
                ]
            )
            
            note = (
                f"Reported (Auto-analyzed by AI). "
                f"Severity: {analysis['severity']} "
                f"(Score: {analysis['severity_score']}, "
                f"Confidence: {analysis['confidence']}%, "
                f"Priority: {analysis['priority']}). "
                f"Recommended Unit: {analysis['responder_type']}. "
                f"Hospital: {analysis['recommended_hospital_type']}. "
                f"ETA: {analysis['estimated_response_minutes']} min."
            )

            if analysis.get("possible_conditions"):
                note += (
                    f" Possible Conditions: "
                    f"{', '.join(analysis['possible_conditions'])}."
                )

            if analysis.get("transcribed_text"):
                note += f" Transcription: {analysis['transcribed_text']}"
        except Exception:
            note = 'Reported (AI auto-analysis failed, default severity set).'
            
        EmergencyStatusHistory.objects.create(emergency=emergency, status=emergency.status, note=note)

        from apps.realtime.broadcast import emit_emergency_update, emit_operations_refresh
        emergency.refresh_from_db()
        emit_emergency_update(emergency)
        emit_operations_refresh()

        return emergency


class EmergencyAssignSerializer(serializers.Serializer):
    responder_id = serializers.IntegerField()


class EmergencyStatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=EmergencyStatus.choices)
    note = serializers.CharField(required=False, allow_blank=True, default='')
