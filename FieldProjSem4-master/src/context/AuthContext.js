import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Checking auth with token:', token ? 'Token exists' : 'No token');
      if (token) {
        console.log('Making request to /auth/me with token');
        const response = await authAPI.getCurrentUser();
        console.log('Auth check response:', response.data);
        setUser(response.data);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      console.log('Removing invalid token from localStorage');
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setError(null);
      console.log('Attempting login with credentials:', credentials);
      const response = await authAPI.login(credentials);
      console.log('Login response:', response.data);
      const { user, token } = response.data;
      console.log('Storing token in localStorage:', token ? 'Token received' : 'No token');
      localStorage.setItem('token', token);
      setUser(user);
      return user;
    } catch (error) {
      console.error('Login error:', error);
      setError(error.response?.data?.message || 'Login failed');
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      console.log('AuthContext: Attempting to register with data:', userData);
      const response = await authAPI.register(userData);
      console.log('AuthContext: Registration response:', response);
      const { user, token } = response.data;
      localStorage.setItem('token', token);
      setUser(user);
      return user;
    } catch (error) {
      console.error('AuthContext: Registration error:', error);
      const errorMessage = error.message || 'Registration failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 