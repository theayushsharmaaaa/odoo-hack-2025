// src/context/AuthContext.js (Updated for custom backend)
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token')); // Get token from local storage
  const [loading, setLoading] = useState(true); // Still useful for initial load

  // Base URL for your backend API
  const API_BASE_URL = 'http://localhost:5000/api';

  // Function to save token and user data to local storage
  const saveAuthData = (newToken, userData) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
  };

  // Function to clear auth data from local storage
  const clearAuthData = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  // On initial load, try to load user from local storage if a token exists
  useEffect(() => {
    const loadUserFromStorage = () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setToken(storedToken);
          setUser(userData);
        } catch (e) {
          console.error("Failed to parse user data from local storage", e);
          clearAuthData(); // Clear corrupted data
        }
      }
      setLoading(false);
    };

    loadUserFromStorage();
  }, []);

  // Function to handle user login
  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }

      saveAuthData(data.token, data.user);
      return data.user; // Return user data on successful login
    } catch (error) {
      console.error('Login error:', error);
      throw error; // Re-throw to be caught by components
    }
  };

  // Function to handle user registration
  const register = async ({ name, email, password }) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      saveAuthData(data.token, data.user);
      return data.user; // Return user data on successful registration
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  // Function to handle user logout
  const logout = () => {
    clearAuthData();
  };

  const value = {
    user,
    token,
    loading,
    login,
    register, // Expose register function
    logout,
    API_BASE_URL, // Provide API base URL for other components
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children} {/* Render children only after initial auth check */}
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

