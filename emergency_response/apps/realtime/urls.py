from django.urls import path

from .views import AnalyticsSnapshotView

urlpatterns = [
    path('snapshot/', AnalyticsSnapshotView.as_view(), name='analytics-snapshot'),
]
