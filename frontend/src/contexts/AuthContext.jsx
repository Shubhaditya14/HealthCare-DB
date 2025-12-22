import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../utils/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      const storedUser = localStorage.getItem('user');
      const accessToken = localStorage.getItem('access_token');

      if (storedUser && accessToken) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setIsAuthenticated(true);
        } catch (e) {
          // Invalid stored user, clear everything
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = useCallback(async (email, password, userType) => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await authAPI.login(email, password, userType);
      const { access_token, refresh_token, user: userData } = response.data;

      // Store tokens and user data
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      localStorage.setItem('user', JSON.stringify(userData));

      setUser(userData);
      setIsAuthenticated(true);
      setIsLoading(false);

      return { success: true, user: userData };
    } catch (err) {
      setIsLoading(false);
      const errorMessage = err.response?.data?.message || 'Login failed. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  const register = useCallback(async (userData, userType) => {
    setError(null);
    setIsLoading(true);

    try {
      const endpoint = userType === 'patient' ? '/patients/register' : '/doctors/register';
      const { default: api } = await import('../utils/api');
      const response = await api.post(endpoint, userData);

      const { access_token, refresh_token, user: registeredUser } = response.data;

      // Store tokens and user data
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      localStorage.setItem('user', JSON.stringify(registeredUser));

      setUser(registeredUser);
      setIsAuthenticated(true);
      setIsLoading(false);

      return { success: true, user: registeredUser };
    } catch (err) {
      setIsLoading(false);
      const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.';
      const fieldErrors = err.response?.data?.errors || {};
      setError(errorMessage);
      return { success: false, error: errorMessage, fieldErrors };
    }
  }, []);

  const logout = useCallback(() => {
    // Clear all stored data
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');

    setUser(null);
    setIsAuthenticated(false);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
