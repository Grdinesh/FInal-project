// src/features/roommate-matching/RoommateDetail.tsx
import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Grid, Paper, Chip, Button, Divider, 
  CircularProgress, Avatar, Rating, Dialog, DialogTitle, 
  DialogContent, DialogActions, TextField, List, ListItem, 
  ListItemText, ListItemAvatar
} from '@mui/material';
import { 
  PersonOutline, School, SmokingRooms, LocalBar, NightsStay, 
  MenuBook, People, CleaningServices, AttachMoney, Event
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MatchProfile, MatchRequest } from './types';

const RoommateDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<MatchProfile | null>(null);
  const [matchRequest, setMatchRequest] = useState<MatchRequest | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [messageDialogOpen, setMessageDialogOpen] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [sendingRequest, setSendingRequest] = useState<boolean>(false);
  
  useEffect(() => {
    fetchRoommateProfile();
  }, [id]);
  
  const fetchRoommateProfile = async () => {
    setLoading(true);
    try {
      // Fetch the specific profile
      const profileResponse = await axios.get(`/api/roommate-matches/${id}/`);
      setProfile(profileResponse.data);
      
      // Fetch any existing match requests
      const matchRequestsResponse = await axios.get('/api/match-requests/');
      const requests = matchRequestsResponse.data;
      
      // Find any request between the current user and this roommate
      const existingRequest = requests.find((req: MatchRequest) => 
        (req.sender === parseInt(id as string) || req.receiver === parseInt(id as string))
      );
      
      if (existingRequest) {
        setMatchRequest(existingRequest);
      }
      
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError('Failed to fetch roommate profile');
      console.error('Error fetching profile:', err);
    }
  };
  
  // const handleSendRequest = async () => {
  //   setSendingRequest(true);
  //   try {
  //     const response = await axios.post('/api/match-requests/', {
  //       receiver: id,
  //       message: message,
  //     });
      
  //     setMatchRequest(response.data);
  //     setMessageDialogOpen(false);
  //     setSendingRequest(false);
  //   } catch (err) {
  //     setSendingRequest(false);
  //     console.error('Error sending match request:', err);
  //   }
  // };
  
  const handleSendRequest = async () => {
    setSendingRequest(true);
    try {
      // Ensure the id is parsed as a number
      const receiverId = parseInt(id as string);
      if (isNaN(receiverId)) {
        throw new Error('Invalid user ID');
      }
  
      const response = await axios.post('/api/match-requests/', {
        receiver: receiverId,
        message: message,
      });
      
      // setMessageContent('');
      // setMessageDialog(false);
      
      // Refresh the data to show updated match status
      fetchRoommateProfile();
      setSendingRequest(false);
    } catch (err: any) {
      setSendingRequest(false);
      console.error('Error sending match request:', err);
      // Display the error message
      const errorMessage = err.response?.data?.error || 
                           err.response?.data?.detail || 
                           'Failed to send request. Please try again.';
      // You could set an error state here and display it in the UI
      alert(errorMessage); // Simple way to show the error, replace with proper UI error handling
    }
  };

  const handleCancelRequest = async () => {
    if (!matchRequest) return;
    
    try {
      await axios.delete(`/api/match-requests/${matchRequest.id}/`);
      setMatchRequest(null);
    } catch (err) {
      console.error('Error canceling match request:', err);
    }
  };
  
  const handleAcceptRequest = async () => {
    if (!matchRequest) return;
    
    try {
      await axios.post(`/api/match-requests/${matchRequest.id}/accept/`);
      fetchRoommateProfile(); // Refresh the data
    } catch (err) {
      console.error('Error accepting match request:', err);
    }
  };
  
  const handleRejectRequest = async () => {
    if (!matchRequest) return;
    
    try {
      await axios.post(`/api/match-requests/${matchRequest.id}/reject/`);
      fetchRoommateProfile(); // Refresh the data
    } catch (err) {
      console.error('Error rejecting match request:', err);
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
        <Typography color="error">{error || 'Profile not found'}</Typography>
        <Button onClick={() => navigate('/roommate-matching')}>
          Back to Roommate Matching
        </Button>
      </Box>
    );
  }
  
  const { user, profile: userProfile, roommate_profile } = profile;
  
  // Determine if the current user is the sender or receiver in the match request
  const isIncomingRequest = matchRequest && matchRequest.receiver === parseInt(id as string);
  const isOutgoingRequest = matchRequest && matchRequest.sender === parseInt(id as string);
  
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Button onClick={() => navigate('/roommate-matching')}>
          ← Back to Roommate Matching
        </Button>
      </Box>
      
      <Grid container spacing={3}>
        {/* Profile Section */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
              <Avatar 
                src={userProfile.profile_picture || undefined}
                alt={`${userProfile.first_name} ${userProfile.last_name}`}
                sx={{ width: 150, height: 150, mb: 2 }}
              />
              <Typography variant="h5" gutterBottom>
                {userProfile.first_name} {userProfile.last_name}
              </Typography>
              <Chip 
                label={`${profile.compatibility_score}% Compatible`}
                color="primary"
                sx={{ mb: 1 }}
              />
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {userProfile.age ? `${userProfile.age} years • ` : ''}
                {userProfile.gender || 'Not specified'}
              </Typography>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Basic Information
              </Typography>
              
              <List dense>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar>
                      <School />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary="Major" 
                    secondary={userProfile.course_major || 'Not specified'} 
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemAvatar>
                    <Avatar>
                      <CleaningServices />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary="Cleanliness" 
                    secondary={
                      <Rating 
                        value={roommate_profile.cleanliness_level} 
                        readOnly 
                        size="small"
                      />
                    } 
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemAvatar>
                    <Avatar>
                      <AttachMoney />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary="Budget" 
                    secondary={roommate_profile.max_rent_budget ? `$${roommate_profile.max_rent_budget}/month` : 'Not specified'} 
                  />
                </ListItem>
                
                {roommate_profile.preferred_move_in_date && (
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar>
                        <Event />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary="Move-in Date" 
                      secondary={new Date(roommate_profile.preferred_move_in_date).toLocaleDateString()} 
                    />
                  </ListItem>
                )}
              </List>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Roommate Request
              </Typography>
              
              {matchRequest ? (
                <>
                  {matchRequest.status === 'pending' && isIncomingRequest && (
                    <Box>
                      <Typography variant="body2" gutterBottom>
                        This person has sent you a roommate request.
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                        <Button 
                          variant="contained" 
                          color="primary" 
                          size="small"
                          onClick={handleAcceptRequest}
                        >
                          Accept
                        </Button>
                        <Button 
                          variant="outlined" 
                          color="error" 
                          size="small"
                          onClick={handleRejectRequest}
                        >
                          Decline
                        </Button>
                      </Box>
                    </Box>
                  )}
                  
                  {matchRequest.status === 'pending' && isOutgoingRequest && (
                    <Box>
                      <Typography variant="body2" gutterBottom>
                        You've sent a roommate request.
                      </Typography>
                      <Button 
                        variant="outlined" 
                        color="error" 
                        size="small"
                        onClick={handleCancelRequest}
                        sx={{ mt: 1 }}
                      >
                        Cancel Request
                      </Button>
                    </Box>
                  )}
                  
                  {matchRequest.status === 'accepted' && (
                    <Box>
                      <Typography variant="body2" color="success.main" gutterBottom>
                        You are now roommates! Exchange contact information to proceed.
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        Contact: {user.email}
                      </Typography>
                    </Box>
                  )}
                  
                  {matchRequest.status === 'rejected' && (
                    <Typography variant="body2" color="error" gutterBottom>
                      The roommate request was declined.
                    </Typography>
                  )}
                </>
              ) : (
                <Box>
                  <Typography variant="body2" gutterBottom>
                    If you're interested in being roommates with {userProfile.first_name}, send a roommate request.
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="primary"
                    onClick={() => setMessageDialogOpen(true)}
                    // src/features/roommate-matching/RoommateDetail.tsx (continued)
                    sx={{ mt: 1 }}
                  >
                    Send Roommate Request
                  </Button>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
        
        {/* Lifestyle Preferences */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              About {userProfile.first_name}
            </Typography>
            
            <Typography variant="body1" paragraph>
              {userProfile.bio || `${userProfile.first_name} hasn't added a bio yet.`}
            </Typography>
            
            {userProfile.interests && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Interests
                </Typography>
                <Typography variant="body1" paragraph>
                  {userProfile.interests}
                </Typography>
              </Box>
            )}
          </Paper>
          
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Lifestyle Preferences
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <List>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar>
                        <SmokingRooms />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary="SmokingRooms" 
                      secondary={
                        roommate_profile.SmokingRooms_preference === 'yes' ? 'Smoker' : 
                        roommate_profile.SmokingRooms_preference === 'no' ? 'Non-smoker' : 
                        roommate_profile.SmokingRooms_preference === 'sometimes' ? 'Occasionally' :
                        'No preference'
                      } 
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar>
                        <LocalBar />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary="Drinking" 
                      secondary={
                        roommate_profile.drinking_preference === 'yes' ? 'Drinker' : 
                        roommate_profile.drinking_preference === 'no' ? 'Non-drinker' : 
                        roommate_profile.drinking_preference === 'sometimes' ? 'Occasionally' :
                        'No preference'
                      } 
                    />
                  </ListItem>
                </List>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <List>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar>
                        <NightsStay />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary="Sleep Habits" 
                      secondary={
                        roommate_profile.sleep_habits === 'early_riser' ? 'Early Riser' : 
                        roommate_profile.sleep_habits === 'night_owl' ? 'Night Owl' : 
                        'Average'
                      } 
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar>
                        <MenuBook />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary="Study Habits" 
                      secondary={
                        roommate_profile.study_habits === 'in_room' ? 'Studies in Room' : 
                        roommate_profile.study_habits === 'library' ? 'Studies in Library' : 
                        'Studies in Other Places'
                      } 
                    />
                  </ListItem>
                </List>
              </Grid>
              
              <Grid item xs={12}>
                <List>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar>
                        <People />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary="Guests Policy" 
                      secondary={
                        roommate_profile.guests_preference === 'yes' ? 'Welcomes Guests' : 
                        roommate_profile.guests_preference === 'no' ? 'Prefers No Guests' : 
                        roommate_profile.guests_preference === 'sometimes' ? 'Occasional Guests OK' :
                        'No preference'
                      } 
                    />
                  </ListItem>
                </List>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Message Dialog */}
      <Dialog open={messageDialogOpen} onClose={() => setMessageDialogOpen(false)}>
        <DialogTitle>Send Roommate Request to {userProfile.first_name}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" paragraph>
            Include a brief message with your request. Tell {userProfile.first_name} a bit about yourself and why you think you'd be good roommates.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Your Message"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMessageDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSendRequest} 
            color="primary"
            disabled={!message.trim() || sendingRequest}
          >
            {sendingRequest ? <CircularProgress size={24} /> : 'Send Request'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RoommateDetail;