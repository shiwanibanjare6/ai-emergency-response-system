from django.urls import path

from .views import HospitalIncomingView, ListHospitalsView, NotifyHospitalView


urlpatterns = [
    path('incoming/', HospitalIncomingView.as_view(), name='hospital-incoming'),
    path('', ListHospitalsView.as_view(), name='hospital-list'),
    path('notify/', NotifyHospitalView.as_view(), name='hospital-notify'),
]
