import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Popover,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

// Import the actual CartContext
import { CartContext } from '../context/CartContext';
import defaultProductImage from '../assets/default-product.jpg';

const CartMenu = ({ anchorEl, open, onClose }) => {
  const navigate = useNavigate();
  
  // Use the actual cart context
  const { cart, loading, updateCartItem, removeFromCart } = useContext(CartContext);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('info');
  
  const handleQuantityChange = async (itemId, change) => {
    const item = cart.items.find(item => item._id === itemId);
    if (item) {
      const newQuantity = Math.max(1, item.quantity + change);
      const result = await updateCartItem(itemId, newQuantity);
      
      if (result && result.error) {
        if (result.message && result.message.includes('Authentication required')) {
          setSnackbarMessage('Please log in again to continue shopping');
          setSnackbarSeverity('warning');
        } else {
          setSnackbarMessage(result.message);
          setSnackbarSeverity('error');
        }
        setSnackbarOpen(true);
      }
    }
  };
  
  const handleRemoveItem = async (itemId) => {
    await removeFromCart(itemId);
  };
  
  const handleCheckout = () => {
    navigate('/checkout');
    onClose();
  };
  
  const handleViewCart = () => {
    navigate('/cart');
    onClose();
  };
  
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };
  
  return (
    <>
    <Popover
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      PaperProps={{
        sx: {
          width: { xs: '90vw', sm: 400 },
          p: 2,
          mt: 1.5,
          maxHeight: '70vh',
          overflow: 'auto'
        }
      }}
    >
      <Typography variant="h6" gutterBottom>
        Your Cart ({cart.items.reduce((total, item) => total + item.quantity, 0) || 0} items)
      </Typography>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
          <CircularProgress />
        </Box>
      ) : cart.items.length === 0 ? (
        <Box sx={{ py: 3, textAlign: 'center' }}>
          <Typography color="text.secondary" gutterBottom>
            Your cart is empty
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => {
              navigate('/products');
              onClose();
            }}
            sx={{ mt: 2 }}
          >
            Continue Shopping
          </Button>
        </Box>
      ) : (
        <>
          <List sx={{ mb: 2 }}>
            {cart.items.map((item, index) => (
              <React.Fragment key={item._id}>
                <ListItem alignItems="flex-start" sx={{ py: 2, px: 0 }}>
                  <ListItemAvatar>
                    <Avatar 
                        src={item.product?.imageUrl || defaultProductImage} 
                      alt={item.product?.name} 
                      variant="rounded"
                      sx={{ width: 60, height: 60 }}
                    />
                  </ListItemAvatar>
                  <ListItemText
                    primary={item.product?.name}
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.primary"
                        >
                          ${item.price.toFixed(2)}
                        </Typography>
                        {item.size && (
                          <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                            Size: {item.size}
                          </Typography>
                        )}
                        {item.color && (
                          <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                            Color: {item.color}
                          </Typography>
                        )}
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                          <IconButton 
                            size="small" 
                            onClick={() => handleQuantityChange(item._id, -1)}
                            disabled={loading}
                          >
                            <RemoveIcon fontSize="small" />
                          </IconButton>
                          <Typography sx={{ mx: 1 }}>
                            {item.quantity}
                          </Typography>
                          <IconButton 
                            size="small" 
                            onClick={() => handleQuantityChange(item._id, 1)}
                            disabled={loading}
                          >
                            <AddIcon fontSize="small" />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            sx={{ ml: 1 }}
                            onClick={() => handleRemoveItem(item._id)}
                            disabled={loading}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                    }
                    primaryTypographyProps={{ fontWeight: 'medium' }}
                  />
                </ListItem>
                {index < cart.items.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
          
          <Divider sx={{ my: 2 }} />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="subtitle1">Subtotal:</Typography>
            <Typography variant="subtitle1" fontWeight="bold">
              ${cart.totalAmount.toFixed(2)}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleCheckout}
              disabled={loading || cart.items.length === 0}
            >
              Checkout
            </Button>
            <Button
              variant="outlined"
              color="primary"
              fullWidth
              onClick={handleViewCart}
              disabled={loading || cart.items.length === 0}
            >
              View Cart
            </Button>
          </Box>
        </>
      )}
    </Popover>
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default CartMenu; 