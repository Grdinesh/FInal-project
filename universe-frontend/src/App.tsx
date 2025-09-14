// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, CircularProgress } from '@mui/material';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import EditProfilePage from './pages/EditProfilePage';

// Marketplace
import MarketplaceList from './features/marketplace/MarketplaceList';
import MarketplaceItemDetail from './features/marketplace/MarketplaceItemDetail';
import MarketplaceItemForm from './features/marketplace/MarketplaceItemForm';

// Roommate Matching
import RoommateList from './features/roommate-matching/RoommateList';
import RoommateDetail from './features/roommate-matching/RoommateDetail';
import RoommateProfileForm from './features/roommate-matching/RoommateProfileForm';

// Study-Groups
import StudyGroupList from './features/study-groups/StudyGroupList';
import SuggestedGroups from './features/study-groups/SuggestedGroups';
import StudyGroupForm from './features/study-groups/StudyGroupForm';
import StudyGroupDetail from './features/study-groups/StudyGroupDetail';
// Auth Context
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { HousingDetail, HousingForm, HousingList } from './features/housing';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return user ? <>{children}</> : <Navigate to="/login" />;
};

const theme = createTheme({
  palette: {
    primary: { 
      main: '#6366f1',
      light: '#818cf8',
      dark: '#4f46e5',
      contrastText: '#ffffff'
    },
    secondary: { 
      main: '#ec4899',
      light: '#f472b6',
      dark: '#db2777',
      contrastText: '#ffffff'
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff'
    },
    text: {
      primary: '#1e293b',
      secondary: '#64748b'
    },
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669'
    },
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706'
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626'
    }
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.2
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
      lineHeight: 1.3
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.4
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.4
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.125rem',
      lineHeight: 1.4
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
      lineHeight: 1.4
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6
    }
  },
  shape: {
    borderRadius: 12
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
          padding: '8px 16px'
        },
        contained: {
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          '&:hover': {
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
          }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          borderRadius: 12,
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            transform: 'translateY(-2px)'
          }
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8
          }
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6
        }
      }
    }
  }
});

function AppContent() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Routes */}
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/profile/edit" element={<ProtectedRoute><EditProfilePage /></ProtectedRoute>} />

        {/* Marketplace */}
        <Route path="/marketplace" element={<ProtectedRoute><MarketplaceList /></ProtectedRoute>} />
        <Route path="/marketplace/:id" element={<ProtectedRoute><MarketplaceItemDetail /></ProtectedRoute>} />
        <Route path="/marketplace/create" element={<ProtectedRoute><MarketplaceItemForm /></ProtectedRoute>} />
        <Route path="/marketplace/edit/:id" element={<ProtectedRoute><MarketplaceItemForm /></ProtectedRoute>} />

        {/* Roommate Matching */}
        <Route path="/roommate-matching" element={<ProtectedRoute><RoommateList /></ProtectedRoute>} />
        <Route path="/roommate-matching/:id" element={<ProtectedRoute><RoommateDetail /></ProtectedRoute>} />
        <Route path="/roommate-matching/preferences" element={<ProtectedRoute><RoommateProfileForm /></ProtectedRoute>} />

        {/* Housing locator */}
        <Route path="/housing" element={<ProtectedRoute><HousingList /></ProtectedRoute>} />
        <Route path="/housing/create" element={<ProtectedRoute><HousingForm /></ProtectedRoute>} />
        <Route path="/housing/:id" element={<ProtectedRoute><HousingDetail /></ProtectedRoute>} />
        <Route path="/housing/edit/:id" element={<ProtectedRoute><HousingForm /></ProtectedRoute>} />

        {/* StudyGroups */}
        <Route path="/study-groups" element={<ProtectedRoute><StudyGroupList /></ProtectedRoute>} />
        <Route path="/study-groups/suggested" element={<ProtectedRoute><SuggestedGroups /></ProtectedRoute>} />
        <Route path="/study-groups/create" element={<ProtectedRoute><StudyGroupForm /></ProtectedRoute>} />
        <Route path="/study-groups/:id" element={<ProtectedRoute><StudyGroupDetail /></ProtectedRoute>} />
        {/* 404 */}
        <Route path="*" element={<div>Page not found</div>} />
      </Routes>
      <Footer />
    </ThemeProvider>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
