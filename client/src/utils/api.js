import axios from 'axios';
import { API_BASE_URL } from '../constants/apiConfig';

// Create an instance of axios with default configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  // Add a timeout to prevent long-hanging requests
  timeout: 15000
});

// Add a request interceptor to add authentication token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle session expiration
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // You can redirect to login page or dispatch a logout action here
    }
    
    // Log API errors for debugging
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.warn('API Error Response:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
        url: error.config.url
      });
    } else if (error.request) {
      // The request was made but no response was received
      console.warn('API Error Request:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.warn('API Error Setup:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (email, password) => api.post('/auth/login', { email, password }),
  loginAdmin: (email, password) => api.post('/auth/admin/login', { email, password }),
  getUser: () => api.get('/auth/user')
};

// Products API
export const productsAPI = {
  getAll: (params) => api.get('/products', { params }),
  getFeatured: () => api.get('/products/featured'),
  getById: (id) => api.get(`/products/${id}`),
  getStock: (id) => api.get(`/products/${id}/stock`),
  create: (productData) => api.post('/products', productData),
  update: (id, productData) => api.put(`/products/${id}`, productData),
  delete: (id) => api.delete(`/products/${id}`),
  addReview: (id, reviewData) => api.post(`/products/${id}/review`, reviewData)
};

// Cart API
export const cartAPI = {
  get: () => api.get('/users/cart'),
  add: (productId, quantity, price, size, color) => 
    api.post('/users/cart', { productId, quantity, price, size, color }),
  update: (itemId, quantity) => api.put(`/users/cart/${itemId}`, { quantity }),
  remove: (itemId) => api.delete(`/users/cart/${itemId}`)
};

// Orders API
export const ordersAPI = {
  getAll: () => api.get('/orders'),
  getMyOrders: () => api.get('/orders/myorders'),
  getById: (id) => api.get(`/orders/${id}`),
  create: (orderData) => api.post('/orders', orderData),
  updateStatus: (id, statusData) => api.put(`/orders/${id}/status`, statusData),
  delete: (id) => api.delete(`/orders/${id}`)
};

// User API
export const userAPI = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  updateProfile: (userData) => api.put('/users/profile', userData),
  updatePassword: (currentPassword, newPassword) => 
    api.put('/users/password', { currentPassword, newPassword })
};

// Users API
export const usersAPI = {
  getUserProfile: () => api.get('/users/me'),
  updateUserProfile: (userData) => api.put('/users/me', userData),
  changePassword: (passwordData) => api.put('/users/password', passwordData),
  uploadAvatar: (formData) => api.post('/users/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
  getFavorites: () => api.get('/users/favorites'),
  addToFavorites: (productId) => api.post(`/users/favorites/${productId}`),
  removeFromFavorites: (productId) => api.delete(`/users/favorites/${productId}`)
};

// Conversations API
export const conversationsAPI = {
  getAllConversations: () => api.get('/conversations'),
  getUserConversations: () => api.get('/conversations/user'),
  getConversation: (id) => api.get(`/conversations/${id}`),
  createConversation: (data) => api.post('/conversations', data),
  addMessage: (id, text) => api.post(`/conversations/${id}/message`, { text }),
  updateStatus: (id, status) => api.put(`/conversations/${id}/status`, { status }),
  markAsRead: (id) => api.put(`/conversations/${id}/read`)
};

export default api; 