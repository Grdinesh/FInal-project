// src/features/roommate-matching/RoommateList.tsx
import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Grid, Card, CardContent, CardMedia, 
  CardActions, Button, Chip, CircularProgress, Slider,
  FormControl, InputLabel, Select, MenuItem, TextField,
  Pagination, Divider, Rating 
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MatchProfile } from './types';

const RoommateList: React.FC = () => {
  const navigate = useNavigate();
  const [matches, setMatches] = useState<MatchProfile[]>([]);
  const [filteredMatches, setFilteredMatches] = useState<MatchProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [minScore, setMinScore] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filters, setFilters] = useState({
    sleepHabits: '',
    studyHabits: '',
    SmokingRoomsPreference: '',
    drinkingPreference: '',
    guestsPreference: '',
  });
  
  const ITEMS_PER_PAGE = 8;
  
  useEffect(() => {
    fetchMatches();
  }, []);
  
  useEffect(() => {
    applyFilters();
  }, [matches, minScore, searchTerm, filters]);
  
  const fetchMatches = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/roommate-matches/');
      setMatches(response.data);
      setFilteredMatches(response.data);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError('Failed to fetch roommate matches');
      console.error('Error fetching matches:', err);
    }
  };
  
  const applyFilters = () => {
    let result = [...matches];
    
    // Filter by compatibility score
    result = result.filter(match => match.compatibility_score >= minScore);
    
    // Filter by search term (name, bio, interests, major)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(match => 
        `${match.profile.first_name} ${match.profile.last_name}`.toLowerCase().includes(term) ||
        match.profile.bio.toLowerCase().includes(term) ||
        match.profile.interests.toLowerCase().includes(term) ||
        match.profile.course_major.toLowerCase().includes(term)
      );
    }
    
    // Filter by roommate preferences
    if (filters.sleepHabits) {
      result = result.filter(match => match.roommate_profile.sleep_habits === filters.sleepHabits);
    }
    if (filters.studyHabits) {
      result = result.filter(match => match.roommate_profile.study_habits === filters.studyHabits);
    }
    if (filters.SmokingRoomsPreference) {
      result = result.filter(match => match.roommate_profile.SmokingRooms_preference === filters.SmokingRoomsPreference);
    }
    if (filters.drinkingPreference) {
      result = result.filter(match => match.roommate_profile.drinking_preference === filters.drinkingPreference);
    }
    if (filters.guestsPreference) {
      result = result.filter(match => match.roommate_profile.guests_preference === filters.guestsPreference);
    }
    
    setFilteredMatches(result);
    setPage(1); // Reset to first page when filters change
  };
  
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };
  
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };
  
  const sendMatchRequest = async (receiverId: number) => {
    try {
      console.log('Sending match request to receiverId:', receiverId);
      console.log('Type of receiverId:', typeof receiverId);
      
      // Make sure receiverId is a number
      const numericReceiverId = Number(receiverId);
      
      const requestData = {
        receiver: numericReceiverId,
        message: 'I would like to connect as potential roommates!'
      };
      
      console.log('Request data being sent:', JSON.stringify(requestData));
      
      // Add headers for debugging
      const response = await axios.post('/api/match-requests/', requestData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Match request successful, response:', response.data);
      
      // Update UI
      setMatches(prev => 
        prev.map(match => 
          match.user.id === numericReceiverId 
            ? { ...match, match_status: 'pending' } 
            : match
        )
      );
      
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.error('Axios error details:');
        console.error('Status:', err.response?.status);
        console.error('Response data:', JSON.stringify(err.response?.data));
        console.error('Response headers:', err.response?.headers);
        console.error('Request config:', err.config);
        
        // Display error to user
        const errorMessage = err.response?.data?.error || 
                            err.response?.data?.detail || 
                            'Failed to send roommate request';
        alert(errorMessage);
      } else {
        console.error('Non-Axios error:', err);
        alert('An unexpected error occurred');
      }
    }
  };
  const cancelMatchRequest = async (matchId: number) => {
    try {
      await axios.delete(`/api/match-requests/${matchId}/`);
      
      // Update the local state
      fetchMatches();
    } catch (err) {
      console.error('Error canceling match request:', err);
    }
  };
  
  const getPageItems = () => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredMatches.slice(startIndex, endIndex);
  };
  
  const totalPages = Math.ceil(filteredMatches.length / ITEMS_PER_PAGE);
  const pageItems = getPageItems();
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Find Your Perfect Roommate
      </Typography>
      
      {/* Filters Section */}
      <Box sx={{ mb: 4, p: 3, bgcolor: 'background.paper', borderRadius: 1 }}>
        <Typography variant="h6" gutterBottom>
          Filters
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography gutterBottom>
                Minimum Compatibility Score: {minScore}%
              </Typography>
              <Slider
                value={minScore}
                onChange={(_, newValue) => setMinScore(newValue as number)}
                aria-labelledby="compatibility-score-slider"
                valueLabelDisplay="auto"
                sx={{ ml: 3, flexGrow: 1 }}
              />
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Sleep Habits</InputLabel>
              <Select
                value={filters.sleepHabits}
                label="Sleep Habits"
                onChange={(e) => handleFilterChange('sleepHabits', e.target.value)}
              >
                <MenuItem value="">Any</MenuItem>
                <MenuItem value="early_riser">Early Riser</MenuItem>
                <MenuItem value="night_owl">Night Owl</MenuItem>
                <MenuItem value="average">Average</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Study Habits</InputLabel>
              <Select
                value={filters.studyHabits}
                label="Study Habits"
                onChange={(e) => handleFilterChange('studyHabits', e.target.value)}
              >
                <MenuItem value="">Any</MenuItem>
                <MenuItem value="in_room">In Room</MenuItem>
                <MenuItem value="library">Library</MenuItem>
                <MenuItem value="other_places">Other Places</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>SmokingRooms</InputLabel>
              <Select
                value={filters.SmokingRoomsPreference}
                label="SmokingRooms"
                onChange={(e) => handleFilterChange('SmokingRoomsPreference', e.target.value)}
              >
                <MenuItem value="">Any</MenuItem>
                <MenuItem value="yes">Yes</MenuItem>
                <MenuItem value="no">No</MenuItem>
                <MenuItem value="sometimes">Sometimes</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Drinking</InputLabel>
              <Select
                value={filters.drinkingPreference}
                label="Drinking"
                onChange={(e) => handleFilterChange('drinkingPreference', e.target.value)}
              >
                <MenuItem value="">Any</MenuItem>
                <MenuItem value="yes">Yes</MenuItem>
                <MenuItem value="no">No</MenuItem>
                <MenuItem value="sometimes">Sometimes</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Guests</InputLabel>
              <Select
                value={filters.guestsPreference}
                label="Guests"
                onChange={(e) => handleFilterChange('guestsPreference', e.target.value)}
              >
                <MenuItem value="">Any</MenuItem>
                <MenuItem value="yes">Yes</MenuItem>
                <MenuItem value="no">No</MenuItem>
                <MenuItem value="sometimes">Sometimes</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Search by name, interests, or major"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
              }}
              size="small"
            />
          </Grid>
        </Grid>
      </Box>
      
      {/* Results Count */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1">
          Found {filteredMatches.length} potential roommates
        </Typography>
      </Box>
      
      {/* Roommate Cards */}
      {filteredMatches.length === 0 ? (
        <Typography>No roommates match your criteria. Try adjusting your filters.</Typography>
      ) : (
        <>
          <Grid container spacing={3}>
            {pageItems.map((match) => (
              <Grid item key={match.user.id} xs={12} sm={6} md={4} lg={3}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ position: 'relative' }}>
                    <CardMedia
                      component="img"
                      height="180"
                      image={match.profile.profile_picture || '/default-profile.jpg'}
                      alt={`${match.profile.first_name} ${match.profile.last_name}`}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        bgcolor: 'primary.main',
                        color: 'white',
                        borderRadius: 10,
                        padding: '4px 12px',
                        fontWeight: 'bold',
                      }}
                    >
                      {match.compatibility_score}% Match
                    </Box>
                  </Box>
                  
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" gutterBottom>
                      {match.profile.first_name} {match.profile.last_name}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {match.profile.age ? `${match.profile.age} years • ` : ''}
                      {match.profile.gender || 'Not specified'}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Major: {match.profile.course_major || 'Not specified'}
                    </Typography>
                    
                    <Divider sx={{ my: 1 }} />
                    
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="subtitle2" component="span">
                        Cleanliness: 
                      </Typography>
                      <Rating 
                        value={match.roommate_profile.cleanliness_level} 
                        readOnly 
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    </Box>
                    
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                      <Chip 
                        label={match.roommate_profile.sleep_habits === 'early_riser' ? 'Early Riser' : 
                              match.roommate_profile.sleep_habits === 'night_owl' ? 'Night Owl' : 'Average Sleeper'}
                        size="small"
                      />
                      <Chip 
                        label={match.roommate_profile.SmokingRooms_preference === 'yes' ? 'Smoker' : 
                              match.roommate_profile.SmokingRooms_preference === 'no' ? 'Non-Smoker' : 'Occasional Smoker'}
                        size="small"
                      />
                    </Box>
                    
                    <Typography variant="body2" noWrap sx={{ mb: 1 }}>
                      {match.profile.bio.substring(0, 50)}
                      {match.profile.bio.length > 50 ? '...' : ''}
                    </Typography>
                  </CardContent>
                  
                  <CardActions>
                    <Button 
                      size="small" 
                      color="primary"
                      onClick={() => navigate(`/roommate-matching/${match.user.id}`)}
                    >
                      View Profile
                    </Button>
                    
                    {match.match_status === 'none' && (
                      <Button 
                        size="small" 
                        color="primary"
                        onClick={() => sendMatchRequest(match.user.id)}
                      >
                        Send Request
                      </Button>
                    )}
                    
                    {match.match_status === 'pending' && (
                      <Chip 
                        label="Request Sent" 
                        color="secondary" 
                        size="small"
                      />
                    )}
                    
                    {match.match_status === 'accepted' && (
                      <Chip 
                        label="Matched" 
                        color="success" 
                        size="small"
                      />
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination 
                count={totalPages} 
                page={page} 
                onChange={handlePageChange} 
                color="primary" 
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default RoommateList;