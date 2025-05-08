# roommate_matching/serializers.py
from rest_framework import serializers
from .models import MatchRequest, CompatibilityScore,Message
from user_profiles.serializers import UserSerializer, UserProfileSerializer, RoommateProfileSerializer
from user_profiles.models import UserProfile, RoommateProfile

class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    
    class Meta:
        model = Message
        fields = ['id', 'sender', 'content', 'timestamp', 'read']
        read_only_fields = ['id', 'sender', 'timestamp']    

class MatchRequestSerializer(serializers.ModelSerializer):
    sender_detail = UserSerializer(source='sender', read_only=True)
    receiver_detail = UserSerializer(source='receiver', read_only=True)
    messages = MessageSerializer(many=True, read_only=True)
    
    class Meta:
        model = MatchRequest
        fields = ['id', 'sender', 'receiver', 'sender_detail', 'receiver_detail', 
                 'status', 'message', 'messages', 'created_at', 'updated_at']
        read_only_fields = ['sender', 'sender_detail', 'receiver_detail', 
                          'status', 'created_at', 'updated_at', 'messages']

class CompatibilityScoreSerializer(serializers.ModelSerializer):
    user1_detail = UserSerializer(source='user1', read_only=True)
    user2_detail = UserSerializer(source='user2', read_only=True)
    
    class Meta:
        model = CompatibilityScore
        fields = '__all__'
        read_only_fields = ['user1', 'user2', 'score', 'last_calculated']

class MatchProfileSerializer(serializers.Serializer):
    user = UserSerializer(read_only=True)
    profile = UserProfileSerializer(read_only=True)
    roommate_profile = RoommateProfileSerializer(read_only=True)
    compatibility_score = serializers.FloatField(read_only=True)
    match_status = serializers.CharField(read_only=True)

