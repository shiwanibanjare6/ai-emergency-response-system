from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.users.permissions import IsDispatcher

from .analytics import build_analytics_snapshot


class AnalyticsSnapshotView(APIView):
    permission_classes = [IsAuthenticated, IsDispatcher]

    def get(self, request):
        return Response(build_analytics_snapshot())
