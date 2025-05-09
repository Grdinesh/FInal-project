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
                <Button variant="outlined" color="inherit" component={Link} to="/study-groups">
                  Study Groups
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
      <Grid container spacing={4} alignItems="stretch">
        {[
          {
            title: 'Roommate Matching',
            desc: 'Find the perfect roommate with our AI-driven matching system that considers lifestyle, habits, and preferences.',
            to: user ? "/roommate-matching" : "/login",
            button: 'Find Roommates',
          },
          {
            title: 'Marketplace',
            desc: 'Buy, sell, or exchange items with other students in a secure and convenient platform.',
            to: user ? "/marketplace" : "/login",
            button: 'Browse Marketplace',
          },
          {
            title: 'Housing Locator',
            desc: 'Discover the best housing options near campus that fit your budget and preferences.',
            to: user ? "/housing" : "/login",
            button: 'Find Housing',
          },
          {
            title: 'Study Groups',
            desc: 'Form or join study groups based on your courses and subjects of interest. Chat, collaborate, and learn together.',
            to: user ? "/study-groups" : "/login",
            button: 'Explore Groups',
          }
        ].map((feature, idx) => (
          <Grid item xs={12} sm={6} md={4} key={idx}>
            <Paper
              sx={{
                p: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Typography variant="h5" component="h2" gutterBottom>
                {feature.title}
              </Typography>
              <Typography variant="body1" paragraph>
                {feature.desc}
              </Typography>
              <Button component={Link} to={feature.to} sx={{ mt: 'auto' }}>
                {feature.button}
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
    </Box>
  );
};

export default HomePage;