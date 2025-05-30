"""
ASGI config for universe_backend project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/howto/deployment/asgi/
"""

import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
import roommate_matching.routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'universe_backend.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            roommate_matching.routing.websocket_urlpatterns +
            study_groups.routing.websocket_urlpatterns 
        )
    ),
})
