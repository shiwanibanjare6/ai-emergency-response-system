import logging

import socketio
from asgiref.sync import async_to_sync, sync_to_async
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.tokens import AccessToken

logger = logging.getLogger(__name__)
User = get_user_model()

_cors = getattr(settings, 'CORS_ALLOWED_ORIGINS', ['http://localhost:3000', 'http://127.0.0.1:3000'])
if getattr(settings, 'CORS_ALLOW_ALL_ORIGINS', False):
    _cors = '*'

sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins=_cors,
    logger=False,
    engineio_logger=False,
)

OPERATIONS_ROOM = 'operations'


def _user_room(user_id: int) -> str:
    return f'user_{user_id}'


def _authenticate_token(token: str | None) -> int | None:
    if not token:
        return None
    try:
        access = AccessToken(token)
        return int(access['user_id'])
    except (InvalidToken, TokenError, KeyError, ValueError) as exc:
        logger.debug('Socket auth failed: %s', exc)
        return None


@sync_to_async
def _load_user(user_id: int):
    return User.objects.get(pk=user_id)


@sio.event
async def connect(sid, environ, auth):
    user_id = _authenticate_token((auth or {}).get('token'))
    if not user_id:
        return False

    try:
        user = await _load_user(user_id)
    except User.DoesNotExist:
        return False

    session = {'user_id': user.id, 'role': user.role, 'is_staff': user.is_staff}
    await sio.save_session(sid, session)
    await sio.enter_room(sid, _user_room(user.id))

    if user.role == 'dispatcher' or user.is_staff:
        await sio.enter_room(sid, OPERATIONS_ROOM)

    if user.role == 'responder':
        await sio.enter_room(sid, 'responders')

    if user.role == 'hospital':
        await sio.enter_room(sid, 'hospitals')

    logger.info('Socket connected sid=%s user=%s role=%s', sid, user.id, user.role)
    return True


@sio.event
async def disconnect(sid):
    logger.info('Socket disconnected sid=%s', sid)


def _emit(event: str, payload: dict, room: str | None = None):
    try:
        async_to_sync(sio.emit)(event, payload, room=room)
    except Exception as exc:
        logger.warning('Socket emit failed (%s): %s', event, exc)
