// src/pages/HomePage.tsx
import React from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Container, 
  Grid, 
  Paper, 
  Card,
  CardContent,
  CardActions,
  Chip,
  useTheme,
  useMediaQuery,
  Fade,
  Slide
} from '@mui/material';
import { 
  ShoppingCart, 
  People, 
  Home, 
  School,
  TrendingUp,
  Security,
  Speed,
  Support
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  return (
    <Box>
      {/* Hero section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          pt: { xs: 6, md: 12 },
          pb: { xs: 6, md: 8 },
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            animation: 'float 20s ease-in-out infinite'
          }
        }}
      >
        <Container maxWidth="lg">
          <Fade in timeout={1000}>
            <Box sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
              <Typography
                component="h1"
                variant={isMobile ? "h3" : "h2"}
                sx={{
                  fontWeight: 800,
                  mb: 2,
                  background: 'linear-gradient(45deg, #ffffff 30%, #f0f9ff 90%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                Welcome to UniVerse
              </Typography>
              <Typography 
                variant={isMobile ? "h6" : "h5"} 
                sx={{ 
                  mb: 4, 
                  opacity: 0.95,
                  maxWidth: '600px',
                  mx: 'auto',
                  lineHeight: 1.6
                }}
              >
                Harnessing AI to Revolutionize and Connect Campus Life
              </Typography>
              
              {/* Stats */}
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, mb: 4, flexWrap: 'wrap' }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#f0f9ff' }}>500+</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>Active Students</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#f0f9ff' }}>1000+</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>Items Sold</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#f0f9ff' }}>50+</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>Study Groups</Typography>
                </Box>
              </Box>
              
              {/* CTA Buttons */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                gap: 2, 
                flexWrap: 'wrap',
                mt: 4
              }}>
                {user ? (
                  <>
                    <Button 
                      variant="contained" 
                      size="large"
                      component={Link} 
                      to="/marketplace"
                      startIcon={<ShoppingCart />}
                      sx={{ 
                        px: 4,
                        py: 1.5,
                        borderRadius: 3,
                        background: 'linear-gradient(45deg, #ec4899 30%, #f472b6 90%)',
                        boxShadow: '0 4px 15px rgba(236, 72, 153, 0.4)',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 6px 20px rgba(236, 72, 153, 0.6)'
                        }
                      }}
                    >
                      Browse Marketplace
                    </Button>
                    <Button 
                      variant="outlined" 
                      size="large"
                      component={Link} 
                      to="/roommate-matching"
                      startIcon={<People />}
                      sx={{ 
                        px: 4,
                        py: 1.5,
                        borderRadius: 3,
                        borderColor: 'rgba(255, 255, 255, 0.5)',
                        color: 'white',
                        '&:hover': {
                          borderColor: 'white',
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          transform: 'translateY(-2px)'
                        }
                      }}
                    >
                      Find Roommates
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      variant="contained" 
                      size="large"
                      component={Link} 
                      to="/register"
                      sx={{ 
                        px: 4,
                        py: 1.5,
                        borderRadius: 3,
                        background: 'linear-gradient(45deg, #ec4899 30%, #f472b6 90%)',
                        boxShadow: '0 4px 15px rgba(236, 72, 153, 0.4)',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 6px 20px rgba(236, 72, 153, 0.6)'
                        }
                      }}
                    >
                      Get Started Free
                    </Button>
                    <Button 
                      variant="outlined" 
                      size="large"
                      component={Link} 
                      to="/login"
                      sx={{ 
                        px: 4,
                        py: 1.5,
                        borderRadius: 3,
                        borderColor: 'rgba(255, 255, 255, 0.5)',
                        color: 'white',
                        '&:hover': {
                          borderColor: 'white',
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          transform: 'translateY(-2px)'
                        }
                      }}
                    >
                      Sign In
                    </Button>
                  </>
                )}
              </Box>
            </Box>
          </Fade>
        </Container>
      </Box>

      {/* Features section */}
      <Container sx={{ py: { xs: 6, md: 10 } }} maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>
            Everything You Need for Campus Life
          </Typography>
          <Typography variant="h6" sx={{ color: 'text.secondary', maxWidth: '600px', mx: 'auto' }}>
            Our comprehensive platform brings together all the tools and services you need to thrive in university life
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {[
            {
              title: 'Roommate Matching',
              desc: 'Find the perfect roommate with our AI-driven matching system that considers lifestyle, habits, and preferences.',
              to: user ? "/roommate-matching" : "/login",
              button: 'Find Roommates',
              icon: <People sx={{ fontSize: 40, color: 'primary.main' }} />,
              color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              features: ['AI-Powered Matching', 'Lifestyle Compatibility', 'Secure Messaging']
            },
            {
              title: 'Marketplace',
              desc: 'Buy, sell, or exchange items with other students in a secure and convenient platform.',
              to: user ? "/marketplace" : "/login",
              button: 'Browse Marketplace',
              icon: <ShoppingCart sx={{ fontSize: 40, color: 'secondary.main' }} />,
              color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              features: ['Secure Transactions', 'Easy Listings', 'Campus Delivery']
            },
            {
              title: 'Housing Locator',
              desc: 'Discover the best housing options near campus that fit your budget and preferences.',
              to: user ? "/housing" : "/login",
              button: 'Find Housing',
              icon: <Home sx={{ fontSize: 40, color: 'success.main' }} />,
              color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              features: ['Verified Listings', 'Budget Filters', 'Location Maps']
            },
            {
              title: 'Study Groups',
              desc: 'Form or join study groups based on your courses and subjects of interest. Chat, collaborate, and learn together.',
              to: user ? "/study-groups" : "/login",
              button: 'Explore Groups',
              icon: <School sx={{ fontSize: 40, color: 'warning.main' }} />,
              color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
              features: ['Course-Based Groups', 'Real-time Chat', 'Study Schedules']
            }
          ].map((feature, idx) => (
            <Grid item xs={12} sm={6} lg={3} key={idx}>
              <Slide direction="up" in timeout={800 + idx * 200}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      '& .feature-icon': {
                        transform: 'scale(1.1) rotate(5deg)'
                      }
                    }
                  }}
                >
                  <Box
                    sx={{
                      height: 120,
                      background: feature.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(10px)'
                      }
                    }}
                  >
                    <Box 
                      className="feature-icon"
                      sx={{ 
                        transition: 'all 0.3s ease',
                        zIndex: 1
                      }}
                    >
                      {feature.icon}
                    </Box>
                  </Box>
                  
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph sx={{ mb: 2 }}>
                      {feature.desc}
                    </Typography>
                    
                    <Box sx={{ mb: 2 }}>
                      {feature.features.map((feat, featIdx) => (
                        <Chip
                          key={featIdx}
                          label={feat}
                          size="small"
                          sx={{ 
                            mr: 1, 
                            mb: 1,
                            backgroundColor: 'rgba(99, 102, 241, 0.1)',
                            color: 'primary.main',
                            fontWeight: 500
                          }}
                        />
                      ))}
                    </Box>
                  </CardContent>
                  
                  <CardActions sx={{ p: 3, pt: 0 }}>
                    <Button 
                      component={Link} 
                      to={feature.to} 
                      variant="contained"
                      fullWidth
                      sx={{
                        borderRadius: 2,
                        py: 1,
                        fontWeight: 600,
                        background: feature.color,
                        '&:hover': {
                          transform: 'translateY(-1px)',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                        }
                      }}
                    >
                      {feature.button}
                    </Button>
                  </CardActions>
                </Card>
              </Slide>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Why Choose Us Section */}
      <Box sx={{ bgcolor: 'grey.50', py: { xs: 6, md: 10 } }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>
              Why Choose UniVerse?
            </Typography>
            <Typography variant="h6" sx={{ color: 'text.secondary', maxWidth: '600px', mx: 'auto' }}>
              We're committed to making your university experience seamless and enjoyable
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {[
              {
                icon: <Security sx={{ fontSize: 48, color: 'primary.main' }} />,
                title: 'Secure & Safe',
                desc: 'Your data and transactions are protected with enterprise-grade security'
              },
              {
                icon: <Speed sx={{ fontSize: 48, color: 'secondary.main' }} />,
                title: 'Lightning Fast',
                desc: 'Experience blazing fast performance with our optimized platform'
              },
              {
                icon: <Support sx={{ fontSize: 48, color: 'success.main' }} />,
                title: '24/7 Support',
                desc: 'Get help whenever you need it with our dedicated support team'
              }
            ].map((item, idx) => (
              <Grid item xs={12} md={4} key={idx}>
                <Fade in timeout={1000 + idx * 200}>
                  <Box sx={{ textAlign: 'center', p: 3 }}>
                    <Box sx={{ mb: 2 }}>
                      {item.icon}
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                      {item.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {item.desc}
                    </Typography>
                  </Box>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;