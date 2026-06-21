from rest_framework import generics, status
from rest_framework.response import Response

from apps.users.permissions import IsDispatcher, IsResponder

from .models import Responder
from .serializers import ResponderLocationUpdateSerializer, ResponderSerializer


class ListRespondersView(generics.ListAPIView):
    serializer_class = ResponderSerializer
    permission_classes = [IsDispatcher]
    queryset = Responder.objects.select_related('user')


class ResponderMeView(generics.RetrieveAPIView):
    serializer_class = ResponderSerializer
    permission_classes = [IsResponder]

    def get_object(self):
        return generics.get_object_or_404(Responder, user=self.request.user)


class UpdateResponderLocationView(generics.GenericAPIView):
    serializer_class = ResponderLocationUpdateSerializer
    permission_classes = [IsResponder]

    def patch(self, request, id: int):
        responder = generics.get_object_or_404(Responder, pk=id)
        if responder.user_id != request.user.id:
            return Response({'detail': 'Not your responder profile.'}, status=status.HTTP_403_FORBIDDEN)
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        responder.lat = serializer.validated_data['lat']
        responder.lng = serializer.validated_data['lng']
        responder.save(update_fields=['lat', 'lng'])

        from apps.realtime.broadcast import emit_responder_update
        emit_responder_update(responder)

        return Response(ResponderSerializer(responder, context={'request': request}).data)

