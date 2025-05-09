# study_groups/models.py
from django.db import models
from django.contrib.auth.models import User

class StudyGroup(models.Model):
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_groups')
    name = models.CharField(max_length=100)
    description = models.TextField()
    course = models.CharField(max_length=100)
    subject_tags = models.JSONField(default=list)  # e.g., ["math", "ai", "linear algebra"]
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class GroupMembership(models.Model):
    group = models.ForeignKey(StudyGroup, on_delete=models.CASCADE, related_name='memberships')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    is_accepted = models.BooleanField(default=False)
    requested_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['group', 'user']

class GroupMessage(models.Model):
    group = models.ForeignKey(StudyGroup, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
