import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  CircularProgress,
  Avatar,
  Divider,
  IconButton,
  Badge,
  Tooltip,
  Fab,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions
} from '@mui/material';
import {
  Send as SendIcon,
  Close as CloseIcon,
  Chat as ChatIcon,
  SupportAgent as SupportAgentIcon,
  AccountCircle as AccountCircleIcon
} from '@mui/icons-material';
import { AuthContext } from '../../context/AuthContext';
import { conversationsAPI } from '../../utils/api';

const AdminChat = () => {
  const { isAuthenticated, user } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);
  const chatPollingInterval = useRef(null);

  // Fetch user conversations on component mount if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchUserConversations();
    }

    return () => {
      if (chatPollingInterval.current) {
        clearInterval(chatPollingInterval.current);
      }
    };
  }, [isAuthenticated]);

  // Scroll to bottom of messages when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [selectedConversation]);

  // Mark messages as read when conversation is selected
  useEffect(() => {
    if (selectedConversation && selectedConversation._id) {
      markConversationAsRead(selectedConversation._id);
      
      // Setup polling for new messages while conversation is open
      if (chatPollingInterval.current) {
        clearInterval(chatPollingInterval.current);
      }
      
      chatPollingInterval.current = setInterval(() => {
        refreshCurrentConversation();
      }, 5000); // Poll every 5 seconds for new messages
    }

    return () => {
      if (chatPollingInterval.current) {
        clearInterval(chatPollingInterval.current);
      }
    };
  }, [selectedConversation?._id]);

  const fetchUserConversations = async () => {
    try {
      setLoading(true);
      const response = await conversationsAPI.getUserConversations();
      setConversations(response.data);
      
      // Calculate unread messages count
      const count = response.data.reduce((total, conv) => {
        const unreadMessages = conv.messages.filter(
          msg => msg.sender === 'admin' && !msg.read
        ).length;
        return total + unreadMessages;
      }, 0);
      
      setUnreadCount(count);
      
      // If there's only one conversation, select it automatically
      if (response.data.length === 1) {
        setSelectedConversation(response.data[0]);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError('Failed to load your support conversations');
    } finally {
      setLoading(false);
    }
  };

  const refreshCurrentConversation = async () => {
    if (!selectedConversation || !selectedConversation._id) return;
    
    try {
      const response = await conversationsAPI.getConversation(selectedConversation._id);
      setSelectedConversation(response.data);
      
      // Re-fetch the list to update unread counts
      fetchUserConversations();
    } catch (err) {
      console.error('Error refreshing conversation:', err);
    }
  };

  const markConversationAsRead = async (conversationId) => {
    try {
      await conversationsAPI.markAsRead(conversationId);
      fetchUserConversations(); // Refresh conversations to update unread count
    } catch (err) {
      console.error('Error marking conversation as read:', err);
    }
  };

  const handleOpenChat = () => {
    setOpen(true);
    fetchUserConversations();
  };

  const handleCloseChat = () => {
    setOpen(false);
    if (chatPollingInterval.current) {
      clearInterval(chatPollingInterval.current);
      chatPollingInterval.current = null;
    }
  };

  const handleMessageChange = (e) => {
    setMessage(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    try {
      setSendingMessage(true);
      
      if (selectedConversation) {
        // Add message to existing conversation
        const response = await conversationsAPI.addMessage(selectedConversation._id, message.trim());
        setSelectedConversation(response.data);
      } else {
        // Create new conversation
        const response = await conversationsAPI.createConversation({
          title: 'Customer Support',
          initialMessage: message.trim()
        });
        setSelectedConversation(response.data);
        fetchUserConversations();
      }
      
      setMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleStartNewConversation = () => {
    setSelectedConversation(null);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Format timestamp
  const formatMessageTime = (timestamp) => {
    try {
      const messageDate = new Date(timestamp);
      const now = new Date();
      const diffMs = now - messageDate;
      const diffSeconds = Math.floor(diffMs / 1000);
      const diffMinutes = Math.floor(diffSeconds / 60);
      const diffHours = Math.floor(diffMinutes / 60);
      const diffDays = Math.floor(diffHours / 24);
      
      // Just now
      if (diffSeconds < 5) {
        return 'just now';
      }
      
      // Seconds
      if (diffSeconds < 60) {
        return `${diffSeconds} second${diffSeconds !== 1 ? 's' : ''} ago`;
      }
      
      // Minutes
      if (diffMinutes < 60) {
        return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
      }
      
      // Hours
      if (diffHours < 24) {
        return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
      }
      
      // Days
      if (diffDays < 7) {
        return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
      }
      
      // Date
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return messageDate.toLocaleDateString(undefined, options);
    } catch (error) {
      return 'Unknown time';
    }
  };

  // Render each message
  const renderMessage = (message, index) => {
    const isUserMessage = message.sender === 'user';
    
    return (
      <Box
        key={index}
        sx={{
          display: 'flex',
          justifyContent: isUserMessage ? 'flex-end' : 'flex-start',
          mb: 2
        }}
      >
        {!isUserMessage && (
          <Avatar sx={{ bgcolor: 'primary.main', mr: 1 }}>
            <SupportAgentIcon />
          </Avatar>
        )}
        <Box
          sx={{
            maxWidth: '70%',
            p: 2,
            borderRadius: 2,
            bgcolor: isUserMessage ? 'primary.light' : 'background.paper',
            color: isUserMessage ? 'white' : 'text.primary',
            boxShadow: 1
          }}
        >
          <Typography variant="body1">{message.text}</Typography>
          <Typography variant="caption" sx={{ display: 'block', mt: 0.5, textAlign: 'right' }}>
            {formatMessageTime(message.createdAt)}
          </Typography>
        </Box>
        {isUserMessage && (
          <Avatar sx={{ bgcolor: 'grey.400', ml: 1 }}>
            <AccountCircleIcon />
          </Avatar>
        )}
      </Box>
    );
  };

  if (!isAuthenticated) {
    return (
      <Tooltip title="Log in to chat with support">
        <Fab
          color="primary"
          aria-label="chat with support"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={() => window.location.href = '/login'}
        >
          <ChatIcon />
        </Fab>
      </Tooltip>
    );
  }

  return (
    <>
      <Tooltip title="Chat with Support">
        <Badge badgeContent={unreadCount} color="error">
          <Fab
            color="primary"
            aria-label="chat with support"
            sx={{ position: 'fixed', bottom: 16, right: 16 }}
            onClick={handleOpenChat}
          >
            <ChatIcon />
          </Fab>
        </Badge>
      </Tooltip>

      <Dialog
        open={open}
        onClose={handleCloseChat}
        maxWidth="sm"
        fullWidth
        PaperProps={{ 
          sx: { 
            height: '80vh',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 2
          } 
        }}
      >
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <SupportAgentIcon sx={{ mr: 1 }} />
            <Typography variant="h6">
              {selectedConversation ? 'Customer Support Chat' : 'Start a Support Conversation'}
            </Typography>
          </Box>
          <IconButton onClick={handleCloseChat} color="inherit">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', flexGrow: 1, overflow: 'hidden' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="error">{error}</Typography>
              <Button onClick={fetchUserConversations} sx={{ mt: 2 }}>Try Again</Button>
            </Box>
          ) : conversations.length > 0 && !selectedConversation ? (
            // List of existing conversations
            <Box sx={{ overflow: 'auto', flexGrow: 1 }}>
              <Typography variant="subtitle1" sx={{ p: 2, bgcolor: 'background.paper' }}>
                Your Support Conversations
              </Typography>
              {conversations.map(conversation => (
                <Paper 
                  key={conversation._id}
                  elevation={1} 
                  sx={{ 
                    m: 1, 
                    p: 2, 
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                  onClick={() => setSelectedConversation(conversation)}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle2">
                      {conversation.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatMessageTime(conversation.lastMessage)}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {conversation.messages[conversation.messages.length - 1]?.text}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                    <Typography variant="caption" 
                      color={conversation.status === 'active' ? 'success.main' : 
                            conversation.status === 'pending' ? 'warning.main' : 
                            'text.secondary'}>
                      {conversation.status.toUpperCase()}
                    </Typography>
                    {conversation.messages.filter(m => m.sender === 'admin' && !m.read).length > 0 && (
                      <Badge badgeContent={conversation.messages.filter(m => m.sender === 'admin' && !m.read).length} color="error" />
                    )}
                  </Box>
                </Paper>
              ))}
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                <Button 
                  variant="outlined" 
                  onClick={handleStartNewConversation}
                  startIcon={<ChatIcon />}
                >
                  Start New Conversation
                </Button>
              </Box>
            </Box>
          ) : (
            // Chat Window
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              {selectedConversation && conversations.length > 1 && (
                <Box sx={{ p: 1, bgcolor: 'background.paper', borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}>
                  <Button size="small" onClick={() => setSelectedConversation(null)}>
                    Back to Conversations
                  </Button>
                </Box>
              )}
              
              <Box sx={{ p: 2, flexGrow: 1, overflow: 'auto' }}>
                {selectedConversation && selectedConversation.messages.map(renderMessage)}
                {!selectedConversation && (
                  <Box sx={{ textAlign: 'center', mt: 2 }}>
                    <Typography variant="body1" gutterBottom>
                      Start a new conversation with our support team.
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      We're here to help with any questions or issues you might have.
                    </Typography>
                  </Box>
                )}
                <div ref={messagesEndRef} />
              </Box>
            </Box>
          )}
        </DialogContent>

        <Divider />
        
        <DialogActions sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
          <TextField
            fullWidth
            placeholder="Type your message here..."
            variant="outlined"
            value={message}
            onChange={handleMessageChange}
            onKeyPress={handleKeyPress}
            disabled={sendingMessage}
            size="small"
            multiline
            maxRows={4}
            sx={{ mr: 1 }}
          />
          <Button
            variant="contained"
            color="primary"
            endIcon={sendingMessage ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
            onClick={handleSendMessage}
            disabled={!message.trim() || sendingMessage}
          >
            Send
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AdminChat; 