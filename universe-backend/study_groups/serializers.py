# study_groups/serializers.py
from rest_framework import serializers
from .models import StudyGroup, GroupMembership, GroupMessage
from django.contrib.auth.models import User

class StudyGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudyGroup
        fields = '__all__'
        read_only_fields = ['creator']

class GroupMembershipSerializer(serializers.ModelSerializer):
    class Meta:
        model = GroupMembership
        fields = '__all__'
        read_only_fields = ['user', 'requested_at']

class GroupMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = GroupMessage
        fields = '__all__'
        read_only_fields = ['sender', 'timestamp']
