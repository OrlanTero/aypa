import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { AUTH_ENDPOINTS, USER_ENDPOINTS } from '../constants/apiConfig';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Check if token is valid and load user on mount
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        setAuthToken(token);
        
        try {
          // Check if token is expired
          const decoded = jwtDecode(token);
          if (decoded.exp * 1000 < Date.now()) {
            // Token expired
            logout();
            return;
          }

          const res = await axios.get(AUTH_ENDPOINTS.USER_INFO);
          setUser(res.data);
          setIsAuthenticated(true);
        } catch (err) {
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
          setIsAuthenticated(false);
          setError('Authentication error - Please login again');
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

  // Set axios authorization header
  const setAuthToken = (token) => {
    if (token) {
      axios.defaults.headers.common['x-auth-token'] = token;
      localStorage.setItem('token', token);
      
      // Store user role if available
      try {
        const decoded = jwtDecode(token);
        if (decoded.user && decoded.user.role) {
          localStorage.setItem('userRole', decoded.user.role);
        }
      } catch (err) {
        console.error('Error decoding token:', err);
      }
    } else {
      delete axios.defaults.headers.common['x-auth-token'];
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
    }
  };

  // Register user
  const register = async (formData) => {
    try {
      const res = await axios.post(AUTH_ENDPOINTS.REGISTER, formData);
      
      if (res.data.token) {
        setToken(res.data.token);
        setIsAuthenticated(true);
        setError(null);
      }
      return res;
    } catch (err) {
      setError(err.response?.data?.msg || 'Registration failed');
      throw err;
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      const res = await axios.post(AUTH_ENDPOINTS.LOGIN, { email, password });
      
      if (res.data.token) {
        setToken(res.data.token);
        setUser(res.data.user);
        setIsAuthenticated(true);
        setError(null);
      }
      return res;
    } catch (err) {
      setError(err.response?.data?.msg || 'Invalid credentials');
      throw err;
    }
  };

  // Login admin
  const loginAdmin = async (email, password) => {
    try {
      const res = await axios.post(AUTH_ENDPOINTS.ADMIN_LOGIN, { email, password });
      
      if (res.data.token) {
        setToken(res.data.token);
        setUser(res.data.user);
        setIsAuthenticated(true);
        setError(null);
      }
      return res;
    } catch (err) {
      setError(err.response?.data?.msg || 'Invalid credentials');
      throw err;
    }
  };

  // Logout user
  const logout = () => {
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    delete axios.defaults.headers.common['x-auth-token'];
  };

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      const res = await axios.put(USER_ENDPOINTS.PROFILE, userData);
      setUser(res.data);
      return res;
    } catch (err) {
      setError(err.response?.data?.msg || 'Profile update failed');
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        isAuthenticated,
        loading,
        user,
        error,
        register,
        login,
        loginAdmin,
        logout,
        updateProfile,
        setError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 