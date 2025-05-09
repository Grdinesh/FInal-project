import React, { useEffect, useState, useRef } from 'react';
import {
  Box, Typography, Paper, TextField, Button, CircularProgress, List, ListItem,
  ListItemText, Avatar, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { StudyGroup, GroupMembership, GroupMessage } from './types';

const StudyGroupDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const userId = parseInt(localStorage.getItem('user_id') || '0');

  const [group, setGroup] = useState<StudyGroup | null>(null);
  const [membership, setMembership] = useState<GroupMembership | null>(null);
  const [pendingRequests, setPendingRequests] = useState<GroupMembership[]>([]);
  const [acceptedMembers, setAcceptedMembers] = useState<GroupMembership[]>([]);
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [selectedMemberToRemove, setSelectedMemberToRemove] = useState<GroupMembership | null>(null);

  const socketRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const fetchGroup = async () => {
    const res = await axios.get(`/api/study-groups/groups/${id}/`);
    setGroup(res.data);
  };

  const fetchMembership = async () => {
    const res = await axios.get('/api/study-groups/memberships/');
    const match = res.data.find((m: GroupMembership) => m.group === parseInt(id!));
    if (match) setMembership(match);
  };

  const fetchPendingRequests = async () => {
    if (!group || group.creator !== userId) return;
    const res = await axios.get('/api/study-groups/memberships/');
    const pending = res.data.filter(
      (r: GroupMembership) => r.group === parseInt(id!) && !r.is_accepted
    );
    const accepted = res.data.filter(
      (r: GroupMembership) => r.group === parseInt(id!) && r.is_accepted && r.user !== group.creator
    );
    setPendingRequests(pending);
    setAcceptedMembers(accepted);
  };

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`/api/study-groups/messages/?group=${id}`);
      setMessages(res.data);
    } catch (err) {
      console.error('Failed to fetch messages', err);
    }
  };

  const handleJoinRequest = async () => {
    try {
      const res = await axios.post('/api/study-groups/memberships/', { group: id });
      setMembership(res.data);
    } catch (err) {
      console.error('Failed to send join request:', err);
    }
  };

  const handleAcceptRequest = async (membershipId: number) => {
    try {
      await axios.patch(`/api/study-groups/memberships/${membershipId}/`, {
        is_accepted: true,
      });
      await fetchPendingRequests();
    } catch (err) {
      console.error('Failed to accept request:', err);
    }
  };

  const handleRejectRequest = async (membershipId: number) => {
    try {
      await axios.delete(`/api/study-groups/memberships/${membershipId}/`);
      await fetchPendingRequests();
    } catch (err) {
      console.error('Failed to reject request:', err);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    const res = await axios.post('/api/study-groups/messages/', {
      group: id,
      content: newMessage
    });

    setMessages(prev => [...prev, res.data]);

    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: 'chat_message', message: res.data }));
    }

    setNewMessage('');
  };

  const handleDeleteGroup = async () => {
    if (!window.confirm('Are you sure you want to delete this group? This cannot be undone.')) return;
    try {
      await axios.delete(`/api/study-groups/groups/${id}/`);
      navigate('/study-groups');
    } catch (err) {
      console.error('Failed to delete group:', err);
    }
  };

  const openRemoveDialog = (member: GroupMembership) => {
    setSelectedMemberToRemove(member);
    setRemoveDialogOpen(true);
  };

  const handleConfirmRemove = async () => {
    if (!selectedMemberToRemove) return;
    try {
      await axios.delete(`/api/study-groups/memberships/${selectedMemberToRemove.id}/`);
      await fetchPendingRequests();
      setRemoveDialogOpen(false);
    } catch (err) {
      console.error('Failed to remove member:', err);
    }
  };

  useEffect(() => {
    const load = async () => {
      await fetchGroup();
      await fetchMembership();
      setLoading(false);
    };
    load();
  }, [id]);

  useEffect(() => {
    if (group && group.creator === userId) {
      fetchPendingRequests();
    }
  }, [group]);

  useEffect(() => {
    if (!membership?.is_accepted) return;

    fetchMessages();

    const socket = new WebSocket(`ws://localhost:8000/ws/study-group/${id}/`);
    socketRef.current = socket;

    socket.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === 'chat_message') {
        setMessages((prev) => [...prev, data.message]);
      }
    };

    const interval = setInterval(fetchMessages, 5000);

    return () => {
      socket.close();
      clearInterval(interval);
    };
  }, [membership]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (loading || !group) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const isCreator = group.creator === userId;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4">{group.name}</Typography>
      <Typography color="text.secondary">{group.course}</Typography>
      <Typography sx={{ my: 2 }}>{group.description}</Typography>
      <Typography variant="caption">Tags: {group.subject_tags.join(', ')}</Typography>

      {isCreator && (
        <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => navigate(`/study-groups/edit/${id}`)}
          >
            Edit Group
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={handleDeleteGroup}
          >
            Delete Group
          </Button>
        </Box>
      )}

      {!isCreator && !membership && (
        <Box sx={{ mt: 3 }}>
          <Button variant="contained" onClick={handleJoinRequest}>
            Request to Join
          </Button>
        </Box>
      )}

      {membership && !membership.is_accepted && (
        <Typography sx={{ mt: 3 }}>
          Your request is pending approval.
        </Typography>
      )}

      {isCreator && pendingRequests.length > 0 && (
        <Paper sx={{ mt: 4, p: 2 }}>
          <Typography variant="h6">Pending Join Requests</Typography>
          <List>
            {pendingRequests.map((req) => (
              <ListItem key={req.id} divider>
                <ListItemText
                  primary={`User ID: ${req.user}`}
                  secondary={`Requested at: ${new Date(req.requested_at).toLocaleString()}`}
                />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button variant="outlined" color="success" onClick={() => handleAcceptRequest(req.id)}>Accept</Button>
                  <Button variant="outlined" color="error" onClick={() => handleRejectRequest(req.id)}>Reject</Button>
                </Box>
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {isCreator && acceptedMembers.length > 0 && (
        <Paper sx={{ mt: 4, p: 2 }}>
          <Typography variant="h6">Accepted Members</Typography>
          <List>
            {acceptedMembers.map((member) => (
              <ListItem key={member.id} divider>
                <ListItemText primary={`User ID: ${member.user}`} />
                <Button variant="outlined" color="warning" onClick={() => openRemoveDialog(member)}>
                  Remove
                </Button>
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {membership?.is_accepted && (
        <Paper sx={{ mt: 4, p: 3 }}>
          <Typography variant="h6">Group Chat</Typography>
          <Box sx={{ maxHeight: 300, overflowY: 'auto', mt: 2, mb: 2 }}>
            {messages.map((msg) => {
              const isMe = msg.sender.id === userId;
              const fullName = `${msg.sender.first_name ?? ''} ${msg.sender.last_name ?? ''}`.trim() || msg.sender.username;

              return (
                <Box key={msg.id} sx={{
                  display: 'flex',
                  justifyContent: isMe ? 'flex-end' : 'flex-start',
                  mb: 2
                }}>
                  <Box sx={{
                    display: 'flex',
                    flexDirection: isMe ? 'row-reverse' : 'row',
                    alignItems: 'flex-start',
                    gap: 1,
                    maxWidth: '80%'
                  }}>
                    <Avatar
                      src={msg.sender.profile_picture || undefined}
                      alt={fullName}
                      sx={{ width: 36, height: 36 }}
                    />
                    <Paper sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: isMe ? 'primary.main' : 'grey.100',
                      color: isMe ? 'white' : 'black',
                      maxWidth: '100%'
                    }}>
                      <Typography fontWeight="bold" sx={{ mb: 0.5 }}>
                        {fullName}
                      </Typography>
                      <Typography>{msg.content}</Typography>
                      <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </Typography>
                    </Paper>
                  </Box>
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
              placeholder="Type your message..."
            />
            <Button variant="contained" onClick={handleSendMessage}>Send</Button>
          </Box>
        </Paper>
      )}

      {/* Remove Member Dialog */}
      <Dialog open={removeDialogOpen} onClose={() => setRemoveDialogOpen(false)}>
        <DialogTitle>Remove Member</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to remove this member from the group? They will be able to request again later.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRemoveDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmRemove} color="error" variant="contained">
            Remove
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudyGroupDetail;
