import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Link, 
  Divider, 
  Grid, 
  IconButton, 
  Stack,
  useTheme,
  alpha,
  Button,
  TextField,
  Paper
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import {
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  Instagram as InstagramIcon,
  LinkedIn as LinkedInIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Send as SendIcon
} from '@mui/icons-material';
import logo from '../assets/logo.png';

const Footer = () => {
  const theme = useTheme();
  
  return (
    <Box
      component="footer"
      sx={{
        py: 6,
        px: 2,
        mt: 'auto',
        backgroundColor: theme.palette.background.dark,
        color: 'white'
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <img src={logo} alt="AYPA Logo" style={{ height: 40, marginRight: 12 }} />
              <Typography 
                variant="h5" 
                gutterBottom 
                sx={{ 
                  fontWeight: 700, 
                  color: theme.palette.accent.main,
                  m: 0
                }}
              >
                AYPA
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ mb: 3, color: alpha(theme.palette.common.white, 0.7) }}>
              Your one-stop shop for custom apparel and accessories. We provide high-quality
              products with customized designs for your specific needs.
            </Typography>
            <Stack direction="row" spacing={1}>
              <IconButton 
                size="small" 
                aria-label="facebook" 
                sx={{ 
                  color: theme.palette.common.white,
                  '&:hover': { color: theme.palette.primary.main },
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  '&:hover': { 
                    bgcolor: alpha(theme.palette.primary.main, 0.2),
                    color: theme.palette.accent.main
                  }
                }}
              >
                <FacebookIcon />
              </IconButton>
              <IconButton 
                size="small" 
                aria-label="twitter" 
                sx={{ 
                  color: theme.palette.common.white,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  '&:hover': { 
                    bgcolor: alpha(theme.palette.primary.main, 0.2),
                    color: theme.palette.accent.main
                  }
                }}
              >
                <TwitterIcon />
              </IconButton>
              <IconButton 
                size="small" 
                aria-label="instagram" 
                sx={{ 
                  color: theme.palette.common.white,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  '&:hover': { 
                    bgcolor: alpha(theme.palette.primary.main, 0.2),
                    color: theme.palette.accent.main
                  }
                }}
              >
                <InstagramIcon />
              </IconButton>
              <IconButton 
                size="small" 
                aria-label="linkedin" 
                sx={{ 
                  color: theme.palette.common.white,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  '&:hover': { 
                    bgcolor: alpha(theme.palette.primary.main, 0.2),
                    color: theme.palette.accent.main
                  }
                }}
              >
                <LinkedInIcon />
              </IconButton>
            </Stack>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Typography 
              variant="h6" 
              gutterBottom 
              sx={{ 
                fontWeight: 600,
                color: theme.palette.common.white,
                mb: 3
              }}
            >
              Quick Links
            </Typography>
            <Stack spacing={2}>
              <Link 
                component={RouterLink} 
                to="/" 
                sx={{ 
                  color: alpha(theme.palette.common.white, 0.7),
                  textDecoration: 'none',
                  display: 'block',
                  transition: 'all 0.2s ease',
                  '&:hover': { 
                    color: theme.palette.accent.main,
                    transform: 'translateX(5px)'
                  }
                }}
              >
                Home
              </Link>
              <Link 
                component={RouterLink} 
                to="/products" 
                sx={{ 
                  color: alpha(theme.palette.common.white, 0.7),
                  textDecoration: 'none',
                  display: 'block',
                  transition: 'all 0.2s ease',
                  '&:hover': { 
                    color: theme.palette.accent.main,
                    transform: 'translateX(5px)'
                  }
                }}
              >
                Products
              </Link>
              <Link 
                component={RouterLink} 
                to="/cart" 
                sx={{ 
                  color: alpha(theme.palette.common.white, 0.7),
                  textDecoration: 'none',
                  display: 'block',
                  transition: 'all 0.2s ease',
                  '&:hover': { 
                    color: theme.palette.accent.main,
                    transform: 'translateX(5px)'
                  }
                }}
              >
                Cart
              </Link>
              <Link 
                component={RouterLink} 
                to="/login" 
                sx={{ 
                  color: alpha(theme.palette.common.white, 0.7),
                  textDecoration: 'none',
                  display: 'block',
                  transition: 'all 0.2s ease',
                  '&:hover': { 
                    color: theme.palette.accent.main,
                    transform: 'translateX(5px)'
                  }
                }}
              >
                Account
              </Link>
            </Stack>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography 
              variant="h6" 
              gutterBottom 
              sx={{ 
                fontWeight: 600,
                color: theme.palette.common.white,
                mb: 3
              }}
            >
              Contact Us
            </Typography>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LocationIcon 
                  fontSize="small" 
                  sx={{ 
                    color: theme.palette.accent.main,
                    mr: 1.5
                  }} 
                />
                <Typography variant="body2" sx={{ color: alpha(theme.palette.common.white, 0.7) }}>
                  123 Main Street, City, Country
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PhoneIcon 
                  fontSize="small" 
                  sx={{ 
                    color: theme.palette.accent.main,
                    mr: 1.5
                  }} 
                />
                <Typography variant="body2" sx={{ color: alpha(theme.palette.common.white, 0.7) }}>
                  +1 (123) 456-7890
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <EmailIcon 
                  fontSize="small" 
                  sx={{ 
                    color: theme.palette.accent.main,
                    mr: 1.5
                  }} 
                />
                <Typography variant="body2" sx={{ color: alpha(theme.palette.common.white, 0.7) }}>
                  info@aypa-shop.com
                </Typography>
              </Box>
            </Stack>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography 
              variant="h6" 
              gutterBottom 
              sx={{ 
                fontWeight: 600,
                color: theme.palette.common.white,
                mb: 3
              }}
            >
              Newsletter
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, color: alpha(theme.palette.common.white, 0.7) }}>
              Subscribe to receive updates on new arrivals and special offers
            </Typography>
            <Paper
              component="form"
              sx={{ 
                p: '2px 4px', 
                display: 'flex', 
                alignItems: 'center',
                bgcolor: alpha(theme.palette.common.white, 0.05),
                border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
                borderRadius: 2
              }}
            >
              <TextField
                size="small"
                placeholder="Your email address"
                variant="standard"
                fullWidth
                InputProps={{
                  disableUnderline: true,
                  sx: { 
                    px: 1,
                    color: 'white',
                    '&::placeholder': {
                      color: alpha(theme.palette.common.white, 0.5),
                    }
                  }
                }}
              />
              <IconButton 
                type="submit" 
                aria-label="subscribe" 
                sx={{ 
                  color: theme.palette.accent.main,
                  p: '10px',
                  '&:hover': {
                    bgcolor: alpha(theme.palette.accent.main, 0.1)
                  }
                }}
              >
                <SendIcon />
              </IconButton>
            </Paper>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 4, borderColor: alpha(theme.palette.common.white, 0.1) }} />
        
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" sx={{ color: alpha(theme.palette.common.white, 0.6), mb: { xs: 2, sm: 0 } }}>
            © {new Date().getFullYear()} AYPA E-commerce. All rights reserved.
          </Typography>
          <Box>
            <Link 
              href="#" 
              sx={{ 
                color: alpha(theme.palette.common.white, 0.6), 
                mx: 1,
                textDecoration: 'none',
                '&:hover': { color: theme.palette.accent.main }
              }}
            >
              Privacy Policy
            </Link>
            <Link 
              href="#" 
              sx={{ 
                color: alpha(theme.palette.common.white, 0.6), 
                mx: 1,
                textDecoration: 'none',
                '&:hover': { color: theme.palette.accent.main }
              }}
            >
              Terms of Service
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer; 