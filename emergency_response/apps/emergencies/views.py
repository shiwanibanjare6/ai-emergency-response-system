from django.db import transaction
from rest_framework import generics, status
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.responders.models import Responder, ResponderStatus
from apps.users.permissions import IsCitizen, IsDispatcher, IsHospital, IsResponder

from .models import Emergency, EmergencyStatus, EmergencyStatusHistory
from .serializers import (
    EmergencyAssignSerializer,
    EmergencyReportSerializer,
    EmergencySerializer,
    EmergencyStatusUpdateSerializer,
)


class ReportEmergencyView(generics.CreateAPIView):
    serializer_class = EmergencyReportSerializer
    permission_classes = [IsCitizen]
    parser_classes = [MultiPartParser, FormParser]


class ListEmergenciesView(generics.ListAPIView):
    serializer_class = EmergencySerializer
    permission_classes = [IsDispatcher]
    queryset = Emergency.objects.select_related('citizen', 'responder').prefetch_related('status_history')


class MyEmergenciesView(generics.ListAPIView):
    serializer_class = EmergencySerializer
    permission_classes = [IsCitizen]

    def get_queryset(self):
        return Emergency.objects.filter(citizen=self.request.user).select_related(
            'citizen', 'responder'
        ).prefetch_related('status_history')


class ResponderAssignedEmergenciesView(generics.ListAPIView):
    serializer_class = EmergencySerializer
    permission_classes = [IsResponder]

    def get_queryset(self):
        return Emergency.objects.filter(
            responder__user=self.request.user,
        ).exclude(status__in=[EmergencyStatus.RESOLVED, EmergencyStatus.CANCELLED]).select_related(
            'citizen', 'responder'
        ).prefetch_related('status_history')


class EmergencyDetailView(generics.RetrieveAPIView):
    serializer_class = EmergencySerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'
    queryset = Emergency.objects.select_related('citizen', 'responder').prefetch_related('status_history')

    def get_object(self):
        emergency = super().get_object()
        user = self.request.user
        role = getattr(user, 'role', None)
        if role == 'dispatcher' or user.is_staff:
            return emergency
        if role == 'citizen' and emergency.citizen_id == user.id:
            return emergency
        if role == 'responder' and emergency.responder and emergency.responder.user_id == user.id:
            return emergency
        if role == 'hospital':
            return emergency
        from rest_framework.exceptions import PermissionDenied
        raise PermissionDenied('You do not have access to this emergency.')


class AssignEmergencyView(generics.GenericAPIView):
    serializer_class = EmergencyAssignSerializer
    permission_classes = [IsDispatcher]

    @transaction.atomic
    def patch(self, request, id: int):
        emergency = generics.get_object_or_404(Emergency, pk=id)
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        responder = generics.get_object_or_404(Responder, pk=serializer.validated_data['responder_id'])

        if responder.status != ResponderStatus.AVAILABLE:
            return Response({'detail': 'Responder is not available.'}, status=status.HTTP_400_BAD_REQUEST)

        emergency.responder = responder
        emergency.status = EmergencyStatus.ASSIGNED
        emergency.save(update_fields=['responder', 'status'])

        responder.status = ResponderStatus.BUSY
        responder.save(update_fields=['status'])

        EmergencyStatusHistory.objects.create(emergency=emergency, status=emergency.status, note='Assigned responder')

        from apps.realtime.broadcast import emit_emergency_update, emit_operations_refresh, emit_responder_update
        emit_responder_update(responder)
        emit_emergency_update(emergency)
        emit_operations_refresh()

        return Response(EmergencySerializer(emergency, context={'request': request}).data)


class UpdateEmergencyStatusView(generics.GenericAPIView):
    serializer_class = EmergencyStatusUpdateSerializer
    permission_classes = [IsDispatcher | IsResponder]

    @transaction.atomic
    def patch(self, request, id: int):
        emergency = generics.get_object_or_404(Emergency, pk=id)

        if getattr(request.user, 'role', None) == 'responder':
            if not emergency.responder or emergency.responder.user_id != request.user.id:
                return Response({'detail': 'Not your assigned emergency.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        new_status = serializer.validated_data['status']
        note = serializer.validated_data.get('note', '')

        emergency.status = new_status
        emergency.save(update_fields=['status'])
        EmergencyStatusHistory.objects.create(emergency=emergency, status=new_status, note=note)

        if new_status in (EmergencyStatus.RESOLVED, EmergencyStatus.CANCELLED) and emergency.responder:
            responder = emergency.responder
            responder.status = ResponderStatus.AVAILABLE
            responder.save(update_fields=['status'])

        from apps.realtime.broadcast import emit_emergency_update, emit_operations_refresh
        emergency.refresh_from_db()
        emit_emergency_update(emergency)
        emit_operations_refresh()

        return Response(EmergencySerializer(emergency, context={'request': request}).data)
