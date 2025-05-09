# study_groups/consumers.py
from channels.generic.websocket import AsyncWebsocketConsumer
import json
from channels.db import database_sync_to_async
from django.db.models import Q
from .models import StudyGroup, GroupMembership, GroupMessage
from django.contrib.auth.models import User

class StudyGroupConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.group_id = self.scope['url_route']['kwargs']['group_id']
        self.room_group_name = f'study_group_{self.group_id}'

        user = self.scope["user"]
        if not user.is_authenticated:
            await self.close()
            return

        is_member = await self.is_group_member(user.id)
        if is_member:
            await self.channel_layer.group_add(self.room_group_name, self.channel_name)
            await self.accept()
        else:
            await self.close()

    @database_sync_to_async
    def is_group_member(self, user_id):
        return GroupMembership.objects.filter(
            group_id=self.group_id,
            user_id=user_id,
            is_accepted=True
        ).exists()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)

        if data['type'] == 'chat_message':
            sender_id = self.scope["user"].id
            message = data['message']
            saved_msg = await self.save_message(sender_id, message)

            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': saved_msg
                }
            )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'message': event['message']
        }))

    @database_sync_to_async
    def save_message(self, sender_id, content):
        msg = GroupMessage.objects.create(
            group_id=self.group_id,
            sender_id=sender_id,
            content=content
        )
        return {
            'id': msg.id,
            'group': msg.group.id,
            'sender': {
                'id': msg.sender.id,
                'username': msg.sender.username,
            },
            'content': msg.content,
            'timestamp': msg.timestamp.isoformat()
        }
