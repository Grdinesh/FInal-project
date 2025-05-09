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
    primary: { main: '#1976d2' },
    secondary: { main: '#f50057' },
  },
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
