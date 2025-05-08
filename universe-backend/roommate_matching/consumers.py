# roommate_matching/consumers.py
from channels.generic.websocket import AsyncWebsocketConsumer
import json
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from django.db.models import Q
from .models import MatchRequest

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        if not self.scope["user"].is_authenticated:
            await self.close()
            return
            
        self.room_name = self.scope['url_route']['kwargs']['room_id']
        self.room_group_name = f'chat_{self.room_name}'
        
        # Verify user has access to this chat
        if await self.verify_match_access():
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )
            await self.accept()
        else:
            await self.close()

    @database_sync_to_async
    def verify_match_access(self):
        try:
            match_id = int(self.room_name.split('_')[1])
            return MatchRequest.objects.filter(
                id=match_id,
                status='accepted',
            ).filter(
                Q(sender=self.scope["user"]) | Q(receiver=self.scope["user"])
            ).exists()
        except:
            return False

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        
        if data['type'] == 'chat_message':
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': data['message'],
                    'sender_id': str(self.scope["user"].id)
                }
            )
        elif data['type'] == 'typing':
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'typing_indicator',
                    'sender_id': str(self.scope["user"].id)
                }
            )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'message': event['message'],
            'sender_id': event['sender_id']
        }))

    async def typing_indicator(self, event):
        if event['sender_id'] != str(self.scope["user"].id):
            await self.send(text_data=json.dumps({
                'type': 'typing_indicator'
            }))