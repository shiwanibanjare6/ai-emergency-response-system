from django.urls import path

from .views import (
    AssignEmergencyView,
    EmergencyDetailView,
    ListEmergenciesView,
    MyEmergenciesView,
    ReportEmergencyView,
    ResponderAssignedEmergenciesView,
    UpdateEmergencyStatusView,
)


urlpatterns = [
    path('report/', ReportEmergencyView.as_view(), name='emergency-report'),
    path('mine/', MyEmergenciesView.as_view(), name='emergency-mine'),
    path('assigned/', ResponderAssignedEmergenciesView.as_view(), name='emergency-assigned'),
    path('', ListEmergenciesView.as_view(), name='emergency-list'),
    path('<int:id>/', EmergencyDetailView.as_view(), name='emergency-detail'),
    path('<int:id>/assign/', AssignEmergencyView.as_view(), name='emergency-assign'),
    path('<int:id>/status/', UpdateEmergencyStatusView.as_view(), name='emergency-status'),
]
