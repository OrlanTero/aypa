import React from 'react';
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
import Chatbot from '../components/customer/Chatbot';
import faqData from '../constants/faqData';

const CustomerSupport = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Header */}
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Customer Support
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto' }}>
          We're here to help! Browse our frequently asked questions or use the chat assistant for immediate help.
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
                <ForumIcon color="primary" sx={{ mr: 1, fontSize: 28 }} />
                <Typography variant="h6">Live Chat</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Chat with our support team in real-time for immediate assistance.
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" color="primary">
                Start Chat
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
      
      {/* Virtual Assistant */}
      <Box sx={{ textAlign: 'center', mb: 8 }}>
        <Typography variant="h5" gutterBottom>
          Need More Help?
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Our virtual assistant is available 24/7 to answer your questions. Click the chat button in the bottom right corner.
        </Typography>
      </Box>
      
      {/* Chatbot component */}
      <Chatbot />
    </Container>
  );
};

export default CustomerSupport; 