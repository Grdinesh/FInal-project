// src/services/auth.ts
import axios from 'axios';

// Set axios defaults
axios.defaults.baseURL = 'http://localhost:8000';

// Add token to all requests if available
axios.interceptors.request.use(
  config => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

export const login = async (username: string, password: string) => {
  try {
    const response = await axios.post('/api/auth/login/', { 
      username, 
      password 
    });
    
    const { access, refresh, user } = response.data;
    
    // Store tokens in localStorage
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    
    // Set auth header for future requests
    axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
    
    return user;
  } catch (err: any) {
    const errorMessage = err.response?.data?.error || 'Login failed. Please try again.';
    throw new Error(errorMessage);
  }
};

export const register = async (username: string, email: string, password: string) => {
  try {
    const response = await axios.post('/api/auth/register/', { 
      username, 
      email, 
      password 
    });
    
    const { access, refresh, user } = response.data;
    
    // Store tokens in localStorage
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    
    // Set auth header for future requests
    axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
    
    return user;
  } catch (err: any) {
    const errorMessage = err.response?.data?.error || 'Registration failed. Please try again.';
    throw new Error(errorMessage);
  }
};

export const logout = () => {
  // Remove tokens from localStorage
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  
  // Remove auth header
  delete axios.defaults.headers.common['Authorization'];
};

export const getCurrentUser = async () => {
  try {
    const response = await axios.get('/api/auth/user-info/');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const refreshToken = async () => {
  try {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) throw new Error('No refresh token available');
    
    const response = await axios.post('/api/auth/token/refresh/', {
      refresh: refreshToken
    });
    
    const { access } = response.data;
    localStorage.setItem('access_token', access);
    axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
    
    return true;
  } catch (error) {
    // If refresh token is invalid or expired, logout
    logout();
    throw error;
  }
};

export const isAuthenticated = () => {
  return localStorage.getItem('access_token') !== null;
};