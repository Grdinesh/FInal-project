// src/components/Footer.tsx
import React from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Link, 
  Grid, 
  IconButton,
  Divider
} from '@mui/material';
import { 
  School, 
  Facebook, 
  Twitter, 
  Instagram, 
  LinkedIn,
  Email,
  Phone,
  LocationOn
} from '@mui/icons-material';

const Footer: React.FC = () => {
  return (
    <Box 
      component="footer" 
      sx={{ 
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
        color: 'white',
        py: 8, 
        mt: 'auto'
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Brand Section */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <School sx={{ fontSize: 32, mr: 1, color: '#6366f1' }} />
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                UniVerse
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ mb: 3, opacity: 0.9, lineHeight: 1.6 }}>
              Connecting campus life through AI-powered solutions. Your one-stop platform for 
              everything university-related.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton sx={{ color: 'white', '&:hover': { color: '#6366f1' } }}>
                <Facebook />
              </IconButton>
              <IconButton sx={{ color: 'white', '&:hover': { color: '#6366f1' } }}>
                <Twitter />
              </IconButton>
              <IconButton sx={{ color: 'white', '&:hover': { color: '#6366f1' } }}>
                <Instagram />
              </IconButton>
              <IconButton sx={{ color: 'white', '&:hover': { color: '#6366f1' } }}>
                <LinkedIn />
              </IconButton>
            </Box>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Quick Links
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="/marketplace" color="inherit" sx={{ textDecoration: 'none', opacity: 0.8, '&:hover': { opacity: 1, color: '#6366f1' } }}>
                Marketplace
              </Link>
              <Link href="/roommate-matching" color="inherit" sx={{ textDecoration: 'none', opacity: 0.8, '&:hover': { opacity: 1, color: '#6366f1' } }}>
                Roommate Matching
              </Link>
              <Link href="/housing" color="inherit" sx={{ textDecoration: 'none', opacity: 0.8, '&:hover': { opacity: 1, color: '#6366f1' } }}>
                Housing
              </Link>
              <Link href="/study-groups" color="inherit" sx={{ textDecoration: 'none', opacity: 0.8, '&:hover': { opacity: 1, color: '#6366f1' } }}>
                Study Groups
              </Link>
            </Box>
          </Grid>

          {/* Support */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Support
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="/help" color="inherit" sx={{ textDecoration: 'none', opacity: 0.8, '&:hover': { opacity: 1, color: '#6366f1' } }}>
                Help Center
              </Link>
              <Link href="/contact" color="inherit" sx={{ textDecoration: 'none', opacity: 0.8, '&:hover': { opacity: 1, color: '#6366f1' } }}>
                Contact Us
              </Link>
              <Link href="/privacy" color="inherit" sx={{ textDecoration: 'none', opacity: 0.8, '&:hover': { opacity: 1, color: '#6366f1' } }}>
                Privacy Policy
              </Link>
              <Link href="/terms" color="inherit" sx={{ textDecoration: 'none', opacity: 0.8, '&:hover': { opacity: 1, color: '#6366f1' } }}>
                Terms of Service
              </Link>
            </Box>
          </Grid>

          {/* Contact Info */}
          <Grid item xs={12} md={3}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Contact Info
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Email sx={{ fontSize: 20, opacity: 0.8 }} />
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  support@universe.edu
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Phone sx={{ fontSize: 20, opacity: 0.8 }} />
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  +1 (555) 123-4567
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOn sx={{ fontSize: 20, opacity: 0.8 }} />
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  University Campus, CA
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, borderColor: 'rgba(255, 255, 255, 0.1)' }} />

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            © {new Date().getFullYear()} UniVerse. All rights reserved. Made with ❤️ for students.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;