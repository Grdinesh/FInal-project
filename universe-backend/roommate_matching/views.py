# roommate_matching/views.py
from rest_framework import viewsets, permissions, status, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Q
from django.contrib.auth.models import User
from .models import MatchRequest, CompatibilityScore, Message
from .serializers import MatchRequestSerializer, CompatibilityScoreSerializer, MatchProfileSerializer, MessageSerializer
from user_profiles.models import UserProfile, RoommateProfile
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from django.db.models import Q
from rest_framework import viewsets, status, permissions
from rest_framework.response import Response
from user_profiles.models import UserProfile, RoommateProfile
from user_profiles.serializers import UserSerializer, UserProfileSerializer, RoommateProfileSerializer
from .models import MatchRequest, CompatibilityScore

import logging
logger = logging.getLogger(__name__)

# def create(self, request, *args, **kwargs):
#     logger.info(f"MatchRequest create called with data: {request.data}")
#     logger.info(f"Request content type: {request.content_type}")
#     logger.info(f"Request user: {request.user.username} (ID: {request.user.id})")
    
#     # Validate receiver exists
#     receiver_id = request.data.get('receiver')
#     logger.info(f"Receiver ID from request: {receiver_id} (Type: {type(receiver_id)})")
    
#     if not receiver_id:
#         logger.error("No receiver ID provided")
#         return Response(
#             {"error": "Receiver ID is required"},
#             status=status.HTTP_400_BAD_REQUEST
#         )
    
#     # Try to convert receiver_id to int if it's a string
#     try:
#         if isinstance(receiver_id, str):
#             receiver_id = int(receiver_id)
#     except ValueError:
#         logger.error(f"Invalid receiver ID format: {receiver_id}")
#         return Response(
#             {"error": f"Invalid receiver ID format: {receiver_id}"},
#             status=status.HTTP_400_BAD_REQUEST
#         )
    
#     # Check if receiver exists
#     try:
#         receiver = User.objects.get(id=receiver_id)
#         logger.info(f"Receiver found: {receiver.username} (ID: {receiver.id})")
#     except User.DoesNotExist:
#         logger.error(f"Receiver with ID {receiver_id} does not exist")
#         return Response(
#             {"error": f"Receiver with ID {receiver_id} does not exist"},
#             status=status.HTTP_400_BAD_REQUEST
#         )
    
#     # Check if sender and receiver are different
#     if request.user.id == receiver.id:
#         logger.error("Sender and receiver are the same user")
#         return Response(
#             {"error": "You cannot send a match request to yourself"},
#             status=status.HTTP_400_BAD_REQUEST
#         )
    
#     # Check if a request already exists
#     existing_request = MatchRequest.objects.filter(
#         (Q(sender=request.user) & Q(receiver=receiver)) |
#         (Q(sender=receiver) & Q(receiver=request.user))
#     ).first()
    
#     if existing_request:
#         logger.error(f"Match request already exists with status: {existing_request.status}")
#         return Response(
#             {"error": f"A match request already exists between these users (status: {existing_request.status})"},
#             status=status.HTTP_400_BAD_REQUEST
#         )
    
#     # At this point, everything should be valid
#     logger.info("All validation passed, creating match request")
    
#     # Create the serializer with the corrected data
#     serializer_data = {
#         'receiver': receiver_id,
#         'message': request.data.get('message', 'I would like to connect as potential roommates!')
#     }
    
#     serializer = self.get_serializer(data=serializer_data)
    
#     # Check if serializer is valid
#     if not serializer.is_valid():
#         logger.error(f"Serializer validation failed: {serializer.errors}")
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
#     # Save the serializer
#     try:
#         serializer.save(sender=request.user, status='pending')
#         logger.info("Match request created successfully")
#     except Exception as e:
#         logger.error(f"Error saving match request: {str(e)}")
#         return Response(
#             {"error": f"Failed to create match request: {str(e)}"},
#             status=status.HTTP_400_BAD_REQUEST
#         )
    
#     headers = self.get_success_headers(serializer.data)
#     return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

class MatchRequestViewSet(viewsets.ModelViewSet):
    queryset = MatchRequest.objects.all()
    serializer_class = MatchRequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        return MatchRequest.objects.filter(
            Q(sender=user) | Q(receiver=user)
        ).order_by('-created_at')
    
    def create(self, request, *args, **kwargs):
        # In your Django view
        print("Received data:", request.data)
        print("Receiver:", request.data.get('receiver'))
        print("Message:", request.data.get('message'))
        logger.info(f"MatchRequest create called with data: {request.data}")
        logger.info(f"Request content type: {request.content_type}")
        logger.info(f"Request user: {request.user.username} (ID: {request.user.id})")
        
        # Validate receiver exists
        receiver_id = request.data.get('receiver')
        logger.info(f"Receiver ID from request: {receiver_id} (Type: {type(receiver_id)})")
        
        if not receiver_id:
            logger.error("No receiver ID provided")
            return Response(
                {"error": "Receiver ID is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Try to convert receiver_id to int if it's a string
        try:
            if isinstance(receiver_id, str):
                receiver_id = int(receiver_id)
        except ValueError:
            logger.error(f"Invalid receiver ID format: {receiver_id}")
            return Response(
                {"error": f"Invalid receiver ID format: {receiver_id}"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if receiver exists
        try:
            receiver = User.objects.get(id=receiver_id)
            logger.info(f"Receiver found: {receiver.username} (ID: {receiver.id})")
        except User.DoesNotExist:
            logger.error(f"Receiver with ID {receiver_id} does not exist")
            return Response(
                {"error": f"Receiver with ID {receiver_id} does not exist"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if sender and receiver are different
        if request.user.id == receiver.id:
            logger.error("Sender and receiver are the same user")
            return Response(
                {"error": "You cannot send a match request to yourself"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if a request already exists
        existing_request = MatchRequest.objects.filter(
            (Q(sender=request.user) & Q(receiver=receiver)) |
            (Q(sender=receiver) & Q(receiver=request.user))
        ).first()
        
        if existing_request:
            logger.error(f"Match request already exists with status: {existing_request.status}")
            return Response(
                {"error": f"A match request already exists between these users (status: {existing_request.status})"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # At this point, everything should be valid
        logger.info("All validation passed, creating match request")
        
        # Create the serializer with the corrected data
        serializer_data = {
            'receiver': receiver_id,
            'message': request.data.get('message', 'I would like to connect as potential roommates!')
        }
        
        serializer = self.get_serializer(data=serializer_data)
        
        # Check if serializer is valid
        if not serializer.is_valid():
            logger.error(f"Serializer validation failed: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # Save the serializer
        try:
            serializer.save(sender=request.user, status='pending')
            logger.info("Match request created successfully")
        except Exception as e:
            logger.error(f"Error saving match request: {str(e)}")
            return Response(
                {"error": f"Failed to create match request: {str(e)}"},
                status=status.HTTP_201_CREATED
            )
        
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

class RoommateMatchingViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]
    
    def list(self, request):
        """
        Get potential roommate matches for the current user
        """
        # Get current user's profile and preferences
        try:
            user_profile = UserProfile.objects.get(user=request.user)
            roommate_profile = RoommateProfile.objects.get(user_profile=user_profile)
        except (UserProfile.DoesNotExist, RoommateProfile.DoesNotExist):
            return Response(
                {"detail": "Please complete your profile to find matches."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get all users with roommate profiles, excluding current user
        other_profiles = RoommateProfile.objects.exclude(
            user_profile__user=request.user
        ).select_related('user_profile__user')
        
        # Calculate compatibility scores
        matches = []
        for other_profile in other_profiles:
            other_user = other_profile.user_profile.user
            
            # Get existing compatibility score or calculate a new one
            compatibility, created = CompatibilityScore.objects.get_or_create(
                user1=request.user,
                user2=other_user,
                defaults={'score': self._calculate_compatibility(roommate_profile, other_profile)}
            )
            
            # If the score is old, recalculate it
            if created is False:
                compatibility.score = self._calculate_compatibility(roommate_profile, other_profile)
                compatibility.save()
            
            # Get match status if any
            match_request = MatchRequest.objects.filter(
            (Q(sender=request.user) & Q(receiver=other_user)) |
            (Q(sender=other_user) & Q(receiver=request.user))
                ).first()

            match_status = match_request.status if match_request else 'none'
            match_request_data = MatchRequestSerializer(match_request, context={'request': request}).data if match_request else None

            
            # Add to matches
            matches.append({
                'user': other_user,
                'profile': other_profile.user_profile,
                'roommate_profile': other_profile,
                'compatibility_score': compatibility.score,
                'match_status': match_status
            })
        
        # Sort by compatibility score (highest first)
        matches.sort(key=lambda x: x['compatibility_score'], reverse=True)
        
        serializer = MatchProfileSerializer(matches, many=True, context={'request': request})
        return Response(serializer.data)
    
    def retrieve(self, request, pk=None):
        """
        Get details of a specific potential roommate match
        """
        try:
            print(f"Retrieving roommate match with pk={pk} for user={request.user.username}")
            # Get the user profile of the requested user
            other_user = get_object_or_404(User, id=pk)
            other_user_profile = get_object_or_404(UserProfile, user=other_user)
            other_roommate_profile = get_object_or_404(RoommateProfile, user_profile=other_user_profile)
            
            # Get current user's profile
            user_profile = get_object_or_404(UserProfile, user=request.user)
            roommate_profile = get_object_or_404(RoommateProfile, user_profile=user_profile)
            
            # Calculate compatibility score
            compatibility, created = CompatibilityScore.objects.get_or_create(
                user1=request.user,
                user2=other_user,
                defaults={'score': 50.0}  # Default score
            )
            
            # Check if a match request exists
            match_request = MatchRequest.objects.filter(
            (Q(sender=request.user) & Q(receiver=other_user)) |
            (Q(sender=other_user) & Q(receiver=request.user))
                ).first()

            match_status = match_request.status if match_request else 'none'
            match_request_data = MatchRequestSerializer(match_request, context={'request': request}).data if match_request else None

            
            # Create response data
            data = {
                'user': UserSerializer(other_user).data,
                'profile': UserProfileSerializer(other_user_profile).data,
                'roommate_profile': RoommateProfileSerializer(other_roommate_profile).data,
                'compatibility_score': compatibility.score,
                'match_status': match_status,
                'match_request': match_request_data, 'match_request': match_request_data
            }
            
            return Response(data)
        except (UserProfile.DoesNotExist, RoommateProfile.DoesNotExist):
            return Response(
                {"detail": "Profile not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        
    
    def _calculate_compatibility(self, user_profile, other_profile):
        """
        Calculate compatibility score between two roommate profiles
        Returns a score between 0-100
        """
        score = 0
        total_weight = 0
        
        # Smoking preference (weight: 15)
        if user_profile.smoking_preference != 'no_preference' and other_profile.smoking_preference != 'no_preference':
            weight = 15
            total_weight += weight
            if user_profile.smoking_preference == other_profile.smoking_preference:
                score += weight
        
        # Drinking preference (weight: 10)
        if user_profile.drinking_preference != 'no_preference' and other_profile.drinking_preference != 'no_preference':
            weight = 10
            total_weight += weight
            if user_profile.drinking_preference == other_profile.drinking_preference:
                score += weight
        
        # Sleep habits (weight: 20)
        if user_profile.sleep_habits != 'no_preference' and other_profile.sleep_habits != 'no_preference':
            weight = 20
            total_weight += weight
            if user_profile.sleep_habits == other_profile.sleep_habits:
                score += weight
        
        # Study habits (weight: 15)
        if user_profile.study_habits != 'no_preference' and other_profile.study_habits != 'no_preference':
            weight = 15
            total_weight += weight
            if user_profile.study_habits == other_profile.study_habits:
                score += weight
        
        # Guests preference (weight: 10)
        if user_profile.guests_preference != 'no_preference' and other_profile.guests_preference != 'no_preference':
            weight = 10
            total_weight += weight
            if user_profile.guests_preference == other_profile.guests_preference:
                score += weight
        
        # Cleanliness level (weight: 20)
        weight = 20
        total_weight += weight
        cleanliness_diff = abs(user_profile.cleanliness_level - other_profile.cleanliness_level)
        if cleanliness_diff == 0:
            score += weight
        elif cleanliness_diff == 1:
            score += weight * 0.7
        elif cleanliness_diff == 2:
            score += weight * 0.4
        
        # Budget compatibility (weight: 10)
        if user_profile.max_rent_budget and other_profile.max_rent_budget:
            weight = 10
            total_weight += weight
            budget_diff_percentage = abs(user_profile.max_rent_budget - other_profile.max_rent_budget) / max(user_profile.max_rent_budget, other_profile.max_rent_budget)
            if budget_diff_percentage <= 0.1:
                score += weight
            elif budget_diff_percentage <= 0.2:
                score += weight * 0.7
            elif budget_diff_percentage <= 0.3:
                score += weight * 0.4
        
        # Calculate final percentage score
        final_score = (score / total_weight * 100) if total_weight > 0 else 50
        return round(final_score, 1)

class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Only show messages for match requests the user is part of
        return Message.objects.filter(
            match_request__in=MatchRequest.objects.filter(
                Q(sender=self.request.user) | Q(receiver=self.request.user)
            )
        ).order_by('timestamp')
    
    def perform_create(self, serializer):
        match_request_id = self.request.data.get('match_request')
        match_request = get_object_or_404(
            MatchRequest.objects.filter(
                Q(sender=self.request.user) | Q(receiver=self.request.user),
                status='accepted'  # Only allow messages for accepted requests
            ),
            id=match_request_id
        )
        
        # Update last message timestamp on the match request
        match_request.last_message_at = timezone.now()
        match_request.save()
        
        serializer.save(
            sender=self.request.user,
            match_request=match_request
        )