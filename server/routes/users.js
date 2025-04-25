const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Cart = require('../models/Cart');
const { auth, admin } = require('../middleware/auth');
const Product = require('../models/Product');

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
router.put('/profile', auth, async (req, res) => {
  const { name, email, phone, address } = req.body;

  // Build user object
  const userFields = {};
  if (name) userFields.name = name;
  if (email) userFields.email = email;
  if (phone) userFields.phone = phone;
  if (address) userFields.address = address;

  try {
    let user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
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

module.exports = router; 