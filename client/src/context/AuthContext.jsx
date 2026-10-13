import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI, getAuthToken, clearAuthToken, onSessionExpired } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Restore session from token on initial app load
  const restoreSession = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await authAPI.getMe();
      if (response?.user) {
        setUser(response.user);
      } else {
        clearAuthToken();
        setUser(null);
      }
    } catch (err) {
      // Token is invalid, expired, or network unavailable
      clearAuthToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    restoreSession();

    // Subscribe to session expiration events from api interceptor
    const unsubscribe = onSessionExpired(() => {
      setUser(null);
      setAuthError('Your session has expired. Please log in again.');
    });

    return () => unsubscribe();
  }, [restoreSession]);

  const login = async (credentials) => {
    setAuthError(null);
    try {
      const data = await authAPI.login(credentials);
      setUser(data.user);
      return data;
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  };

  const register = async (credentials) => {
    setAuthError(null);
    try {
      const data = await authAPI.register(credentials);
      setUser(data.user);
      return data;
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  };

  const logout = () => {
    authAPI.logout();
    setUser(null);
    setAuthError(null);
  };

  const clearError = () => setAuthError(null);

  const value = {
    user,
    loading,
    authError,
    isAuthenticated: Boolean(user),
    login,
    register,
    logout,
    clearError,
    restoreSession
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
