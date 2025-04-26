const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { auth, admin } = require('../middleware/auth');
const Product = require('../models/Product');
const Cart = require('../models/Cart');

// @route   GET api/orders
// @desc    Get all orders (admin only)
// @access  Private/Admin
router.get('/', [auth, admin], async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate({
        path: 'items.product',
        select: 'name imageUrls price category brand'
      })
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/orders/myorders
// @desc    Get logged in user's orders
// @access  Private
router.get('/myorders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate({
        path: 'items.product',
        select: 'name imageUrls price category sizes colors brand stock description'
      })
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/orders/:id
// @desc    Get order by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate({
        path: 'items.product',
        select: 'name imageUrls price category sizes colors brand stock description'
      });

    // Check if order exists
    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }

    // Check if user owns the order or is admin
    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    res.json(order);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Order not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST api/orders
// @desc    Create a new order
// @access  Private
router.post('/', auth, async (req, res) => {
  const {
    items,
    totalAmount,
    shippingAddress,
    paymentMethod,
    paymentInfo
  } = req.body;

  // Debug logging
  console.log('==== ORDER CREATE REQUEST ====');
  console.log('Payment Method:', paymentMethod);
  console.log('Payment Info Present:', !!paymentInfo);
  if (paymentInfo) {
    console.log('Payment Info:', JSON.stringify(paymentInfo));
  }
  console.log('============================');

  try {
    // Verify all items have sufficient stock before creating order
    for (const item of items) {
      const product = await Product.findById(item.product);
      
      if (!product) {
        return res.status(404).json({ 
          msg: 'Product not found', 
          productId: item.product 
        });
      }
      
      if (product.stock < item.quantity) {
        return res.status(400).json({
          msg: `Insufficient stock for ${product.name}`,
          availableStock: product.stock,
          requestedQuantity: item.quantity,
          productId: product._id
        });
      }
    }

    // Create new order
    const orderData = {
      user: req.user.id,
      items,
      totalAmount,
      shippingAddress,
      paymentMethod,
      paymentStatus: 'pending',
      orderStatus: 'pending'
    };

    // Add payment info if provided
    if (paymentInfo && (paymentMethod === 'bank_transfer' || paymentMethod === 'paypal')) {
      orderData.paymentInfo = {
        ...paymentInfo,
        dateCreated: paymentInfo.dateCreated ? new Date(paymentInfo.dateCreated) : new Date(),
        verificationStatus: 'pending'
      };
      console.log('Added payment info to order data:', JSON.stringify(orderData.paymentInfo));
    } else {
      console.log('Did not add payment info. Conditions:', {
        paymentInfoPresent: !!paymentInfo,
        correctPaymentMethod: paymentMethod === 'bank_transfer' || paymentMethod === 'paypal'
      });
    }

    const newOrder = new Order(orderData);

    // Update product stock quantities
    const stockUpdates = items.map(item => {
      return Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: -item.quantity } },
        { new: true }
      );
    });
    
    await Promise.all(stockUpdates);

    // Save the order
    const order = await newOrder.save();
    
    // Clear the user's cart
    await Cart.findOneAndUpdate(
      { user: req.user.id },
      { $set: { items: [], totalAmount: 0 } }
    );

    res.json(order);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/orders/:id/status
// @desc    Update order status (admin only)
// @access  Private/Admin
router.put('/:id/status', [auth, admin], async (req, res) => {
  const { orderStatus, paymentStatus, trackingNumber } = req.body;

  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }

    if (orderStatus) order.orderStatus = orderStatus;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (trackingNumber) {
      if (!order.deliveryInfo) {
        order.deliveryInfo = {};
      }
      order.deliveryInfo.trackingNumber = trackingNumber;
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Order not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   PUT api/orders/:id/verify-payment
// @desc    Verify payment for an order (admin only)
// @access  Private/Admin
router.put('/:id/verify-payment', [auth, admin], async (req, res) => {
  const { verificationStatus, verificationNotes } = req.body;

  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }

    if (!order.paymentInfo) {
      return res.status(400).json({ msg: 'No payment information available for this order' });
    }

    // Update payment verification
    order.paymentInfo.verificationStatus = verificationStatus;
    if (verificationNotes) order.paymentInfo.verificationNotes = verificationNotes;
    order.paymentInfo.verifiedBy = req.user.id;
    order.paymentInfo.verifiedAt = Date.now();

    // Update payment status based on verification status
    if (verificationStatus === 'verified') {
      order.paymentStatus = 'completed';
      // If the order was pending, move it to processing
      if (order.orderStatus === 'pending') {
        order.orderStatus = 'processing';
      }
    } else if (verificationStatus === 'rejected') {
      order.paymentStatus = 'failed';
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Order not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   PUT api/orders/:id/delivery
// @desc    Update delivery information (admin only)
// @access  Private/Admin
router.put('/:id/delivery', [auth, admin], async (req, res) => {
  const { 
    service, 
    driverName, 
    contactNumber, 
    trackingNumber, 
    trackingLink,
    estimatedDelivery,
    notes
  } = req.body;

  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }

    // Initialize deliveryInfo if it doesn't exist
    if (!order.deliveryInfo) {
      order.deliveryInfo = {};
    }

    // Update delivery information
    if (service) order.deliveryInfo.service = service;
    if (driverName) order.deliveryInfo.driverName = driverName;
    if (contactNumber) order.deliveryInfo.contactNumber = contactNumber;
    if (trackingNumber) order.deliveryInfo.trackingNumber = trackingNumber;
    if (trackingLink) order.deliveryInfo.trackingLink = trackingLink;
    if (estimatedDelivery) order.deliveryInfo.estimatedDelivery = new Date(estimatedDelivery);
    if (notes) order.deliveryInfo.notes = notes;
    
    // Record who assigned the delivery
    order.deliveryInfo.assignedBy = req.user.id;
    order.deliveryInfo.assignedAt = Date.now();

    // If delivery info is being added, update order status to shipped
    if (order.orderStatus === 'processing') {
      order.orderStatus = 'shipped';
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Order not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/orders/:id
// @desc    Delete an order (admin only)
// @access  Private/Admin
router.delete('/:id', [auth, admin], async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }

    await Order.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Order removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Order not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router; 