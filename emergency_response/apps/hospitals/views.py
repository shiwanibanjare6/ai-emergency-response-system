from rest_framework import generics
from rest_framework.response import Response

from apps.emergencies.models import Emergency
from apps.users.permissions import IsDispatcher, IsHospital

from .models import Hospital, HospitalPatient
from .serializers import HospitalNotifySerializer, HospitalPatientSerializer, HospitalSerializer


class ListHospitalsView(generics.ListAPIView):
    serializer_class = HospitalSerializer
    permission_classes = [IsDispatcher | IsHospital]
    queryset = Hospital.objects.all()


class HospitalIncomingView(generics.ListAPIView):
    serializer_class = HospitalPatientSerializer
    permission_classes = [IsHospital]
    queryset = HospitalPatient.objects.select_related('hospital', 'emergency').filter(arrived=False)


class NotifyHospitalView(generics.GenericAPIView):
    serializer_class = HospitalNotifySerializer
    permission_classes = [IsDispatcher]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        hospital = generics.get_object_or_404(Hospital, pk=serializer.validated_data['hospital_id'])
        emergency = generics.get_object_or_404(Emergency, pk=serializer.validated_data['emergency_id'])

        patient = HospitalPatient.objects.create(
            hospital=hospital,
            emergency=emergency,
            eta_minutes=serializer.validated_data['eta_minutes'],
            severity=emergency.severity,
            arrived=False,
        )

        from apps.realtime.broadcast import emit_operations_refresh
        emit_operations_refresh()

        return Response(HospitalPatientSerializer(patient, context={'request': request}).data)

