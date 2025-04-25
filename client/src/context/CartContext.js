import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import { CART_ENDPOINTS } from '../constants/apiConfig';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [], totalAmount: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isAuthenticated, user, token } = useContext(AuthContext);

  // Debug authentication status and token
  useEffect(() => {
    console.log("Auth State Changed:", { isAuthenticated, hasToken: !!token, userRole: user?.role });
  }, [isAuthenticated, token, user]);

  // Load cart data when user is authenticated and is not an admin
  useEffect(() => {
    if (isAuthenticated && user && user.role !== 'admin' && token) {
      console.log("Loading cart for authenticated user");
      loadCart();
    } else {
      console.log("Clearing cart: Not authenticated or admin user");
      // Clear cart when user logs out or for admin users
      setCart({ items: [], totalAmount: 0 });
    }
  }, [isAuthenticated, user, token]);

  // Ensure auth token is set in axios defaults
  const ensureAuthHeaders = () => {
    if (token) {
      axios.defaults.headers.common['x-auth-token'] = token;
      return true;
    }
    return false;
  };

  // Fetch cart from server
  const loadCart = async () => {
    if (!token || !isAuthenticated) {
      console.log("Skipping cart load: No token or not authenticated");
      return;
    }
    
    try {
      setLoading(true);
      console.log("Fetching cart with token");
      
      // Set token in axios defaults AND in request config for redundancy
      ensureAuthHeaders();
      
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        }
      };
      
      const res = await axios.get(CART_ENDPOINTS.GET, config);
      console.log("Cart loaded successfully:", res.data);
      setCart(res.data);
      setError(null);
    } catch (err) {
      console.error('Error loading cart:', err);
      console.error('Response status:', err.response?.status);
      console.error('Response data:', err.response?.data);
      
      if (err.response && err.response.status === 403) {
        setError('Authentication required to access cart');
      } else {
        setError('Failed to load cart. Please refresh or try again later.');
      }
      setCart({ items: [], totalAmount: 0 });
    } finally {
      setLoading(false);
    }
  };

  // Add item to cart
  const addToCart = async (productId, quantity = 1, price, size = null, color = null) => {
    if (!ensureAuthHeaders() || !isAuthenticated) {
      setError('Please login to add items to cart');
      return { error: true, message: 'Authentication required' };
    }

    if (user && user.role === 'admin') {
      setError('Admin users cannot add items to cart');
      return { error: true, message: 'Admin users cannot add items to cart' };
    }

    try {
      setLoading(true);
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        }
      };
      
      console.log("Adding to cart with token:", token?.substring(0, 10) + "...");
      
      const res = await axios.post(CART_ENDPOINTS.ADD, {
        productId,
        quantity,
        price,
        size,
        color
      }, config);
      
      console.log("Item added to cart:", res.data);
      setCart(res.data);
      setError(null);
      return res.data;
    } catch (err) {
      console.error('Error adding to cart:', err);
      console.error('Response status:', err.response?.status);
      console.error('Response data:', err.response?.data);
      
      if (err.response && err.response.status === 403) {
        setError('Authentication required to add items to cart');
        return { error: true, message: 'Authentication required to add items to cart' };
      } else if (err.response && err.response.data) {
        setError(err.response.data.msg || 'Failed to add item to cart');
        
        // Return the error details for UI handling
        return {
          error: true,
          message: err.response.data.msg,
          availableStock: err.response.data.availableStock,
          cartQuantity: err.response.data.cartQuantity
        };
      } else {
        setError('Failed to add item to cart');
        return { error: true, message: 'Failed to add item to cart' };
      }
    } finally {
      setLoading(false);
    }
  };

  // Update cart item quantity
  const updateCartItem = async (itemId, quantity) => {
    if (!ensureAuthHeaders() || !isAuthenticated) {
      setError('Please login to update cart');
      return { error: true, message: 'Authentication required' };
    }
    
    try {
      setLoading(true);
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        }
      };
      
      const res = await axios.put(CART_ENDPOINTS.UPDATE(itemId), { quantity }, config);
      console.log("Cart item updated:", res.data);
      setCart(res.data);
      setError(null);
      return res.data;
    } catch (err) {
      console.error('Error updating cart:', err);
      console.error('Response status:', err.response?.status);
      console.error('Response data:', err.response?.data);
      
      if (err.response && err.response.status === 403) {
        setError('Authentication required to update cart');
        return { error: true, message: 'Authentication required to update cart' };
      } else if (err.response && err.response.data) {
        setError(err.response.data.msg || 'Failed to update cart');
        
        // Return the error details for UI handling
        return {
          error: true,
          message: err.response.data.msg,
          availableStock: err.response.data.availableStock
        };
      } else {
        setError('Failed to update cart');
        return { error: true, message: 'Failed to update cart' };
      }
    } finally {
      setLoading(false);
    }
  };

  // Remove item from cart
  const removeFromCart = async (itemId) => {
    if (!ensureAuthHeaders() || !isAuthenticated) {
      setError('Please login to remove items from cart');
      return { error: true, message: 'Authentication required' };
    }
    
    try {
      setLoading(true);
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        }
      };
      
      const res = await axios.delete(CART_ENDPOINTS.REMOVE(itemId), config);
      console.log("Item removed from cart:", res.data);
      setCart(res.data);
      setError(null);
      return res.data;
    } catch (err) {
      console.error('Error removing from cart:', err);
      console.error('Response status:', err.response?.status);
      console.error('Response data:', err.response?.data);
      
      if (err.response && err.response.status === 403) {
        setError('Authentication required to remove items from cart');
        return { error: true, message: 'Authentication required' };
      } else {
        setError('Failed to remove item from cart');
        return { error: true, message: 'Failed to remove item from cart' };
      }
    } finally {
      setLoading(false);
    }
  };

  // Clear the entire cart
  const clearCart = async () => {
    if (!ensureAuthHeaders() || !isAuthenticated) return;

    try {
      setLoading(true);
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        }
      };
      
      await Promise.all(cart.items.map(item => 
        axios.delete(CART_ENDPOINTS.REMOVE(item._id), config)
      ));
      
      console.log("Cart cleared successfully");
      // Reset cart state
      setCart({ items: [], totalAmount: 0 });
      setError(null);
    } catch (err) {
      console.error('Error clearing cart:', err);
      console.error('Response status:', err.response?.status);
      console.error('Response data:', err.response?.data);
      
      setError('Failed to clear cart');
    } finally {
      setLoading(false);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        error,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        setError,
        loadCart // Export loadCart to allow manual refresh
      }}
    >
      {children}
    </CartContext.Provider>
  );
}; 