const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Cart = require('../models/Cart');
const { auth, admin } = require('../middleware/auth');
const Product = require('../models/Product');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Order = require('../models/Order');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadDir = 'uploads/avatars';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    cb(null, `user-${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Create upload instance
const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// *** CART ROUTES FIRST TO PREVENT PARAMETER CONFLICTS ***

// @route   GET api/users/cart
// @desc    Get user's cart
// @access  Private
router.get('/cart', auth, async (req, res) => {
  console.log('Processing GET /cart request for user:', req.user?.id);
  console.log('User role:', req.user?.role);
  
  try {
    let cart = await Cart.findOne({ user: req.user.id }).populate('items.product');

    if (!cart) {
      console.log('No cart found, creating new cart for user:', req.user.id);
      // Create a new cart if one doesn't exist
      cart = new Cart({
        user: req.user.id,
        items: [],
        totalAmount: 0
      });
      await cart.save();
    } else {
      console.log('Found existing cart with items:', cart.items.length);
    }

    res.json(cart);
  } catch (err) {
    console.error('Error getting cart:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/users/cart
// @desc    Add item to cart
// @access  Private
router.post('/cart', auth, async (req, res) => {
  const { productId, quantity, price, size, color } = req.body;

  try {
    // First check if product exists and has sufficient stock
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }
    
    if (product.stock < quantity) {
      return res.status(400).json({ 
        msg: 'Insufficient stock', 
        availableStock: product.stock 
      });
    }

    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      // Create a new cart if one doesn't exist
      cart = new Cart({
        user: req.user.id,
        items: [],
        totalAmount: 0
      });
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.product.toString() === productId && 
              item.size === size && 
              item.color === color
    );

    // Calculate new quantity (existing + added)
    const newQuantity = existingItemIndex > -1 
      ? cart.items[existingItemIndex].quantity + quantity
      : quantity;
      
    // Check if the new total quantity exceeds available stock
    if (newQuantity > product.stock) {
      return res.status(400).json({ 
        msg: 'Insufficient stock for requested quantity', 
        availableStock: product.stock,
        cartQuantity: existingItemIndex > -1 ? cart.items[existingItemIndex].quantity : 0
      });
    }

    if (existingItemIndex > -1) {
      // Update existing item quantity
      cart.items[existingItemIndex].quantity = newQuantity;
    } else {
      // Add new item to cart
      cart.items.push({
        product: productId,
        quantity,
        price,
        size,
        color
      });
    }

    await cart.save();
    
    // Populate product details before returning
    await cart.populate('items.product');
    
    res.json(cart);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/users/cart/:itemId
// @desc    Update cart item quantity
// @access  Private
router.put('/cart/:itemId', auth, async (req, res) => {
  const { quantity } = req.body;

  try {
    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(404).json({ msg: 'Cart not found' });
    }

    // Find the item to update
    const itemIndex = cart.items.findIndex(
      item => item._id.toString() === req.params.itemId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ msg: 'Item not found in cart' });
    }
    
    // Get product to check stock
    const productId = cart.items[itemIndex].product;
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }
    
    // Check if requested quantity is available in stock
    if (quantity > 0 && quantity > product.stock) {
      return res.status(400).json({ 
        msg: 'Insufficient stock for requested quantity', 
        availableStock: product.stock 
      });
    }

    // Update item quantity or remove if quantity is 0
    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
    }

    await cart.save();
    
    // Populate product details before returning
    await cart.populate('items.product');
    
    res.json(cart);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/users/cart/:itemId
// @desc    Remove item from cart
// @access  Private
router.delete('/cart/:itemId', auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(404).json({ msg: 'Cart not found' });
    }

    // Remove item from cart
    cart.items = cart.items.filter(
      item => item._id.toString() !== req.params.itemId
    );

    await cart.save();
    
    // Populate product details before returning
    await cart.populate('items.product');
    
    res.json(cart);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// *** USER ROUTES AFTER CART ROUTES ***

// @route   GET api/users
// @desc    Get all users (admin only)
// @access  Private/Admin
router.get('/', [auth, admin], async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    console.log('GET /api/users/profile with token');
    console.log('Auth Headers:', {
      auth: req.header('x-auth-token'),
      authLength: req.header('x-auth-token') ? req.header('x-auth-token').length : 0,
      contentType: req.header('Content-Type'),
      authHeader: req.header('Authorization')
    });
    
    // Get user profile data
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    console.log('User profile fetched successfully');
    res.json(user);
  } catch (err) {
    console.error('Error in GET /profile:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, upload.single('avatar'), async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    let address = req.body.address;

    // Parse address if it's sent as query string format
    if (typeof address === 'string') {
      try {
        address = JSON.parse(address);
      } catch (err) {
        // If parsing fails, try to parse from query params format
        address = {};
        const addressKeys = ['street', 'city', 'state', 'zipCode', 'country'];
        addressKeys.forEach(key => {
          if (req.body[`address[${key}]`]) {
            address[key] = req.body[`address[${key}]`];
          }
        });
      }
    }

    // Build user object
    const userFields = {};
    if (name) userFields.name = name;
    if (email) userFields.email = email;
    if (phone) userFields.phone = phone;
    if (address) userFields.address = address;
    
    // Add avatar path if uploaded
    if (req.file) {
      userFields.avatar = req.file.path;
    }

    let user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // If user uploads a new avatar, delete the old one
    if (req.file && user.avatar) {
      try {
        fs.unlinkSync(user.avatar);
      } catch (err) {
        console.error('Error deleting old avatar:', err);
      }
    }

    // Update user
    user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: userFields },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/users/password
// @desc    Update user password
// @access  Private
router.put('/password', auth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    let user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ msg: 'Password updated successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/users/:id
// @desc    Get user by ID (admin only)
// @access  Private/Admin
router.get('/:id', [auth, admin], async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    res.json(user);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   GET api/users/admin/dashboard-stats
// @desc    Get dashboard statistics for admin
// @access  Private/Admin
router.get('/admin/dashboard-stats', [auth, admin], async (req, res) => {
  try {
    // Get total customers (all users except admins)
    const totalCustomers = await User.countDocuments({ role: { $ne: 'admin' } });
    
    // Get total products
    const totalProducts = await Product.countDocuments();
    
    // Get total orders and calculate revenue
    const orders = await Order.find().populate('items.product');
    const totalOrders = orders.length;
    
    // Calculate total revenue and average order value
    let totalRevenue = 0;
    orders.forEach(order => {
      order.items.forEach(item => {
        totalRevenue += item.quantity * item.price;
      });
    });
    
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    // Get top selling products
    const productSales = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        const productId = item.product._id.toString();
        if (!productSales[productId]) {
          productSales[productId] = {
            id: productId,
            name: item.product.name,
            sales: 0,
            revenue: 0
          };
        }
        productSales[productId].sales += item.quantity;
        productSales[productId].revenue += item.quantity * item.price;
      });
    });
    
    const topSellingProducts = Object.values(productSales)
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);
    
    // Get recent orders (last 5)
    const recentOrders = await Order.find()
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();
    
    const formattedRecentOrders = recentOrders.map(order => {
      let orderTotal = 0;
      order.items.forEach(item => {
        orderTotal += item.quantity * item.price;
      });
      
      return {
        id: order._id.toString(),
        customer: order.user.name,
        date: order.createdAt,
        amount: orderTotal,
        status: order.status
      };
    });
    
    // Calculate monthly sales for the past year
    const monthlySales = [];
    const currentDate = new Date();
    
    for (let i = 0; i < 12; i++) {
      const month = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 0);
      
      const monthOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= month && orderDate <= monthEnd;
      });
      
      let monthRevenue = 0;
      monthOrders.forEach(order => {
        order.items.forEach(item => {
          monthRevenue += item.quantity * item.price;
        });
      });
      
      monthlySales.unshift({
        month: month.toLocaleString('default', { month: 'short' }),
        sales: monthRevenue
      });
    }
    
    // Get product categories breakdown
    const products = await Product.find();
    const categories = {};
    
    products.forEach(product => {
      if (!categories[product.category]) {
        categories[product.category] = 0;
      }
      categories[product.category]++;
    });
    
    const productCategories = Object.keys(categories).map(category => {
      return {
        name: category,
        count: categories[category],
        percentage: (categories[category] / totalProducts) * 100
      };
    });
    
    // Return dashboard stats
    res.json({
      totalRevenue,
      totalOrders,
      totalProducts,
      averageOrderValue,
      totalCustomers,
      topSellingProducts,
      recentOrders: formattedRecentOrders,
      monthlySales,
      productCategories
    });
    
  } catch (err) {
    console.error('Error fetching dashboard stats:', err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router; 