from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from apps.emergencies.models import Emergency, EmergencyStatusHistory
from apps.emergencies.serializers import EmergencySerializer
from apps.responders.models import Responder, ResponderStatus
from apps.responders.serializers import ResponderSerializer
from apps.hospitals.models import Hospital
from apps.hospitals.serializers import HospitalSerializer
from apps.users.permissions import IsDispatcher

from .services import analyze_emergency_report, calculate_distance


class AnalyzeEmergencyView(APIView):
    permission_classes = [IsAuthenticated, IsDispatcher]

    def post(self, request, id: int):
        emergency = get_object_or_404(Emergency, pk=id)
        
        image_path = emergency.image.path if emergency.image else None
        voice_path = emergency.voice_file.path if emergency.voice_file else None
        
        analysis = analyze_emergency_report(
            description=emergency.description,
            image_path=image_path,
            voice_path=voice_path
        )
        
        # Save severity
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
        
        # Log in history
        note = (
            f"AI Analysis | "
            f"Severity: {analysis['severity']} "
            f"(Score: {analysis['severity_score']}, "
            f"Confidence: {analysis['confidence']}%, "
            f"Priority: {analysis['priority']}) | "
            f"Recommended Unit: {analysis['responder_type']} | "
            f"Recommended Hospital: {analysis['recommended_hospital_type']} | "
            f"Estimated Response: {analysis['estimated_response_minutes']} min | "
            f"Explanation: {analysis['explanation']}"
        )

        if analysis.get("possible_conditions"):
            note += (
                f" | Possible Conditions: "
                f"{', '.join(analysis['possible_conditions'])}"
            )

        if analysis.get("required_units"):
            note += (
                f" | Required Units: "
                f"{', '.join(analysis['required_units'])}"
            )

        if analysis.get("transcribed_text"):
            note += (
                f" | Transcription: "
                f"{analysis['transcribed_text']}"
            )
                    
        EmergencyStatusHistory.objects.create(
            emergency=emergency,
            status=emergency.status,
            note=note
        )
        
        return Response({
            'emergency': EmergencySerializer(emergency, context={'request': request}).data,
            'ai_result': analysis
        })


class SuggestDispatchView(APIView):
    permission_classes = [IsAuthenticated, IsDispatcher]

    def get(self, request, id: int):
        emergency = get_object_or_404(Emergency, pk=id)
        
        # Re-analyze description to get recommended unit
        rec_type = emergency.recommended_responder_type
        
        available_responders = Responder.objects.filter(status=ResponderStatus.AVAILABLE).select_related('user')
        
        recommendations = []
        for responder in available_responders:
            dist = calculate_distance(emergency.lat, emergency.lng, responder.lat, responder.lng)
            recommendations.append({
                'responder': ResponderSerializer(responder).data,
                'distance_km': round(dist, 2),
                'is_recommended_type': responder.type == rec_type
            })
            
        # Sort by: 1. matching recommended unit type, 2. distance
        recommendations.sort(key=lambda x: (not x['is_recommended_type'], x['distance_km']))
        
        return Response({
            'recommended_type': rec_type,
            'recommendations': recommendations
        })


class SuggestHospitalView(APIView):
    permission_classes = [IsAuthenticated, IsDispatcher]

    def get(self, request, id: int):
        emergency = get_object_or_404(Emergency, pk=id)
        
        hospitals = Hospital.objects.filter(available_beds__gt=0)
        
        recommendations = []
        for hospital in hospitals:
            dist = calculate_distance(emergency.lat, emergency.lng, hospital.lat, hospital.lng)
            # ETA calculation assuming average 40 km/h response/travel speed
            eta = (dist / 40.0) * 60
            recommendations.append({
                'hospital': HospitalSerializer(hospital).data,
                'distance_km': round(dist, 2),
                'eta_minutes': max(1, int(round(eta)))
            })
            
        recommendations.sort(key=lambda x: x['distance_km'])
        
        return Response({
            'recommendations': recommendations
        })
