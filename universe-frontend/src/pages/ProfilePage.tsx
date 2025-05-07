// src/pages/ProfilePage.tsx
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Container, 
  Grid, 
  Button, 
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert
} from '@mui/material';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

interface UserProfile {
  id: number;
  user: {
    id: number;
    username: string;
    email: string;
  };
  first_name: string;
  last_name: string;
  age: number | null;
  gender: string;
  interests: string;
  course_major: string;
  bio: string;
  profile_picture: string | null;
  date_joined: string;
}

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('/api/profiles/me/');
        setProfile(response.data);
        setLoading(false);
      } catch (err: any) {
        if (err.response?.status === 404) {
          // Profile doesn't exist yet
          setLoading(false);
        } else {
          setError('Failed to load profile');
          setLoading(false);
        }
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!profile) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Profile Not Found
          </Typography>
          <Typography paragraph>
            You haven't set up your profile yet.
          </Typography>
          <Button 
            variant="contained" 
            color="primary"
            component={Link}
            to="/profile/edit"
          >
            Create Profile
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
            <Avatar
              src={profile.profile_picture || undefined}
              alt={`${profile.first_name} ${profile.last_name}`}
              sx={{ width: 150, height: 150, mx: 'auto', mb: 2 }}
            />
            <Typography variant="h5" gutterBottom>
              {profile.first_name} {profile.last_name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              @{profile.user.username}
            </Typography>
            <Button 
              variant="outlined" 
              sx={{ mt: 2 }}
              component={Link}
              to="/profile/edit"
            >
              Edit Profile
            </Button>
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Typography variant="h6" gutterBottom>
              About Me
            </Typography>
            <Typography paragraph>
              {profile.bio || "No bio provided."}
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            <List>
              {profile.age && (
                <ListItem>
                  <ListItemText primary="Age" secondary={profile.age} />
                </ListItem>
              )}
              {profile.gender && (
                <ListItem>
                  <ListItemText primary="Gender" secondary={profile.gender} />
                </ListItem>
              )}
              {profile.course_major && (
                <ListItem>
                  <ListItemText primary="Major" secondary={profile.course_major} />
                </ListItem>
              )}
              {profile.interests && (
                <ListItem>
                  <ListItemText primary="Interests" secondary={profile.interests} />
                </ListItem>
              )}
              <ListItem>
                <ListItemText 
                  primary="Member Since" 
                  secondary={new Date(profile.date_joined).toLocaleDateString()} 
                />
              </ListItem>
            </List>
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button 
                variant="contained" 
                color="primary"
                component={Link}
                to="/roommate-matching/preferences"
              >
                Manage Roommate Preferences
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default ProfilePage;