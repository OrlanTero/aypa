import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Paper,
  Divider,
  IconButton,
  CircularProgress,
  Card,
  CardMedia,
  CardContent,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  ShoppingCart as CartIcon
} from '@mui/icons-material';
import { CartContext } from '../context/CartContext';
import { formatCurrency } from '../utils/formatters';
import defaultProductImage from '../assets/default-product.jpg';
import { setDocumentTitle, PAGE_TITLES } from '../utils/titleUtils';

const Cart = () => {
  const navigate = useNavigate();
  const { cart, loading, updateCartItem, removeFromCart } = useContext(CartContext);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });

  const handleQuantityChange = async (itemId, change) => {
    const item = cart.items.find((item) => item._id === itemId);
    if (item) {
      const newQuantity = Math.max(1, item.quantity + change);
      const result = await updateCartItem(itemId, newQuantity);
      
      if (result && result.error) {
        if (result.message && result.message.includes('Authentication required')) {
          setNotification({
            open: true,
            message: 'Please log in again to continue shopping',
            severity: 'warning'
          });
        } else {
          setNotification({
            open: true,
            message: result.message,
            severity: 'error'
          });
        }
      }
    }
  };

  const handleRemoveItem = async (itemId) => {
    await removeFromCart(itemId);
  };

  const handleContinueShopping = () => {
    navigate('/');
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  useEffect(() => {
    setDocumentTitle(PAGE_TITLES.CART);
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ pt: { xs: 1, sm: 2 }, pb: { xs: 4, sm: 8 } }}>
      <Typography 
        variant="h4" 
        component="h1" 
        gutterBottom
        sx={{ 
          fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' },
          fontWeight: 600
        }}
      >
        Your Cart
      </Typography>

      {cart.items.length === 0 ? (
        <Paper sx={{ p: { xs: 3, sm: 4 }, textAlign: 'center', mt: { xs: 2, sm: 4 } }}>
          <CartIcon sx={{ fontSize: { xs: 40, sm: 60 }, color: 'text.secondary', mb: 2 }} />
          <Typography 
            variant="h5" 
            gutterBottom
            sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
          >
            Your cart is empty
          </Typography>
          <Typography color="text.secondary" paragraph>
            Looks like you haven't added any items to your cart yet.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={handleContinueShopping}
            sx={{ mt: 2 }}
          >
            Continue Shopping
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={{ xs: 2, md: 4 }}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: { xs: 1.5, sm: 3 } }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 2, 
                  px: { xs: 1, sm: 0 },
                  fontSize: { xs: '1rem', sm: '1.25rem' }
                }}
              >
                Cart Items ({cart.items.reduce((total, item) => total + item.quantity, 0)})
              </Typography>
              
              {cart.items.map((item) => (
                <Card 
                  key={item._id} 
                  sx={{ 
                    display: 'flex', 
                    mb: 2, 
                    flexDirection: { xs: 'column', sm: 'row' },
                    overflow: 'hidden'
                  }}
                >
                  <Box
                    sx={{
                      width: { xs: '100%', sm: 150 },
                      height: { xs: 140, sm: 150 },
                      position: 'relative'
                    }}
                  >
                    <CardMedia
                      component="img"
                      sx={{ 
                        width: '100%', 
                        height: '100%',
                        objectFit: 'contain',
                        p: 1,
                        backgroundColor: 'background.paper'
                      }}
                      src={item.product?.imageUrls?.[0] || item.product?.imageUrl || defaultProductImage}
                      alt={item.product?.name}
                    />
                  </Box>
                  <CardContent 
                    sx={{ 
                      flex: '1 0 auto', 
                      p: { xs: 1.5, sm: 2 },
                      width: { xs: '100%', sm: 'auto' }
                    }}
                  >
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: { xs: 'flex-start', sm: 'center' },
                        flexDirection: { xs: 'column', sm: 'row' },
                        mb: { xs: 1, sm: 0 }
                      }}
                    >
                      <Typography 
                        variant="h6" 
                        component="div"
                        sx={{ 
                          fontSize: { xs: '1rem', sm: '1.25rem' },
                          mb: { xs: 0.5, sm: 0 }
                        }}
                      >
                        {item.product?.name}
                      </Typography>
                      <Typography 
                        variant="h6" 
                        component="div"
                        sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
                      >
                        {formatCurrency(item.price * item.quantity)}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, my: 1 }}>
                      {item.size && (
                        <Typography variant="body2" color="text.secondary">
                          Size: {item.size}
                        </Typography>
                      )}
                      {item.color && (
                        <Typography variant="body2" color="text.secondary">
                          Color: {item.color}
                        </Typography>
                      )}
                      <Typography variant="body2" color="text.secondary">
                        Price: {formatCurrency(item.price)}
                      </Typography>
                    </Box>
                    
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        mt: 2,
                        flexWrap: { xs: 'wrap', sm: 'nowrap' },
                        gap: { xs: 1, sm: 0 }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton 
                          size="small" 
                          onClick={() => handleQuantityChange(item._id, -1)}
                          disabled={item.quantity <= 1}
                        >
                          <RemoveIcon fontSize="small" />
                        </IconButton>
                        <Typography sx={{ mx: 1, minWidth: '24px', textAlign: 'center' }}>
                          {item.quantity}
                        </Typography>
                        <IconButton 
                          size="small" 
                          onClick={() => handleQuantityChange(item._id, 1)}
                        >
                          <AddIcon fontSize="small" />
                        </IconButton>
                      </Box>
                      
                      <IconButton 
                        onClick={() => handleRemoveItem(item._id)}
                        color="error"
                        sx={{ ml: { xs: 'auto', sm: 2 } }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography 
                variant="h6" 
                gutterBottom
                sx={{ fontSize: { xs: '1.125rem', sm: '1.25rem' } }}
              >
                Order Summary
              </Typography>
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Subtotal</Typography>
                <Typography>{formatCurrency(cart.totalAmount)}</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Shipping</Typography>
                <Typography>Calculated at checkout</Typography>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6">Total</Typography>
                <Typography variant="h6">{formatCurrency(cart.totalAmount)}</Typography>
              </Box>
              
              <Button
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                sx={{ mb: 2, py: 1.5 }}
                onClick={handleCheckout}
              >
                Proceed to Checkout
              </Button>
              
              <Button
                variant="outlined"
                size="large"
                fullWidth
                onClick={handleContinueShopping}
              >
                Continue Shopping
              </Button>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Notification Snackbar */}
      <Snackbar 
        open={notification.open} 
        autoHideDuration={4000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Cart; 