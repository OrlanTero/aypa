import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  TextField,
  Button,
  IconButton,
  Badge,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress
} from '@mui/material';
import {
  Send as SendIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  SupportAgent as SupportAgentIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  ScheduleSend as ScheduleSendIcon
} from '@mui/icons-material';
import { conversationsAPI } from '../../utils/api';
import { setDocumentTitle, PAGE_TITLES } from '../../utils/titleUtils';

const Messages = () => {
  const [conversations, setConversations] = useState([]);
  const [filteredConversations, setFilteredConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const messagesEndRef = useRef(null);
  const pollingInterval = useRef(null);

  useEffect(() => {
    setDocumentTitle(PAGE_TITLES.ADMIN_MESSAGES || 'Admin Messages');
    fetchConversations();

    // Set up polling for new messages
    pollingInterval.current = setInterval(() => {
      refreshConversations();
    }, 10000); // Poll every 10 seconds

    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, []);

  useEffect(() => {
    // Apply filters and search
    let filtered = [...conversations];

    // Apply status filter
    if (filter !== 'all') {
      filtered = filtered.filter(conv => conv.status === filter);
    }

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(conv => {
        // Search in messages
        const messageMatch = conv.messages.some(msg => 
          msg.text.toLowerCase().includes(query)
        );
        
        // Search in user info
        const userMatch = conv.user && (
          (conv.user.name && conv.user.name.toLowerCase().includes(query)) ||
          (conv.user.email && conv.user.email.toLowerCase().includes(query))
        );
        
        return messageMatch || userMatch;
      });
    }

    setFilteredConversations(filtered);
  }, [conversations, filter, searchQuery]);

  useEffect(() => {
    scrollToBottom();

    // Mark as read when selecting a conversation
    if (selectedConversation) {
      markConversationAsRead(selectedConversation._id);
    }
  }, [selectedConversation]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await conversationsAPI.getAllConversations();
      setConversations(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setLoading(false);
    }
  };

  const refreshConversations = async () => {
    try {
      setRefreshing(true);
      const response = await conversationsAPI.getAllConversations();
      setConversations(response.data);
      
      // If a conversation is selected, refresh it with the latest data
      if (selectedConversation) {
        const updated = response.data.find(c => c._id === selectedConversation._id);
        if (updated) {
          setSelectedConversation(updated);
        }
      }
      
      setRefreshing(false);
    } catch (error) {
      console.error('Error refreshing conversations:', error);
      setRefreshing(false);
    }
  };

  const markConversationAsRead = async (conversationId) => {
    try {
      await conversationsAPI.markAsRead(conversationId);
      
      // Update the local state to mark messages as read
      setConversations(prev => prev.map(conv => {
        if (conv._id === conversationId) {
          const updatedMessages = conv.messages.map(msg => {
            if (msg.sender === 'user') {
              return { ...msg, read: true };
            }
            return msg;
          });
          return { ...conv, messages: updatedMessages };
        }
        return conv;
      }));
    } catch (error) {
      console.error('Error marking conversation as read:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedConversation) return;

    try {
      setSendingMessage(true);
      const response = await conversationsAPI.addMessage(selectedConversation._id, message.trim());
      setSelectedConversation(response.data);
      
      // Update the conversation in the list
      setConversations(prev => prev.map(conv => {
        if (conv._id === selectedConversation._id) {
          return response.data;
        }
        return conv;
      }));
      
      setMessage('');
      setSendingMessage(false);
    } catch (error) {
      console.error('Error sending message:', error);
      setSendingMessage(false);
    }
  };

  const handleUpdateStatus = async (status) => {
    if (!selectedConversation) return;

    try {
      const response = await conversationsAPI.updateStatus(selectedConversation._id, status);
      
      // Update selected conversation
      setSelectedConversation(response.data);
      
      // Update in the list
      setConversations(prev => prev.map(conv => {
        if (conv._id === selectedConversation._id) {
          return response.data;
        }
        return conv;
      }));
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatMessageTime = (timestamp) => {
    try {
      const messageDate = new Date(timestamp);
      const now = new Date();
      
      // If it's today, show time only
      if (messageDate.toDateString() === now.toDateString()) {
        return messageDate.toLocaleTimeString(undefined, {
          hour: '2-digit',
          minute: '2-digit'
        });
      }
      
      // Calculate time difference
      const diffMs = now - messageDate;
      const diffSeconds = Math.floor(diffMs / 1000);
      const diffMinutes = Math.floor(diffSeconds / 60);
      const diffHours = Math.floor(diffMinutes / 60);
      const diffDays = Math.floor(diffHours / 24);
      
      // If it's within the last 7 days, show relative time
      if (diffDays < 7) {
        if (diffDays === 0) {
          if (diffHours === 0) {
            if (diffMinutes === 0) {
              return 'just now';
            }
            return `${diffMinutes} min ago`;
          }
          return `${diffHours} hr ago`;
        }
        if (diffDays === 1) {
          return 'yesterday';
        }
        return `${diffDays} days ago`;
      }
      
      // Otherwise show date
      return messageDate.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: now.getFullYear() !== messageDate.getFullYear() ? 'numeric' : undefined
      });
    } catch (error) {
      return 'Unknown time';
    }
  };

  const getUnreadCount = (conversation) => {
    return conversation.messages.filter(msg => msg.sender === 'user' && !msg.read).length;
  };

  return (
    <Box sx={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ px: 3, pt: 3 }}>
        Customer Support Messages
      </Typography>
      
      <Box sx={{ px: 3, pb: 2, display: 'flex', alignItems: 'center' }}>
        <Button 
          startIcon={<RefreshIcon />} 
          onClick={refreshConversations}
          disabled={refreshing}
          sx={{ mr: 2 }}
        >
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
        
        <FormControl variant="outlined" size="small" sx={{ minWidth: 150, mr: 2 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            label="Status"
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="resolved">Resolved</MenuItem>
          </Select>
        </FormControl>
        
        <TextField
          placeholder="Search messages or users..."
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />
          }}
          sx={{ flexGrow: 1 }}
        />
      </Box>
      
      <Divider />
      
      <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
        {/* Conversation List */}
        <Box sx={{ width: 320, borderRight: '1px solid rgba(0, 0, 0, 0.12)', overflow: 'auto' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <CircularProgress />
            </Box>
          ) : filteredConversations.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="text.secondary">No conversations found</Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {filteredConversations.map((conversation) => {
                const unreadCount = getUnreadCount(conversation);
                const lastMessage = conversation.messages[conversation.messages.length - 1];
                
                return (
                  <ListItem
                    key={conversation._id}
                    button
                    selected={selectedConversation?._id === conversation._id}
                    onClick={() => setSelectedConversation(conversation)}
                    sx={{ 
                      borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
                      bgcolor: unreadCount > 0 ? 'rgba(0, 0, 0, 0.04)' : 'inherit'
                    }}
                  >
                    <ListItemAvatar>
                      <Badge
                        badgeContent={unreadCount}
                        color="error"
                        overlap="circular"
                        anchorOrigin={{
                          vertical: 'top',
                          horizontal: 'right',
                        }}
                      >
                        <Avatar src={conversation.user?.avatar}>
                          <PersonIcon />
                        </Avatar>
                      </Badge>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography
                            variant="subtitle2"
                            sx={{ 
                              fontWeight: unreadCount > 0 ? 700 : 500,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              maxWidth: 180
                            }}
                          >
                            {conversation.user?.name || 'Anonymous User'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {lastMessage && formatMessageTime(lastMessage.createdAt)}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ 
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              fontWeight: unreadCount > 0 ? 600 : 400,
                              mb: 0.5
                            }}
                          >
                            {lastMessage?.text || 'No messages'}
                          </Typography>
                          <Chip
                            label={conversation.status.toUpperCase()}
                            size="small"
                            color={
                              conversation.status === 'active' ? 'primary' :
                              conversation.status === 'pending' ? 'warning' : 'success'
                            }
                            sx={{ height: 22, fontSize: '0.7rem' }}
                          />
                        </Box>
                      }
                    />
                  </ListItem>
                );
              })}
            </List>
          )}
        </Box>
        
        {/* Conversation Detail */}
        <Box sx={{ 
          flexGrow: 1, 
          display: 'flex', 
          flexDirection: 'column',
          bgcolor: 'background.default'
        }}>
          {selectedConversation ? (
            <>
              {/* Conversation Header */}
              <Box sx={{ 
                p: 2, 
                borderBottom: '1px solid rgba(0, 0, 0, 0.12)', 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                bgcolor: 'background.paper'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar 
                    src={selectedConversation.user?.avatar}
                    sx={{ mr: 1.5 }}
                  >
                    <PersonIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1">
                      {selectedConversation.user?.name || 'Anonymous User'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedConversation.user?.email || 'No email'}
                    </Typography>
                  </Box>
                </Box>
                
                <Box>
                  <Chip
                    label={selectedConversation.status.toUpperCase()}
                    color={
                      selectedConversation.status === 'active' ? 'primary' :
                      selectedConversation.status === 'pending' ? 'warning' : 'success'
                    }
                    sx={{ mr: 1 }}
                  />
                  <FormControl size="small" variant="outlined" sx={{ minWidth: 120 }}>
                    <InputLabel>Change Status</InputLabel>
                    <Select
                      value=""
                      onChange={(e) => handleUpdateStatus(e.target.value)}
                      label="Change Status"
                    >
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="resolved">Resolved</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Box>
              
              {/* Messages */}
              <Box sx={{ 
                p: 3, 
                flexGrow: 1, 
                overflow: 'auto',
                display: 'flex',
                flexDirection: 'column'
              }}>
                {selectedConversation.messages.map((msg, index) => (
                  <Box
                    key={index}
                    sx={{
                      alignSelf: msg.sender === 'admin' ? 'flex-end' : 'flex-start',
                      maxWidth: '70%',
                      mb: 2,
                      display: 'flex',
                      flexDirection: msg.sender === 'admin' ? 'row-reverse' : 'row',
                      alignItems: 'flex-start'
                    }}
                  >
                    <Avatar
                      sx={{ 
                        bgcolor: msg.sender === 'admin' ? 'primary.main' : 'grey.400',
                        width: 36,
                        height: 36,
                        ml: msg.sender === 'admin' ? 1 : 0,
                        mr: msg.sender === 'admin' ? 0 : 1
                      }}
                    >
                      {msg.sender === 'admin' ? <SupportAgentIcon /> : <PersonIcon />}
                    </Avatar>
                    <Paper
                      elevation={1}
                      sx={{
                        p: 2,
                        bgcolor: msg.sender === 'admin' ? 'primary.light' : 'background.paper',
                        color: msg.sender === 'admin' ? 'white' : 'text.primary',
                        borderRadius: 2
                      }}
                    >
                      <Typography variant="body1">{msg.text}</Typography>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          display: 'block', 
                          mt: 0.5, 
                          textAlign: 'right',
                          color: msg.sender === 'admin' ? 'rgba(255,255,255,0.7)' : 'text.secondary'
                        }}
                      >
                        {formatMessageTime(msg.createdAt)}
                        {msg.read && msg.sender === 'admin' && (
                          <CheckCircleIcon sx={{ ml: 0.5, fontSize: 12 }} />
                        )}
                      </Typography>
                    </Paper>
                  </Box>
                ))}
                <div ref={messagesEndRef} />
              </Box>
              
              {/* Message Input */}
              <Box sx={{ 
                p: 2, 
                borderTop: '1px solid rgba(0, 0, 0, 0.12)',
                bgcolor: 'background.paper',
                display: 'flex'
              }}>
                <TextField
                  fullWidth
                  placeholder="Type your reply..."
                  variant="outlined"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  multiline
                  rows={2}
                  sx={{ mr: 1 }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  disabled={!message.trim() || sendingMessage}
                  onClick={handleSendMessage}
                  sx={{ alignSelf: 'flex-end' }}
                >
                  {sendingMessage ? <CircularProgress size={24} /> : <SendIcon />}
                </Button>
              </Box>
            </>
          ) : (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: '100%',
              flexDirection: 'column',
              p: 3,
              textAlign: 'center'
            }}>
              <SupportAgentIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Select a Conversation
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400 }}>
                Choose a customer conversation from the left panel to view messages and respond.
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Messages; 