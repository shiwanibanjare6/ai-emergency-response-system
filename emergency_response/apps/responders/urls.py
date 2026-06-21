from django.urls import path

from .views import ListRespondersView, ResponderMeView, UpdateResponderLocationView


urlpatterns = [
    path('me/', ResponderMeView.as_view(), name='responder-me'),
    path('', ListRespondersView.as_view(), name='responder-list'),
    path('<int:id>/location/', UpdateResponderLocationView.as_view(), name='responder-location'),
]
