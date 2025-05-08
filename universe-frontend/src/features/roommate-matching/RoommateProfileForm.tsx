import React, { useEffect, useState, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  TextField,
  Avatar
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MatchProfile, MatchRequest, Message } from './types';

const RoommateDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<MatchProfile | null>(null);
  const [matchRequest, setMatchRequest] = useState<MatchRequest | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [requestMessage, setRequestMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const socketRef = useRef<WebSocket | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentUserId = parseInt(localStorage.getItem('user_id') || '0');
  const fetchMessages = async () => {
    if (!matchRequest?.id) return;
  
    try {
      const res = await axios.get(`/api/messages/?match_request=${matchRequest.id}`);
      setMessages(res.data);
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  const fetchRoommateProfile = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/roommate-matches/${id}/`);
      setProfile(response.data);
      setMatchRequest(response.data.match_request || null);

      if (response.data.match_request?.status === 'accepted') {
        const msgRes = await axios.get(`/api/messages/?match_request=${response.data.match_request.id}`);
        setMessages(msgRes.data);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error fetching roommate profile:', err);
      setError('Failed to fetch roommate profile.');
      setLoading(false);
    }
  };
  useEffect(() => {
    let idleTimeout: NodeJS.Timeout;
  
    // If user is not typing and match is accepted, refresh messages after 5s
    if ( matchRequest?.status === 'accepted') {
      idleTimeout = setTimeout(() => {
        fetchMessages();  // you'll define this separately
      }, 2000);
    }
  
    return () => clearTimeout(idleTimeout);
  }, [isTyping, matchRequest]);
  useEffect(() => {
    fetchRoommateProfile();
  }, [id]);

  useEffect(() => {
    if (!matchRequest || matchRequest.status !== 'accepted') return;

    const roomId = `match_${matchRequest.id}`;
    const socket = new WebSocket(`ws://localhost:8000/ws/chat/${roomId}/`);
    socketRef.current = socket;

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'chat_message') {
        const msg: Message = {
          id: String(Date.now()),
          content: data.message.content,
          sender: data.message.sender,
          timestamp: data.message.timestamp
        };
        setMessages((prev) => [...prev, msg]);
      }

      if (data.type === 'typing_indicator') {
        setIsTyping(true);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 2000);
      }
    };

    return () => {
      socket.close();
    };
  }, [matchRequest]);

  const handleTyping = () => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: 'typing' }));
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !matchRequest) return;

    try {
      const res = await axios.post('/api/messages/', {
        match_request: matchRequest.id,
        content: newMessage.trim()
      });

      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(
          JSON.stringify({
            type: 'chat_message',
            message: res.data
          })
        );
      }

      setNewMessage('');
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleSendRequest = async () => {
    try {
      const receiverId = parseInt(id as string);
      const res = await axios.post('/api/match-requests/', {
        receiver: receiverId,
        message: requestMessage.trim()
      });
      setMatchRequest(res.data);
      setRequestMessage('');
    } catch (err) {
      console.error('Error sending request:', err);
      alert('Failed to send request. Maybe one already exists.');
    }
  };

  const handleAcceptRequest = async () => {
    if (!matchRequest) return;
    try {
      await axios.post(`/api/match-requests/${matchRequest.id}/accept/`);
      fetchRoommateProfile();
    } catch (err) {
      console.error('Error accepting request:', err);
    }
  };

  const handleRejectRequest = async () => {
    if (!matchRequest) return;
    try {
      await axios.post(`/api/match-requests/${matchRequest.id}/reject/`);
      setMatchRequest(null);
    } catch (err) {
      console.error('Error rejecting request:', err);
    }
  };

  const handleCancelRequest = async () => {
    if (!matchRequest) return;
    try {
      await axios.delete(`/api/match-requests/${matchRequest.id}/`);
      setMatchRequest(null);
    } catch (err) {
      console.error('Error cancelling request:', err);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !profile) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error || 'Profile not found.'}</Typography>
        <Button onClick={() => navigate('/roommate-matching')}>Back</Button>
      </Box>
    );
  }

  const { profile: userProfile, user } = profile;
  const isSender = matchRequest?.sender === currentUserId;
  const isReceiver = matchRequest?.receiver === currentUserId;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {userProfile.first_name || user.username}
      </Typography>

      <Avatar sx={{ width: 100, height: 100, mb: 2 }}>
        {(userProfile.first_name || user.username).charAt(0).toUpperCase()}
      </Avatar>

      {/* Profile Info */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography><strong>Age:</strong> {userProfile.age || 'N/A'}</Typography>
        <Typography><strong>Gender:</strong> {userProfile.gender}</Typography>
        <Typography><strong>Major:</strong> {userProfile.course_major}</Typography>
        <Typography><strong>Bio:</strong> {userProfile.bio}</Typography>
        <Typography><strong>Interests:</strong> {userProfile.interests}</Typography>
        <Typography><strong>Cleanliness:</strong> {profile.roommate_profile.cleanliness_level}/5</Typography>
        <Typography><strong>Budget:</strong> ${profile.roommate_profile.max_rent_budget || 'N/A'}</Typography>
        <Typography><strong>Move-in Date:</strong> {profile.roommate_profile.preferred_move_in_date || 'N/A'}</Typography>
      </Paper>

      {/* Match Request UI */}
      {!matchRequest && (
        <Box>
          <Typography gutterBottom>Send a match request:</Typography>
          <TextField
            label="Message"
            fullWidth
            multiline
            rows={2}
            value={requestMessage}
            onChange={(e) => setRequestMessage(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button variant="contained" onClick={handleSendRequest} disabled={!requestMessage.trim()}>
            Send Match Request
          </Button>
        </Box>
      )}

      {matchRequest?.status === 'pending' && isReceiver && (
        <Box sx={{ mt: 2 }}>
          <Typography>You have received a match request:</Typography>
          <Typography>Message: {matchRequest.message}</Typography>
          <Button variant="contained" color="success" onClick={handleAcceptRequest} sx={{ mr: 1 }}>
            Accept
          </Button>
          <Button variant="outlined" color="error" onClick={handleRejectRequest}>
            Reject
          </Button>
        </Box>
      )}

      {matchRequest?.status === 'pending' && isSender && (
        <Box sx={{ mt: 2 }}>
          <Typography>You have sent a match request.</Typography>
          <Typography>Message: {matchRequest.message}</Typography>
          <Button variant="outlined" color="warning" onClick={handleCancelRequest}>
            Cancel Request
          </Button>
        </Box>
      )}

      {/* Chat Section */}
      {matchRequest?.status === 'accepted' && (
        <Paper sx={{ mt: 4, p: 3 }}>
          <Typography variant="h6" gutterBottom>Chat with {userProfile.first_name || user.username}</Typography>

          {isTyping && (
            <Typography variant="caption" color="text.secondary">
              {userProfile.first_name || user.username} is typing...
            </Typography>
          )}

          <Box sx={{ height: 300, overflowY: 'auto', mt: 2, mb: 2 }}>
            {messages.length === 0 ? (
              <Typography>No messages yet.</Typography>
            ) : (
              messages.map((msg) => {
                const isMe = msg.sender.id === currentUserId;
                const senderName = msg.sender.first_name || msg.sender.username;
                const initials = senderName.charAt(0).toUpperCase();

                return (
                  <Box
                    key={msg.id}
                    sx={{
                      display: 'flex',
                      flexDirection: isMe ? 'row-reverse' : 'row',
                      alignItems: 'flex-start',
                      mb: 1,
                    }}
                  >
                    <Avatar sx={{ bgcolor: isMe ? 'primary.main' : 'grey.500', ml: isMe ? 1 : 0, mr: isMe ? 0 : 1 }}>
                      {initials}
                    </Avatar>
                    <Box sx={{ maxWidth: '70%' }}>
                      <Paper
                        sx={{
                          p: 1.5,
                          bgcolor: isMe ? 'primary.main' : 'grey.100',
                          color: isMe ? 'primary.contrastText' : 'text.primary',
                        }}
                      >
                        <Typography variant="body2" fontWeight="bold">
                          {senderName}
                        </Typography>
                        <Typography variant="body1">{msg.content}</Typography>
                        <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                          {new Date(msg.timestamp).toLocaleString()}
                        </Typography>
                      </Paper>
                    </Box>
                  </Box>
                );
              })
            )}
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping();
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSendMessage();
                  e.preventDefault();
                }
              }}
              placeholder="Type a message..."
            />
            <Button variant="contained" onClick={handleSendMessage} disabled={!newMessage.trim()}>
              Send
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default RoommateDetail;