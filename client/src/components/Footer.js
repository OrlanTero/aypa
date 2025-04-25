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
  alpha
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import {
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  Instagram as InstagramIcon,
  LinkedIn as LinkedInIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';

const Footer = () => {
  const theme = useTheme();
  
  return (
    <Box
      component="footer"
      sx={{
        py: 5,
        px: 2,
        mt: 'auto',
        backgroundColor: theme.palette.background.dark,
        color: 'white'
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={4}>
            <Typography 
              variant="h5" 
              gutterBottom 
              sx={{ 
                fontWeight: 700, 
                color: theme.palette.accent.main,
                mb: 2
              }}
            >
              AYPA Shop
            </Typography>
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
                  '&:hover': { color: theme.palette.primary.main }
                }}
              >
                <FacebookIcon />
              </IconButton>
              <IconButton 
                size="small" 
                aria-label="twitter" 
                sx={{ 
                  color: theme.palette.common.white,
                  '&:hover': { color: theme.palette.primary.main }
                }}
              >
                <TwitterIcon />
              </IconButton>
              <IconButton 
                size="small" 
                aria-label="instagram" 
                sx={{ 
                  color: theme.palette.common.white,
                  '&:hover': { color: theme.palette.primary.main }
                }}
              >
                <InstagramIcon />
              </IconButton>
              <IconButton 
                size="small" 
                aria-label="linkedin" 
                sx={{ 
                  color: theme.palette.common.white,
                  '&:hover': { color: theme.palette.primary.main }
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
                mb: 2
              }}
            >
              Quick Links
            </Typography>
            <Stack spacing={1.5}>
              <Link 
                component={RouterLink} 
                to="/" 
                sx={{ 
                  color: alpha(theme.palette.common.white, 0.7),
                  textDecoration: 'none',
                  '&:hover': { 
                    color: theme.palette.accent.main
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
                  '&:hover': { 
                    color: theme.palette.accent.main
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
                  '&:hover': { 
                    color: theme.palette.accent.main
                  }
                }}
              >
                Cart
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
                mb: 2
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
                mb: 2
              }}
            >
              Business Hours
            </Typography>
            <Box sx={{ mb: 1 }}>
              <Typography variant="subtitle2" sx={{ color: theme.palette.common.white }}>
                Monday - Friday
              </Typography>
              <Typography variant="body2" sx={{ color: alpha(theme.palette.common.white, 0.7) }}>
                9:00 AM - 6:00 PM
              </Typography>
            </Box>
            <Box sx={{ mb: 1 }}>
              <Typography variant="subtitle2" sx={{ color: theme.palette.common.white }}>
                Saturday
              </Typography>
              <Typography variant="body2" sx={{ color: alpha(theme.palette.common.white, 0.7) }}>
                10:00 AM - 4:00 PM
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ color: theme.palette.common.white }}>
                Sunday
              </Typography>
              <Typography variant="body2" sx={{ color: alpha(theme.palette.common.white, 0.7) }}>
                Closed
              </Typography>
            </Box>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 4, borderColor: alpha(theme.palette.common.white, 0.1) }} />
        
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: alpha(theme.palette.common.white, 0.6) }}>
            © {new Date().getFullYear()} AYPA E-commerce. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer; 