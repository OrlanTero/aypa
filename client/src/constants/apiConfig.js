/**
 * API configuration constants
 * This file allows switching between development and production environments
 */

// Environment detection
const isDevelopment = process.env.NODE_ENV === 'development';

// Base API URLs
const DEV_API_URL = 'http://localhost:5000/api';
const PROD_API_URL = '/api'; // Same domain in production

// Export the appropriate base URL based on environment
export const API_BASE_URL = isDevelopment ? DEV_API_URL : PROD_API_URL;

// Auth endpoints
export const AUTH_ENDPOINTS = {
  REGISTER: `${API_BASE_URL}/auth/register`,
  LOGIN: `${API_BASE_URL}/auth/login`,
  ADMIN_LOGIN: `${API_BASE_URL}/auth/admin/login`,
  USER_INFO: `${API_BASE_URL}/auth/user`,
};

// Product endpoints
export const PRODUCT_ENDPOINTS = {
  ALL: `${API_BASE_URL}/products`,
  FEATURED: `${API_BASE_URL}/products/featured`,
  DETAILS: (id) => `${API_BASE_URL}/products/${id}`,
  STOCK: (id) => `${API_BASE_URL}/products/${id}/stock`,
  REVIEWS: (id) => `${API_BASE_URL}/products/${id}/review`,
  CREATE: `${API_BASE_URL}/products`,
  UPDATE: (id) => `${API_BASE_URL}/products/${id}`,
  DELETE: (id) => `${API_BASE_URL}/products/${id}`,
  UPLOAD_IMAGE: `${API_BASE_URL}/upload/product-image`
};

// Cart endpoints
export const CART_ENDPOINTS = {
  GET: `${API_BASE_URL}/users/cart`,
  ADD: `${API_BASE_URL}/users/cart`,
  UPDATE: (itemId) => `${API_BASE_URL}/users/cart/${itemId}`,
  REMOVE: (itemId) => `${API_BASE_URL}/users/cart/${itemId}`,
};

// Order endpoints
export const ORDER_ENDPOINTS = {
  ALL: `${API_BASE_URL}/orders`,
  MY_ORDERS: `${API_BASE_URL}/orders/myorders`,
  DETAILS: (id) => `${API_BASE_URL}/orders/${id}`,
  CREATE: `${API_BASE_URL}/orders`,
  UPDATE_STATUS: (id) => `${API_BASE_URL}/orders/${id}/status`,
  VERIFY_PAYMENT: (id) => `${API_BASE_URL}/orders/${id}/verify-payment`,
  UPDATE_DELIVERY: (id) => `${API_BASE_URL}/orders/${id}/delivery`,
  CANCEL: (id) => `${API_BASE_URL}/orders/${id}/cancel`,
  TRACK: (id) => `${API_BASE_URL}/orders/${id}/track`,
  RECEIPT: (id) => `${API_BASE_URL}/orders/${id}/receipt`,
};

// User endpoints
export const USER_ENDPOINTS = {
  ALL: `${API_BASE_URL}/users`,
  PROFILE: `${API_BASE_URL}/users/profile`,
  UPDATE_PASSWORD: `${API_BASE_URL}/users/password`,
  ADDRESS: `${API_BASE_URL}/users/address`,
  ADD_ADDRESS: `${API_BASE_URL}/users/address`,
  UPDATE_ADDRESS: (id) => `${API_BASE_URL}/users/address/${id}`,
  DELETE_ADDRESS: (id) => `${API_BASE_URL}/users/address/${id}`,
}; 