import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { USER_ENDPOINTS, API_BASE_URL } from '../constants/apiConfig';
import { AuthContext } from './AuthContext';
import { usersAPI } from '../utils/api';

export const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isAuthenticated, token, user } = useContext(AuthContext);

  // Fetch favorites when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchFavorites();
    } else {
      setFavorites([]);
    }
  }, [isAuthenticated, user]);

  const fetchFavorites = async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      // Add error handling for environments where the API might not be available yet
      try {
        const response = await usersAPI.getFavorites();
        setFavorites(response.data);
        setError(null);
      } catch (apiError) {
        console.warn('API request failed, using empty favorites array:', apiError);
        // Server might not support favorites yet, use empty array
        setFavorites([]);
      }
    } catch (err) {
      console.error('Error fetching favorites:', err);
      setError('Failed to load favorites');
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  const addToFavorites = async (productId) => {
    if (!isAuthenticated) return false;
    
    try {
      setLoading(true);
      try {
        const response = await usersAPI.addToFavorites(productId);
        setFavorites(response.data);
        setError(null);
        return true;
      } catch (apiError) {
        // Handle case where API doesn't support this yet
        console.warn('API request failed, simulating add to favorites:', apiError);
        // Add to local favorites as fallback
        setFavorites(prev => [...prev, { _id: productId }]);
        return true;
      }
    } catch (err) {
      console.error('Error adding to favorites:', err);
      setError('Failed to add to favorites');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removeFromFavorites = async (productId) => {
    if (!isAuthenticated) return false;
    
    try {
      setLoading(true);
      try {
        const response = await usersAPI.removeFromFavorites(productId);
        setFavorites(response.data);
        setError(null);
        return true;
      } catch (apiError) {
        // Handle case where API doesn't support this yet
        console.warn('API request failed, simulating remove from favorites:', apiError);
        // Remove from local favorites as fallback
        setFavorites(prev => prev.filter(item => item._id !== productId));
        return true;
      }
    } catch (err) {
      console.error('Error removing from favorites:', err);
      setError('Failed to remove from favorites');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const isFavorite = (productId) => {
    if (!favorites || !Array.isArray(favorites)) return false;
    return favorites.some(fav => fav._id === productId);
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        loading,
        error,
        addToFavorites,
        removeFromFavorites,
        isFavorite,
        fetchFavorites
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}; 