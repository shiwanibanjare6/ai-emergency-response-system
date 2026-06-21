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
        emergency.severity = analysis['severity']
        emergency.save(update_fields=['severity'])
        
        # Log in history
        note = f"AI Analysis: Severity -> {analysis['severity']}. Recommended Unit -> {analysis['responder_type']}. Explanation: {analysis['explanation']}"
        if analysis.get('transcribed_text'):
            note += f" Transcription: {analysis['transcribed_text']}"
            
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
        analysis = analyze_emergency_report(emergency.description)
        rec_type = analysis['responder_type']
        
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
