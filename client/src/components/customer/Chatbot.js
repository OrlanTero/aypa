import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Paper, 
  Typography, 
  TextField, 
  IconButton, 
  Fab, 
  Avatar, 
  List, 
  ListItem, 
  ListItemText, 
  Collapse,
  Divider,
  Button
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LaunchIcon from '@mui/icons-material/Launch';
import faqData from '../../constants/faqData';

const Chatbot = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      sender: 'bot', 
      text: "Hello! I'm your virtual assistant. How can I help you today?" 
    }
  ]);
  const [suggestedQuestions, setSuggestedQuestions] = useState([
    "How do I place an order?",
    "What payment methods do you accept?",
    "How can I track my order?"
  ]);
  
  const messagesEndRef = useRef(null);

  // Function to scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSuggestedQuestionClick = (question) => {
    handleSendMessage(question);
  };

  const findAnswer = (question) => {
    // Simple search algorithm - could be improved with more advanced NLP
    const lowerQuestion = question.toLowerCase();
    
    // Check for specific navigation requests
    if (lowerQuestion.includes('support page') || lowerQuestion.includes('help page')) {
      return "You can visit our <a href='/support' style='color: #0599DF; text-decoration: underline;'>Support Page</a> for more detailed information and assistance.";
    }
    
    if (lowerQuestion.includes('talk to human') || lowerQuestion.includes('real person') || lowerQuestion.includes('agent')) {
      return "To speak with a customer service representative, please call us at +1-800-123-4567 or visit our <a href='/support' style='color: #0599DF; text-decoration: underline;'>Support Page</a> to use our contact form.";
    }
    
    if (lowerQuestion.includes('all faqs') || lowerQuestion.includes('more questions')) {
      return "You can find our complete list of FAQs on our <a href='/support' style='color: #0599DF; text-decoration: underline;'>Support Page</a>.";
    }
    
    // Check for exact matches first
    const exactMatch = faqData.find(item => 
      item.question.toLowerCase() === lowerQuestion
    );
    
    if (exactMatch) {
      return exactMatch.answer + " <br><br><a href='/support' style='color: #0599DF; text-decoration: underline;'>See more details in our Support section</a>.";
    }
    
    // Check for keyword matches
    const keywordMatch = faqData.find(item => 
      lowerQuestion.includes(item.question.toLowerCase().split(' ').slice(1).join(' ')) || 
      item.question.toLowerCase().includes(lowerQuestion)
    );
    
    if (keywordMatch) {
      return keywordMatch.answer + " <br><br><a href='/support' style='color: #0599DF; text-decoration: underline;'>See more details in our Support section</a>.";
    }
    
    // If no match found
    return "I'm sorry, I don't have information on that specific question. Would you like to visit our <a href='/support' style='color: #0599DF; text-decoration: underline;'>Support Page</a> for more detailed help, or connect with a human agent?";
  };

  const handleSendMessage = (text = inputValue) => {
    if (!text.trim()) return;
    
    // Add user message
    const userMessage = {
      id: messages.length + 1,
      sender: 'user',
      text: text
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    
    // Find answer from FAQ database
    const botAnswer = findAnswer(text);
    
    // Add bot response with slight delay to simulate thinking
    setTimeout(() => {
      const botMessage = {
        id: messages.length + 2,
        sender: 'bot',
        text: botAnswer
      };
      
      setMessages(prevMessages => [...prevMessages, botMessage]);
      
      // Update suggested questions based on context
      updateSuggestedQuestions(text);
    }, 500);
    
    setInputValue('');
  };

  const updateSuggestedQuestions = (lastQuestion) => {
    // Simple logic to update suggested questions based on context
    const lowerQuestion = lastQuestion.toLowerCase();
    
    if (lowerQuestion.includes('order') || lowerQuestion.includes('purchase')) {
      setSuggestedQuestions([
        "How can I track my order?",
        "How do I change or cancel my order?",
        "What is your return policy?"
      ]);
    } else if (lowerQuestion.includes('payment') || lowerQuestion.includes('pay')) {
      setSuggestedQuestions([
        "What payment methods do you accept?",
        "Are my payment details secure?",
        "Do you offer discounts or promotions?"
      ]);
    } else if (lowerQuestion.includes('shipping') || lowerQuestion.includes('delivery')) {
      setSuggestedQuestions([
        "How long does shipping take?",
        "Do you ship internationally?",
        "How can I track my order?"
      ]);
    } else {
      // Default suggestions
      setSuggestedQuestions([
        "What is your return policy?",
        "How can I contact customer support?",
        "Do you offer discounts or promotions?"
      ]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleGoToSupport = () => {
    setIsOpen(false);
    navigate('/support');
  };

  return (
    <>
      {/* Chat button */}
      <Fab 
        color="primary" 
        aria-label="chat" 
        onClick={toggleChat}
        sx={{ 
          position: 'fixed', 
          bottom: 20, 
          right: 20,
          zIndex: 1000
        }}
      >
        <ChatIcon />
      </Fab>
      
      {/* Chat window */}
      <Collapse in={isOpen} timeout="auto">
        <Paper
          elevation={3}
          sx={{
            position: 'fixed',
            bottom: 90,
            right: 20,
            width: 350,
            height: 500,
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1000,
            borderRadius: 2,
            overflow: 'hidden'
          }}
        >
          {/* Chat header */}
          <Box
            sx={{
              p: 2,
              bgcolor: 'primary.main',
              color: 'white',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <SupportAgentIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Customer Support</Typography>
            </Box>
            <Box sx={{ display: 'flex' }}>
              <IconButton 
                onClick={handleGoToSupport} 
                sx={{ color: 'white', mr: 1 }}
                title="Go to full support page"
              >
                <LaunchIcon fontSize="small" />
              </IconButton>
              <IconButton onClick={toggleChat} sx={{ color: 'white' }}>
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>
          
          {/* Chat messages */}
          <Box
            sx={{
              p: 2,
              flexGrow: 1,
              overflow: 'auto',
              bgcolor: '#f5f5f5'
            }}
          >
            {messages.map((message) => (
              <Box
                key={message.id}
                sx={{
                  display: 'flex',
                  justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                  mb: 2
                }}
              >
                {message.sender === 'bot' && (
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 1 }}>
                    <SupportAgentIcon />
                  </Avatar>
                )}
                <Paper
                  sx={{
                    p: 1.5,
                    maxWidth: '70%',
                    borderRadius: 2,
                    bgcolor: message.sender === 'user' ? 'primary.light' : 'white',
                    color: message.sender === 'user' ? 'white' : 'text.primary'
                  }}
                >
                  {message.sender === 'bot' ? (
                    <Typography
                      variant="body2"
                      dangerouslySetInnerHTML={{ __html: message.text }}
                    />
                  ) : (
                    <Typography variant="body2">{message.text}</Typography>
                  )}
                </Paper>
                {message.sender === 'user' && (
                  <Avatar sx={{ bgcolor: 'grey.400', ml: 1 }}>
                    <AccountCircleIcon />
                  </Avatar>
                )}
              </Box>
            ))}
            <div ref={messagesEndRef} />
          </Box>
          
          {/* Suggested questions */}
          <Box sx={{ p: 1, bgcolor: '#e0e0e0' }}>
            <Typography variant="caption" sx={{ pl: 1, color: 'text.secondary' }}>
              Suggested questions:
            </Typography>
            <List dense disablePadding>
              {suggestedQuestions.map((question, index) => (
                <ListItem 
                  key={index} 
                  button 
                  dense
                  onClick={() => handleSuggestedQuestionClick(question)}
                  sx={{ 
                    py: 0.5, 
                    borderRadius: 1,
                    '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' }
                  }}
                >
                  <ListItemText 
                    primary={question} 
                    primaryTypographyProps={{ 
                      variant: 'body2', 
                      color: 'primary',
                      style: { fontWeight: 500 }
                    }} 
                  />
                </ListItem>
              ))}
            </List>
          </Box>
          
          <Divider />
          
          {/* Chat input */}
          <Box
            sx={{
              p: 1,
              display: 'flex',
              alignItems: 'center',
              bgcolor: 'background.paper'
            }}
          >
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Type your question..."
              size="small"
              value={inputValue}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              sx={{ mr: 1 }}
            />
            <IconButton 
              color="primary" 
              onClick={() => handleSendMessage()} 
              disabled={!inputValue.trim()}
            >
              <SendIcon />
            </IconButton>
          </Box>
        </Paper>
      </Collapse>
    </>
  );
};

export default Chatbot; 