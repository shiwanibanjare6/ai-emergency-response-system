from django.urls import path
from .views import AnalyzeEmergencyView, SuggestDispatchView, SuggestHospitalView

urlpatterns = [
    path('emergencies/<int:id>/analyze/', AnalyzeEmergencyView.as_view(), name='ai-analyze-emergency'),
    path('emergencies/<int:id>/suggest-dispatch/', SuggestDispatchView.as_view(), name='ai-suggest-dispatch'),
    path('emergencies/<int:id>/suggest-hospital/', SuggestHospitalView.as_view(), name='ai-suggest-hospital'),
]
