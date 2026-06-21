from django.urls import path
from .views import ListNotificationsView, MarkNotificationReadView

urlpatterns = [
    path('', ListNotificationsView.as_view(), name='notification-list'),
    path('<int:pk>/read/', MarkNotificationReadView.as_view(), name='notification-read'),
]
