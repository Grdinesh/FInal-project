import React, { useEffect, useState, useRef } from 'react';
import {
  Box, Typography, Paper, TextField, Button, CircularProgress, Avatar
} from '@mui/material';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { StudyGroup, GroupMembership, GroupMessage } from './types';

const StudyGroupDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [group, setGroup] = useState<StudyGroup | null>(null);
  const [membership, setMembership] = useState<GroupMembership | null>(null);
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const socketRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const userId = parseInt(localStorage.getItem('user_id') || '0');

  const fetchGroup = async () => {
    try {
      const res = await axios.get(`/api/study-groups/groups/${id}/`);
      setGroup(res.data);
    } catch (err) {
      console.error('Error fetching group:', err);
    }
  };

  const fetchMembership = async () => {
    try {
      const res = await axios.get('/api/study-groups/memberships/');
      const match = res.data.find((m: GroupMembership) => m.group === parseInt(id!));
      if (match) setMembership(match);
    } catch (err) {
      console.error('Error fetching membership:', err);
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`/api/study-groups/messages/?group=${id}`);
      setMessages(res.data);
    } catch (err) {
      console.error('Error loading messages:', err);
    }
  };

  useEffect(() => {
    fetchGroup();
    fetchMembership();
  }, [id]);

  useEffect(() => {
    if (membership?.is_accepted) {
      fetchMessages();

      const socket = new WebSocket(`ws://localhost:8000/ws/study-group/${id}/`);
      socketRef.current = socket;

      socket.onmessage = (e) => {
        const data = JSON.parse(e.data);
        if (data.type === 'chat_message') {
          setMessages(prev => [...prev, data.message]);
        }
      };

      return () => socket.close();
    }
  }, [membership]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      const res = await axios.post('/api/study-groups/messages/', {
        group: id,
        content: newMessage
      });

      setMessages(prev => [...prev, res.data]);

      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(
          JSON.stringify({ type: 'chat_message', message: res.data })
        );
      }

      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const handleJoinRequest = async () => {
    try {
      const res = await axios.post('/api/study-groups/memberships/', {
        group: id
      });
      setMembership(res.data);
    } catch (err) {
      console.error('Error requesting membership:', err);
    }
  };

  if (loading || !group) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
      <CircularProgress />
    </Box>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4">{group.name}</Typography>
      <Typography color="text.secondary">{group.course}</Typography>
      <Typography sx={{ my: 2 }}>{group.description}</Typography>
      <Typography variant="caption" sx={{ mb: 2, display: 'block' }}>
        Tags: {group.subject_tags.join(', ')}
      </Typography>

      {!membership && (
        <Button variant="contained" onClick={handleJoinRequest}>Request to Join</Button>
      )}

      {membership && !membership.is_accepted && (
        <Typography sx={{ mt: 2 }}>Join request pending approval...</Typography>
      )}

      {membership?.is_accepted && (
        <Paper sx={{ mt: 4, p: 3 }}>
          <Typography variant="h6">Group Chat</Typography>

          <Box sx={{ maxHeight: 300, overflowY: 'auto', mt: 2, mb: 2 }}>
            {messages.map((msg) => {
              const isMe = msg.sender.id === userId;
              return (
                <Box key={msg.id} sx={{
                  display: 'flex',
                  justifyContent: isMe ? 'flex-end' : 'flex-start',
                  mb: 1
                }}>
                  <Paper sx={{
                    p: 1.5,
                    maxWidth: '60%',
                    bgcolor: isMe ? 'primary.main' : 'grey.200',
                    color: isMe ? 'white' : 'black'
                  }}>
                    <Typography fontWeight="bold">{msg.sender.username}</Typography>
                    <Typography>{msg.content}</Typography>
                    <Typography variant="caption">
                      {new Date(msg.timestamp).toLocaleString()}
                    </Typography>
                  </Paper>
                </Box>
              );
            })}
            <div ref={messagesEndRef} />
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Type your message"
            />
            <Button variant="contained" onClick={handleSendMessage}>Send</Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default StudyGroupDetail;
