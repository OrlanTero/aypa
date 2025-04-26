const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const userRoutes = require('./routes/users');

// Config
dotenv.config();
const app = express();

// CORS Configuration
const corsOptions = {
  origin: function(origin, callback) {
    // Allow all origins (more permissive for development)
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'x-auth-token', 'Authorization', 'Accept'],
  exposedHeaders: ['x-auth-token']
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Log all requests for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} ${req.header('x-auth-token') ? 'with token' : 'no token'}`);
  next();
});

// Handle preflight OPTIONS requests
app.options('*', cors(corsOptions));

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, './uploads')));

// Middleware
app.use(express.json({ limit: '10mb' }));



// Set default headers for all responses
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, x-auth-token, Authorization');
  res.header('Access-Control-Expose-Headers', 'x-auth-token');
  next();
});

// MongoDB Connection
mongoose
  .connect('mongodb://localhost:27017/aypa_ecommerce')
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('AYPA E-commerce API is running');
});

// Handle 404 errors
app.use((req, res) => {
  res.status(404).json({ 
    error: true, 
    message: `Route not found: ${req.method} ${req.originalUrl}` 
  });
});

// Error Handling Middleware (must be after routes)
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({ 
    error: true,
    message: 'Server error',
    details: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 