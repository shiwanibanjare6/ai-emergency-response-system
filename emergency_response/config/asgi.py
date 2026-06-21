"""
ASGI config for config project — Django + Socket.IO
"""

import os

import django
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.realtime.socketio_server import sio  # noqa: E402

django_asgi_app = get_asgi_application()

import socketio  # noqa: E402

application = socketio.ASGIApp(sio, django_asgi_app, socketio_path='socket.io')
