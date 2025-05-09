# study_groups/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StudyGroupViewSet, GroupMembershipViewSet, GroupMessageViewSet

router = DefaultRouter()
router.register('groups', StudyGroupViewSet)
router.register('memberships', GroupMembershipViewSet)
router.register('messages', GroupMessageViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
