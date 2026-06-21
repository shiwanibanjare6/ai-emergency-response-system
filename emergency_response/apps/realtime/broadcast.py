from apps.emergencies.models import Emergency
from apps.notifications.models import Notification
from apps.realtime.analytics import build_analytics_snapshot
from apps.realtime.socketio_server import OPERATIONS_ROOM, _emit, _user_room
from apps.responders.models import Responder
from apps.responders.serializers import ResponderSerializer


def _responder_payload(responder: Responder) -> dict:
    return ResponderSerializer(responder).data


def _emergency_payload(emergency: Emergency) -> dict:
    from apps.emergencies.serializers import EmergencySerializer
    return EmergencySerializer(emergency).data


def _notification_payload(notification: Notification) -> dict:
    from apps.notifications.serializers import NotificationSerializer
    return NotificationSerializer(notification).data


def emit_notification(notification: Notification):
    payload = _notification_payload(notification)
    _emit('notification', payload, room=_user_room(notification.user_id))


def emit_responder_update(responder: Responder):
    payload = _responder_payload(responder)
    _emit('responder:update', payload, room=OPERATIONS_ROOM)
    _emit('responder:update', payload, room='responders')


def emit_emergency_update(emergency: Emergency):
    if emergency.responder_id and not getattr(emergency, 'responder', None):
        emergency = Emergency.objects.select_related('responder__user', 'citizen').get(pk=emergency.pk)

    payload = _emergency_payload(emergency)
    _emit('emergency:update', payload, room=OPERATIONS_ROOM)
    _emit('emergency:update', payload, room=_user_room(emergency.citizen_id))
    if emergency.responder_id and emergency.responder:
        _emit('emergency:update', payload, room=_user_room(emergency.responder.user_id))


def emit_analytics_update():
    snapshot = build_analytics_snapshot()
    _emit('analytics:update', snapshot, room=OPERATIONS_ROOM)


def emit_operations_refresh():
    """Broadcast analytics + signal clients to refresh lists."""
    emit_analytics_update()
    _emit('operations:refresh', {'ts': build_analytics_snapshot()['timestamp']}, room=OPERATIONS_ROOM)
