# study_groups/routing.py
from django.urls import re_path
from study_groups.consumers import StudyGroupConsumer

websocket_urlpatterns = [
    re_path(r'ws/study-group/(?P<group_id>\d+)/$', StudyGroupConsumer.as_asgi()),
]
