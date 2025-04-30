const express = require('express');
const router = express.Router();
const Conversation = require('../models/Conversation');
const User = require('../models/User');
const { auth, admin } = require('../middleware/auth');

// @route   GET api/conversations
// @desc    Get all conversations for an admin
// @access  Private/Admin
router.get('/', [auth, admin], async (req, res) => {
  try {
    const conversations = await Conversation.find()
      .populate('user', 'name email avatar')
      .sort({ lastMessage: -1 });
    
    res.json(conversations);
  } catch (err) {
    console.error('Error getting conversations:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/conversations/user
// @desc    Get all conversations for a user
// @access  Private
router.get('/user', auth, async (req, res) => {
  try {
    const conversations = await Conversation.find({ user: req.user.id })
      .sort({ lastMessage: -1 });
    
    res.json(conversations);
  } catch (err) {
    console.error('Error getting user conversations:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/conversations/:id
// @desc    Get a specific conversation by ID
// @access  Private (with permission check)
router.get('/:id', auth, async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id)
      .populate('user', 'name email avatar')
      .populate('messages.adminId', 'name');
    
    if (!conversation) {
      return res.status(404).json({ msg: 'Conversation not found' });
    }
    
    // Check if user has permission (either admin or conversation owner)
    if (req.user.role !== 'admin' && conversation.user.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized to view this conversation' });
    }
    
    res.json(conversation);
  } catch (err) {
    console.error('Error getting conversation:', err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Conversation not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST api/conversations
// @desc    Create a new conversation
// @access  Private
router.post('/', auth, async (req, res) => {
  const { title, initialMessage } = req.body;
  
  if (!initialMessage) {
    return res.status(400).json({ msg: 'Initial message is required' });
  }
  
  try {
    // Check if user already has an active conversation
    const existingConversation = await Conversation.findOne({ 
      user: req.user.id,
      status: 'active'
    });
    
    if (existingConversation) {
      // Add message to existing conversation
      existingConversation.messages.push({
        sender: 'user',
        text: initialMessage,
        createdAt: Date.now(),
        read: false
      });
      
      await existingConversation.save();
      return res.json(existingConversation);
    }
    
    // Create new conversation
    const newConversation = new Conversation({
      user: req.user.id,
      title: title || 'Customer Support',
      messages: [{
        sender: 'user',
        text: initialMessage,
        createdAt: Date.now(),
        read: false
      }],
      status: 'active'
    });
    
    await newConversation.save();
    res.json(newConversation);
  } catch (err) {
    console.error('Error creating conversation:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/conversations/:id/message
// @desc    Add a message to a conversation
// @access  Private (with permission check)
router.post('/:id/message', auth, async (req, res) => {
  const { text } = req.body;
  
  if (!text) {
    return res.status(400).json({ msg: 'Message text is required' });
  }
  
  try {
    const conversation = await Conversation.findById(req.params.id);
    
    if (!conversation) {
      return res.status(404).json({ msg: 'Conversation not found' });
    }
    
    // Check if user has permission (either admin or conversation owner)
    if (req.user.role !== 'admin' && conversation.user.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized to add messages to this conversation' });
    }
    
    // Add message with proper sender type
    conversation.messages.push({
      sender: req.user.role === 'admin' ? 'admin' : 'user',
      adminId: req.user.role === 'admin' ? req.user.id : undefined,
      text,
      createdAt: Date.now(),
      read: false
    });
    
    // If admin is replying to a pending conversation, change status to active
    if (req.user.role === 'admin' && conversation.status === 'pending') {
      conversation.status = 'active';
    }
    
    await conversation.save();
    res.json(conversation);
  } catch (err) {
    console.error('Error adding message:', err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Conversation not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   PUT api/conversations/:id/status
// @desc    Update conversation status
// @access  Private/Admin
router.put('/:id/status', [auth, admin], async (req, res) => {
  const { status } = req.body;
  
  if (!status || !['active', 'resolved', 'pending'].includes(status)) {
    return res.status(400).json({ msg: 'Valid status is required' });
  }
  
  try {
    const conversation = await Conversation.findById(req.params.id);
    
    if (!conversation) {
      return res.status(404).json({ msg: 'Conversation not found' });
    }
    
    conversation.status = status;
    await conversation.save();
    
    res.json(conversation);
  } catch (err) {
    console.error('Error updating status:', err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Conversation not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   PUT api/conversations/:id/read
// @desc    Mark all messages as read
// @access  Private (with permission check)
router.put('/:id/read', auth, async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    
    if (!conversation) {
      return res.status(404).json({ msg: 'Conversation not found' });
    }
    
    // Check if user has permission (either admin or conversation owner)
    if (req.user.role !== 'admin' && conversation.user.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized to update this conversation' });
    }
    
    // Mark messages as read based on user role
    if (req.user.role === 'admin') {
      // Admin marks user messages as read
      conversation.messages.forEach(message => {
        if (message.sender === 'user') {
          message.read = true;
        }
      });
    } else {
      // User marks admin messages as read
      conversation.messages.forEach(message => {
        if (message.sender === 'admin') {
          message.read = true;
        }
      });
    }
    
    await conversation.save();
    res.json(conversation);
  } catch (err) {
    console.error('Error marking messages as read:', err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Conversation not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router; 