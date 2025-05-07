// src/pages/HomePage.tsx
import React from 'react';
import { Box, Typography, Button, Container, Grid, Paper } from '@mui/material';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Import the auth context

const HomePage: React.FC = () => {
  const { user } = useAuth(); // Get the current user from auth context
  
  return (
    <Box>
      {/* Hero section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          pt: 8,
          pb: 6,
        }}
      >
        <Container maxWidth="sm">
          <Typography
            component="h1"
            variant="h2"
            align="center"
            gutterBottom
          >
            UniVerse
          </Typography>
          <Typography variant="h5" align="center" paragraph>
            Harnessing AI to Revolutionize and Connect Campus Life
          </Typography>
          
          {/* Show different buttons based on authentication state */}
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
            {user ? (
              // User is logged in - show relevant action buttons
              <>
                <Button variant="contained" color="secondary" component={Link} to="/marketplace">
                  Marketplace
                </Button>
                <Button variant="outlined" color="inherit" component={Link} to="/roommate-matching">
                  Find Roommates
                </Button>
              </>
            ) : (
              // User is not logged in - show login/register buttons
              <>
                <Button variant="contained" color="secondary" component={Link} to="/register">
                  Get Started
                </Button>
                <Button variant="outlined" color="inherit" component={Link} to="/login">
                  Login
                </Button>
              </>
            )}
          </Box>
        </Container>
      </Box>

      {/* Features section */}
      <Container sx={{ py: 8 }} maxWidth="md">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={4}>
            <Paper
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                height: 240,
              }}
            >
              <Typography variant="h5" component="h2" gutterBottom>
                Roommate Matching
              </Typography>
              <Typography variant="body1" paragraph>
                Find the perfect roommate with our AI-driven matching system that considers lifestyle, habits, and preferences.
              </Typography>
              <Button 
                component={Link} 
                to={user ? "/roommate-matching" : "/login"} 
                sx={{ mt: 'auto' }}
              >
                Find Roommates
              </Button>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Paper
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                height: 240,
              }}
            >
              <Typography variant="h5" component="h2" gutterBottom>
                Marketplace
              </Typography>
              <Typography variant="body1" paragraph>
                Buy, sell, or exchange items with other students in a secure and convenient platform.
              </Typography>
              <Button 
                component={Link} 
                to={user ? "/marketplace" : "/login"} 
                sx={{ mt: 'auto' }}
              >
                Browse Marketplace
              </Button>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Paper
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                height: 240,
              }}
            >
              <Typography variant="h5" component="h2" gutterBottom>
                Housing Locator
              </Typography>
              <Typography variant="body1" paragraph>
                Discover the best housing options near campus that fit your budget and preferences.
              </Typography>
              <Button 
                component={Link} 
                to={user ? "/housing" : "/login"} 
                sx={{ mt: 'auto' }}
              >
                Find Housing
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default HomePage;