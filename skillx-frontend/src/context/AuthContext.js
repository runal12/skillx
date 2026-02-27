import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import dataSecurityService from '../services/dataSecurity';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      // Verify token and get user info
      api.get('/profile/')
        .then(response => {
          setUser(response.data);
          // Store user ID for security checks
          localStorage.setItem('userId', response.data.id);
          localStorage.setItem('username', response.data.username);
          localStorage.setItem('userEmail', response.data.email);
        })
        .catch(() => {
          // Clear all user data on auth failure
          dataSecurityService.clearUserData();
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    const response = await api.post('/login/', credentials);
    const { access, refresh } = response.data;
    
    localStorage.setItem('accessToken', access);
    localStorage.setItem('refreshToken', refresh);
    
    const userResponse = await api.get('/profile/');
    setUser(userResponse.data);
    
    // Store user data for security
    localStorage.setItem('userId', userResponse.data.id);
    localStorage.setItem('username', userResponse.data.username);
    localStorage.setItem('userEmail', userResponse.data.email);
    
    // Log security event
    dataSecurityService.logSecurityEvent('USER_LOGIN', {
      username: userResponse.data.username,
      timestamp: new Date().toISOString()
    });
    
    return response.data;
  };

  const logout = () => {
    // Log security event
    if (user) {
      dataSecurityService.logSecurityEvent('USER_LOGOUT', {
        username: user.username,
        timestamp: new Date().toISOString()
      });
    }
    
    // Clear all user data
    dataSecurityService.clearUserData();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};