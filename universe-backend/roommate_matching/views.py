from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Q
from django.utils import timezone
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User

from .models import MatchRequest, CompatibilityScore, Message
from .serializers import (
    MatchRequestSerializer,
    CompatibilityScoreSerializer,
    MatchProfileSerializer,
    MessageSerializer
)
from user_profiles.models import UserProfile, RoommateProfile
from user_profiles.serializers import UserSerializer, UserProfileSerializer, RoommateProfileSerializer

# Logging (optional)
import logging
logger = logging.getLogger(__name__)


class MatchRequestViewSet(viewsets.ModelViewSet):
    queryset = MatchRequest.objects.all()
    serializer_class = MatchRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return MatchRequest.objects.filter(
            Q(sender=user) | Q(receiver=user)
        ).order_by('-created_at')

    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        match_request = self.get_object()
        if request.user != match_request.receiver:
            return Response({"error": "Only the receiver can accept."}, status=403)
        if match_request.status != 'pending':
            return Response({"error": "Request is not pending."}, status=400)
        match_request.status = 'accepted'
        match_request.save()
        return Response({"message": "Request accepted."})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        match_request = self.get_object()
        if request.user != match_request.receiver:
            return Response({"error": "Only the receiver can reject."}, status=403)
        if match_request.status != 'pending':
            return Response({"error": "Request is not pending."}, status=400)
        match_request.status = 'rejected'
        match_request.save()
        return Response({"message": "Request rejected."})

    def create(self, request, *args, **kwargs):
        receiver_id = request.data.get('receiver')
        message = request.data.get('message', 'I would like to connect as potential roommates!')
        if not receiver_id:
            return Response({"error": "Receiver ID is required"}, status=400)

        try:
            receiver = User.objects.get(id=int(receiver_id))
        except (ValueError, User.DoesNotExist):
            return Response({"error": "Invalid receiver ID"}, status=400)

        if receiver == request.user:
            return Response({"error": "You cannot send a request to yourself"}, status=400)

        existing = MatchRequest.objects.filter(
            (Q(sender=request.user) & Q(receiver=receiver)) |
            (Q(sender=receiver) & Q(receiver=request.user))
        ).first()
        if existing:
            return Response({"error": f"A request already exists (status: {existing.status})"}, status=400)

        serializer = self.get_serializer(data={"receiver": receiver.id, "message": message})
        serializer.is_valid(raise_exception=True)
        serializer.save(sender=request.user, status='pending')
        return Response(serializer.data, status=201)
class RoommateMatchingViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        try:
            user_profile = UserProfile.objects.get(user=request.user)
            roommate_profile = RoommateProfile.objects.get(user_profile=user_profile)
        except (UserProfile.DoesNotExist, RoommateProfile.DoesNotExist):
            return Response({"detail": "Please complete your profile."}, status=400)

        other_profiles = RoommateProfile.objects.exclude(
            user_profile__user=request.user
        ).select_related('user_profile__user')

        matches = []
        for other in other_profiles:
            other_user = other.user_profile.user
            compatibility, _ = CompatibilityScore.objects.get_or_create(
                user1=request.user,
                user2=other_user,
                defaults={'score': self._calculate_compatibility(roommate_profile, other)}
            )
            match_request = MatchRequest.objects.filter(
                (Q(sender=request.user) & Q(receiver=other_user)) |
                (Q(sender=other_user) & Q(receiver=request.user))
            ).first()
            match_status = match_request.status if match_request else 'none'

            matches.append({
                'user': other_user,
                'profile': other.user_profile,
                'roommate_profile': other,
                'compatibility_score': compatibility.score,
                'match_status': match_status
            })

        matches.sort(key=lambda x: x['compatibility_score'], reverse=True)
        serializer = MatchProfileSerializer(matches, many=True, context={'request': request})
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        try:
            other_user = get_object_or_404(User, id=pk)
            other_user_profile = get_object_or_404(UserProfile, user=other_user)
            other_roommate = get_object_or_404(RoommateProfile, user_profile=other_user_profile)

            user_profile = get_object_or_404(UserProfile, user=request.user)
            my_roommate = get_object_or_404(RoommateProfile, user_profile=user_profile)

            compatibility, _ = CompatibilityScore.objects.get_or_create(
                user1=request.user,
                user2=other_user,
                defaults={'score': self._calculate_compatibility(my_roommate, other_roommate)}
            )

            match_request = MatchRequest.objects.filter(
                (Q(sender=request.user) & Q(receiver=other_user)) |
                (Q(sender=other_user) & Q(receiver=request.user))
            ).first()
            match_status = match_request.status if match_request else 'none'
            match_request_data = MatchRequestSerializer(match_request, context={'request': request}).data if match_request else None

            return Response({
                'user': UserSerializer(other_user).data,
                'profile': UserProfileSerializer(other_user_profile, context={'request': request}).data,
                'roommate_profile': RoommateProfileSerializer(other_roommate).data,
                'compatibility_score': compatibility.score,
                'match_status': match_status,
                'match_request': match_request_data
            })

        except (UserProfile.DoesNotExist, RoommateProfile.DoesNotExist):
            return Response({"detail": "Profile not found"}, status=404)

    def _calculate_compatibility(self, user_profile, other_profile):
        score = 0
        total_weight = 0

        def add(weight, match):
            nonlocal score, total_weight
            total_weight += weight
            if match: score += weight

        add(15, user_profile.smoking_preference == other_profile.smoking_preference)
        add(10, user_profile.drinking_preference == other_profile.drinking_preference)
        add(20, user_profile.sleep_habits == other_profile.sleep_habits)
        add(15, user_profile.study_habits == other_profile.study_habits)
        add(10, user_profile.guests_preference == other_profile.guests_preference)

        weight = 20
        diff = abs(user_profile.cleanliness_level - other_profile.cleanliness_level)
        score += weight * {0: 1, 1: 0.7, 2: 0.4}.get(diff, 0)
        total_weight += weight

        if user_profile.max_rent_budget and other_profile.max_rent_budget:
            weight = 10
            diff_pct = abs(user_profile.max_rent_budget - other_profile.max_rent_budget) / max(user_profile.max_rent_budget, other_profile.max_rent_budget)
            score += weight * (1 if diff_pct <= 0.1 else 0.7 if diff_pct <= 0.2 else 0.4 if diff_pct <= 0.3 else 0)
            total_weight += weight

        return round((score / total_weight) * 100, 1) if total_weight else 50.0
class MessageViewSet(viewsets.ModelViewSet):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Message.objects.filter(
            match_request__in=MatchRequest.objects.filter(
                Q(sender=self.request.user) | Q(receiver=self.request.user)
            )
        ).order_by('timestamp')

        match_request_id = self.request.query_params.get('match_request')
        if match_request_id:
            queryset = queryset.filter(match_request__id=match_request_id)

        return queryset

    def perform_create(self, serializer):
        match_request_id = self.request.data.get('match_request')
        match_request = get_object_or_404(
            MatchRequest.objects.filter(
                Q(sender=self.request.user) | Q(receiver=self.request.user),
                status='accepted'
            ),
            id=match_request_id
        )

        match_request.last_message_at = timezone.now()
        match_request.save()

        serializer.save(
            sender=self.request.user,
            match_request=match_request
        )
