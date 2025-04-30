import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Divider
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import ForumIcon from '@mui/icons-material/Forum';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import Chatbot from '../components/customer/Chatbot';
import AdminChat from '../components/customer/AdminChat';
import faqData from '../constants/faqData';
import { setDocumentTitle, PAGE_TITLES } from '../utils/titleUtils';

const CustomerSupport = () => {
  useEffect(() => {
    setDocumentTitle(PAGE_TITLES.SUPPORT);
  }, []);

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Header */}
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Customer Support
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto' }}>
          We're here to help! Browse our frequently asked questions, use our AI assistant, or chat directly with our support team.
        </Typography>
      </Box>

      {/* Contact cards */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <EmailIcon color="primary" sx={{ mr: 1, fontSize: 28 }} />
                <Typography variant="h6">Email Support</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Send us an email and we'll respond within 24 hours during business days.
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" color="primary">
                support@aypa.com
              </Button>
            </CardActions>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PhoneIcon color="primary" sx={{ mr: 1, fontSize: 28 }} />
                <Typography variant="h6">Phone Support</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Call us Monday through Friday, 9 AM to 5 PM EST.
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" color="primary">
                +1-800-123-4567
              </Button>
            </CardActions>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SupportAgentIcon color="primary" sx={{ mr: 1, fontSize: 28 }} />
                <Typography variant="h6">Direct Admin Chat</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Chat directly with our support team for personalized assistance with your specific issues.
              </Typography>
            </CardContent>
            <CardActions>
              <Button 
                size="small" 
                color="primary" 
                variant="contained"
                onClick={() => {
                  const chatButton = document.querySelector("[aria-label='chat with support']");
                  if (chatButton) chatButton.click();
                }}
              >
                Chat with an Admin
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>

      {/* FAQ Section */}
      <Paper elevation={1} sx={{ p: 4, mb: 6 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <HelpOutlineIcon color="primary" sx={{ mr: 1, fontSize: 30 }} />
          <Typography variant="h5" component="h2">
            Frequently Asked Questions
          </Typography>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        {faqData.map((faq) => (
          <Accordion key={faq.id} disableGutters elevation={0} sx={{ mb: 1, border: '1px solid rgba(0, 0, 0, 0.12)', '&:before': { display: 'none' } }}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={`panel${faq.id}-content`}
              id={`panel${faq.id}-header`}
              sx={{ bgcolor: 'rgba(0, 0, 0, 0.02)' }}
            >
              <Typography variant="subtitle1">{faq.question}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                {faq.answer}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Paper>
      
      {/* Support Options Section */}
      <Paper elevation={1} sx={{ p: 4, mb: 6 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <ForumIcon color="primary" sx={{ mr: 1, fontSize: 30 }} />
          <Typography variant="h5" component="h2">
            Support Options
          </Typography>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Box>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <SupportAgentIcon sx={{ mr: 1 }} /> Talk to an Admin
              </Typography>
              <Typography variant="body2" paragraph>
                Need personalized help? Chat directly with our support team. Your conversation will be saved so you can always refer back to it later.
              </Typography>
              <Button 
                variant="contained" 
                color="primary"
                onClick={() => {
                  const chatButton = document.querySelector("[aria-label='chat with support']");
                  if (chatButton) chatButton.click();
                }}
              >
                Start Admin Chat
              </Button>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box>
              <Typography variant="h6" gutterBottom>
                Virtual AI Assistant
              </Typography>
              <Typography variant="body2" paragraph>
                Get immediate answers to common questions from our AI assistant. Available 24/7 for quick help.
              </Typography>
              <Button 
                variant="outlined" 
                color="primary"
                onClick={() => {
                  const botIcon = document.querySelector('.Chatbot-trigger');
                  if (botIcon) botIcon.click();
                }}
              >
                Ask AI Assistant
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {/* AI Assistant */}
      <Chatbot />
      
      {/* Admin Direct Chat */}
      <AdminChat />
    </Container>
  );
};

export default CustomerSupport; 