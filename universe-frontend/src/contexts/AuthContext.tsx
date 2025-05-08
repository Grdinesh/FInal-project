// src/contexts/AuthContext.tsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import * as authService from '../services/auth';
import axios from 'axios';
interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

interface AuthContextProps {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const initAuth = async () => {
      if (authService.isAuthenticated()) {
        try {
          const user = await authService.getCurrentUser();
          setUser(user);
        } catch (error) {
          // Try to refresh the token
          try {
            await authService.refreshToken();
            const user = await authService.getCurrentUser();
            setUser(user);
          } catch (refreshError) {
            // If refresh fails, stay logged out
            authService.logout();
          }
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // const login = async (username: string, password: string) => {
  //   setLoading(true);
  //   setError(null);
  //   try {
  //     const loggedInUser = await authService.login(username, password);
  //     const user = loggedInUser.data;

  //     // ✅ Store user ID for later use
  //     try {
  //       localStorage.setItem('user_id', String(user.id));
  //       console.log("✅ Saved user_id:", user.id);
  //     } catch (e) {
  //       console.error("❌ Failed to save user_id to localStorage:", e);
  //     }
  //     // localStorage.setItem('user_id', user.id);
  //     setUser(loggedInUser);
      
  //     // setUser(user);
  //     navigate('/');
  //   } catch (err: any) {
  //     setError(err.message);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  
  const login = async (username: string, password: string) => {
    setLoading(true);
    setError(null);
  
    try {
      const response = await axios.post('/api/auth/login/', {
        username,
        password
      }, { withCredentials: true }); // Optional for cookies, safe to leave in
  
      console.log("Login response:", response.data);
  
      const user = response.data.user;
      const accessToken = response.data.access;
      const refreshToken = response.data.refresh;
  
      // ✅ Store tokens if needed later
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
  
      // ✅ Store user ID for match logic
      if (user?.id) {
        localStorage.setItem('user_id', String(user.id));
        setUser(user);
        navigate('/');
      } else {
        throw new Error("No user returned from backend.");
      }
  
    } catch (err: any) {
      console.error("Login error:", err);
      setError("Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };
  
  const register = async (username: string, email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const newUser = await authService.register(username, email, password);
      setUser(newUser);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    navigate('/login');
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};