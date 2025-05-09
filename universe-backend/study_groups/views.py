# study_groups/views.py
from django.db import models
from rest_framework import viewsets, permissions
from .models import StudyGroup, GroupMembership, GroupMessage
from .serializers import StudyGroupSerializer, GroupMembershipSerializer, GroupMessageSerializer
from rest_framework.decorators import action


class StudyGroupViewSet(viewsets.ModelViewSet):

    @action(detail=False, methods=['get'], url_path='suggested')
    def suggested_groups(self, request):
        user_profile = request.user.profile  # Assumes a related `UserProfile` model
        if not user_profile.interests:
            return Response([], status=200)

        user_interests = [i.strip().lower() for i in user_profile.interests.split(',') if i.strip()]
        
        matching_groups = StudyGroup.objects.filter(
            subject_tags__overlap=user_interests
        ).exclude(creator=request.user)

        serializer = self.get_serializer(matching_groups, many=True)
        return Response(serializer.data)
    
    queryset = StudyGroup.objects.all()
    serializer_class = StudyGroupSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        group = serializer.save(creator=self.request.user)

        # ✅ Creator is auto-member
        GroupMembership.objects.create(
            group=group,
            user=self.request.user,
            is_accepted=True
        )
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.creator != request.user:
            return Response({"detail": "Only the group creator can delete this group."}, status=403)
        return super().destroy(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.creator != request.user:
            return Response({"detail": "Only the group creator can edit this group."}, status=403)
        return super().update(request, *args, **kwargs)

class GroupMessageViewSet(viewsets.ModelViewSet):
    queryset = GroupMessage.objects.all()
    serializer_class = GroupMessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        group_id = self.request.query_params.get('group')
        user = self.request.user

        if not group_id:
            return GroupMessage.objects.none()

        # Only allow if the user is accepted
        is_member = GroupMembership.objects.filter(
            group_id=group_id, user=user, is_accepted=True
        ).exists()

        if not is_member:
            return GroupMessage.objects.none()

        return GroupMessage.objects.filter(group_id=group_id).order_by('timestamp')
    def perform_create(self, serializer):
        group_id = self.request.data.get('group')
        serializer.save(sender=self.request.user, group_id=group_id)

class GroupMembershipViewSet(viewsets.ModelViewSet):
    queryset = GroupMembership.objects.all()
    serializer_class = GroupMembershipSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return GroupMembership.objects.filter(
            models.Q(user=user) | models.Q(group__creator=user)
        )

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.group.creator != request.user:
            return Response({"detail": "Only the group creator can accept requests."},
                            status=status.HTTP_403_FORBIDDEN)

        return super().partial_update(request, *args, **kwargs)
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()

        # ✅ Only creator can remove others
        if instance.group.creator != request.user:
            return Response({"detail": "Only the group creator can remove or reject members."}, status=403)

        return super().destroy(request, *args, **kwargs)