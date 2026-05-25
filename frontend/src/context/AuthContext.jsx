import React, { createContext, useState, useEffect, useContext } from 'react';
import API from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          // Fetch latest user profile to verify token validity and load data
          const response = await API.get('/auth/profile');
          const userData = response.data;
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        } catch (error) {
          console.error("Token validation failed, logging out", error);
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await API.post('/auth/login', { email, password });
      const { token, role, fullName, userId } = response.data;
      
      localStorage.setItem('token', token);
      setToken(token);

      // Fetch complete profile details (address, phone, loyalty points)
      const profileResponse = await API.get('/auth/profile');
      const userData = profileResponse.data;
      
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return userData;
    } catch (error) {
      throw error.response?.data?.message || "Invalid credentials. Please try again.";
    }
  };

  const register = async (fullName, email, password, phone, address) => {
    try {
      await API.post('/auth/register', { fullName, email, password, phone, address });
    } catch (error) {
      throw error.response?.data?.message || "Registration failed. Please try again.";
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const refreshProfile = async () => {
    try {
      const response = await API.get('/auth/profile');
      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
    } catch (error) {
      console.error("Failed to refresh profile", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshProfile }}>
      {children}
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
