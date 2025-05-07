// src/components/Footer.tsx
import React from 'react';
import { Box, Typography, Container, Link } from '@mui/material';

const Footer: React.FC = () => {
  return (
    <Box component="footer" sx={{ bgcolor: 'background.paper', py: 6, mt: 'auto' }}>
      <Container maxWidth="lg">
        <Typography variant="h6" align="center" gutterBottom>
          UniVerse
        </Typography>
        <Typography
          variant="subtitle1"
          align="center"
          color="text.secondary"
          component="p"
        >
          Connecting campus life through AI
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center">
          {'© '}
          <Link color="inherit" href="#">
            UniVerse
          </Link>{' '}
          {new Date().getFullYear()}
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;