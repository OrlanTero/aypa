const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { auth, admin } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for product image uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadDir = 'uploads/products';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    cb(null, `product-${Date.now()}${path.extname(file.originalname)}`);
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

// @route   GET api/products
// @desc    Get all products
// @access  Public
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/products/featured
// @desc    Get featured products
// @access  Public
router.get('/featured', async (req, res) => {
  try {
    const featuredProducts = await Product.find({ featured: true });
    res.json(featuredProducts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/products/:id
// @desc    Get product by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }
    
    res.json(product);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Product not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   GET api/products/:id/stock
// @desc    Get product stock availability
// @access  Public
router.get('/:id/stock', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).select('stock');
    
    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }
    
    res.json({ stock: product.stock });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Product not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST api/products
// @desc    Create a product
// @access  Private/Admin
router.post('/', [auth, admin, upload.array('images', 5)], async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      sizes,
      colors,
      brand,
      stock,
      featured
    } = req.body;

    // Get image paths from uploaded files
    const imageUrls = req.files ? req.files.map(file => file.path) : [];

    const newProduct = new Product({
      name,
      description,
      price,
      category,
      imageUrls,
      sizes: sizes ? JSON.parse(sizes) : [],
      colors: colors ? JSON.parse(colors) : [],
      brand,
      stock,
      featured: featured === 'true'
    });

    const product = await newProduct.save();
    res.json(product);
  } catch (err) {
    console.error('Error creating product:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/products/:id
// @desc    Update a product
// @access  Private/Admin
router.put('/:id', [auth, admin, upload.array('images', 5)], async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      existingImages,
      sizes,
      colors,
      brand,
      stock,
      featured
    } = req.body;

    // Build product object
    const productFields = {};
    if (name) productFields.name = name;
    if (description) productFields.description = description;
    if (price) productFields.price = parseFloat(price);
    if (category) productFields.category = category;
    if (sizes) productFields.sizes = JSON.parse(sizes);
    if (colors) productFields.colors = JSON.parse(colors);
    if (brand) productFields.brand = brand;
    if (stock !== undefined) productFields.stock = parseInt(stock);
    if (featured !== undefined) productFields.featured = featured === 'true';

    // Find product to update
    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }

    // Handle images - combine existing images with new uploads
    const existingImageUrls = existingImages ? JSON.parse(existingImages) : [];
    const newImageUrls = req.files ? req.files.map(file => file.path) : [];
    
    // Delete removed images from storage
    const imagesToKeep = new Set(existingImageUrls);
    for (const oldImage of product.imageUrls) {
      if (!imagesToKeep.has(oldImage)) {
        try {
          fs.unlinkSync(oldImage);
          console.log(`Deleted image: ${oldImage}`);
        } catch (err) {
          console.error(`Failed to delete image ${oldImage}:`, err);
        }
      }
    }

    // Set the combined image URLs
    productFields.imageUrls = [...existingImageUrls, ...newImageUrls];

    // Update product
    product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: productFields },
      { new: true }
    );

    res.json(product);
  } catch (err) {
    console.error('Error updating product:', err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Product not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/products/:id
// @desc    Delete a product
// @access  Private/Admin
router.delete('/:id', [auth, admin], async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }
    
    // Delete product images from storage
    if (product.imageUrls && product.imageUrls.length > 0) {
      for (const imageUrl of product.imageUrls) {
        try {
          fs.unlinkSync(imageUrl);
          console.log(`Deleted image: ${imageUrl}`);
        } catch (err) {
          console.error(`Failed to delete image ${imageUrl}:`, err);
        }
      }
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({ msg: 'Product removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Product not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST api/products/:id/review
// @desc    Add review to product
// @access  Private
router.post('/:id/review', auth, async (req, res) => {
  const { rating, review } = req.body;

  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }

    // Check if user already reviewed this product
    const alreadyReviewed = product.ratings.find(
      r => r.user.toString() === req.user.id
    );

    if (alreadyReviewed) {
      return res.status(400).json({ msg: 'Product already reviewed' });
    }

    const newReview = {
      user: req.user.id,
      rating: Number(rating),
      review,
      date: Date.now()
    };

    product.ratings.push(newReview);
    await product.save();

    res.json(product.ratings);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Product not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router; 