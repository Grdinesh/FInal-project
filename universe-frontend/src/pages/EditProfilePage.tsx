// src/pages/EditProfilePage.tsx
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Container,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Avatar,
  SelectChangeEvent
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const EditProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [profileId, setProfileId] = useState<number | null>(null);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [formValues, setFormValues] = useState({
    first_name: '',
    last_name: '',
    age: '',
    gender: '',
    interests: '',
    course_major: '',
    bio: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Try to get the user's profile using the API
        const response = await axios.get('/api/profiles/me/');
        
        // Set profile data
        setProfileId(response.data.id);
        setFormValues({
          first_name: response.data.first_name || '',
          last_name: response.data.last_name || '',
          age: response.data.age?.toString() || '',
          gender: response.data.gender || '',
          interests: response.data.interests || '',
          course_major: response.data.course_major || '',
          bio: response.data.bio || ''
        });
        
        if (response.data.profile_picture) {
          setImagePreview(response.data.profile_picture);
        }
        
        setLoading(false);
      } catch (err: any) {
        // If profile doesn't exist, prefill with user data
        if (err.response?.status === 404) {
          setFormValues({
            first_name: user?.first_name || '',
            last_name: user?.last_name || '',
            age: '',
            gender: '',
            interests: '',
            course_major: '',
            bio: ''
          });
          setLoading(false);
        } else {
          setError('Failed to load profile data');
          setLoading(false);
        }
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value
    });
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value
    });
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setProfileImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const formData = new FormData();
    
    // Add form values to FormData
    Object.entries(formValues).forEach(([key, value]) => {
      if (value) {
        formData.append(key, value);
      }
    });
    
    // Add profile image if selected
    if (profileImage) {
      formData.append('profile_picture', profileImage);
    }

    try {
      let response;
      if (profileId) {
        // Update existing profile
        response = await axios.patch(`/api/profiles/update_me/`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        // Create new profile
        response = await axios.post('/api/profiles/me/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }
      
      setSubmitting(false);
      navigate('/profile');
    } catch (err: any) {
      setSubmitting(false);
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Failed to save profile. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          {profileId ? 'Edit Profile' : 'Create Profile'}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
              <Avatar
                src={imagePreview || undefined}
                alt="Profile Picture"
                sx={{ width: 150, height: 150, mx: 'auto', mb: 2 }}
              />
              <Button
                variant="outlined"
                component="label"
                sx={{ mt: 1 }}
              >
                Upload Picture
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </Button>
            </Grid>

            <Grid item xs={12} md={8}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="first_name"
                    name="first_name"
                    label="First Name"
                    value={formValues.first_name}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="last_name"
                    name="last_name"
                    label="Last Name"
                    value={formValues.last_name}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="age"
                    name="age"
                    label="Age"
                    type="number"
                    value={formValues.age}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel id="gender-label">Gender</InputLabel>
                    <Select
                      labelId="gender-label"
                      id="gender"
                      name="gender"
                      value={formValues.gender}
                      label="Gender"
                      onChange={handleSelectChange}
                    >
                      <MenuItem value="">Prefer not to say</MenuItem>
                      <MenuItem value="male">Male</MenuItem>
                      <MenuItem value="female">Female</MenuItem>
                      <MenuItem value="non-binary">Non-binary</MenuItem>
                      <MenuItem value="other">Other</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="course_major"
                    name="course_major"
                    label="Major"
                    value={formValues.course_major}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="interests"
                    name="interests"
                    label="Interests"
                    value={formValues.interests}
                    onChange={handleInputChange}
                    placeholder="Separate interests with commas"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="bio"
                    name="bio"
                    label="Bio"
                    multiline
                    rows={4}
                    value={formValues.bio}
                    onChange={handleInputChange}
                    placeholder="Tell others about yourself"
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12} sx={{ mt: 2, display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/profile')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={submitting}
              >
                {submitting ? <CircularProgress size={24} /> : 'Save Profile'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default EditProfilePage;