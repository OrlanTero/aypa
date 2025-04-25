import React, { useContext, useState } from 'react';
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ pt: 2, pb: 8 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Your Cart
      </Typography>

      {cart.items.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', mt: 4 }}>
          <CartIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
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
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: { xs: 2, md: 3 } }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Cart Items ({cart.items.reduce((total, item) => total + item.quantity, 0)})
              </Typography>
              
              {cart.items.map((item) => (
                <Card 
                  key={item._id} 
                  sx={{ 
                    display: 'flex', 
                    mb: 2, 
                    flexDirection: { xs: 'column', sm: 'row' } 
                  }}
                >
                  <CardMedia
                    component="img"
                    sx={{ 
                      width: { xs: '100%', sm: 150 }, 
                      height: { xs: 200, sm: 150 }, 
                      objectFit: 'cover' 
                    }}
                    image={item.product?.imageUrl || defaultProductImage}
                    alt={item.product?.name}
                  />
                  <CardContent sx={{ flex: '1 0 auto', p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="h6" component="div">
                        {item.product?.name}
                      </Typography>
                      <Typography variant="h6" component="div">
                        {formatCurrency(item.price * item.quantity)}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, my: 1 }}>
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
                    </Box>
                    
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      mt: 2
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton 
                          size="small" 
                          onClick={() => handleQuantityChange(item._id, -1)}
                          disabled={loading}
                        >
                          <RemoveIcon />
                        </IconButton>
                        <Typography sx={{ mx: 2 }}>
                          {item.quantity}
                        </Typography>
                        <IconButton 
                          size="small" 
                          onClick={() => handleQuantityChange(item._id, 1)}
                          disabled={loading}
                        >
                          <AddIcon />
                        </IconButton>
                      </Box>
                      
                      <Button
                        startIcon={<DeleteIcon />}
                        color="error"
                        onClick={() => handleRemoveItem(item._id)}
                        disabled={loading}
                      >
                        Remove
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
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
                sx={{ mb: 2 }}
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