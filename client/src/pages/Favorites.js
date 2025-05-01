import React, { useContext, useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  IconButton,
  Divider,
  Paper,
  CircularProgress,
  Rating,
  Alert,
} from '@mui/material';
import {
  ShoppingCart as CartIcon,
  Favorite as FavoriteIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { FavoritesContext } from '../context/FavoritesContext';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { getProductImageUrl, handleImageError } from '../utils/imageUtils';
import { formatCurrency } from '../utils/formatters';
import defaultProductImage from '../assets/default-product.jpg';
import { setDocumentTitle, PAGE_TITLES } from '../utils/titleUtils';

const Favorites = () => {
  const navigate = useNavigate();
  const { favorites, loading, error, removeFromFavorites } = useContext(FavoritesContext);
  const { addToCart } = useContext(CartContext);
  const { isAuthenticated } = useContext(AuthContext);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    // Set document title
    setDocumentTitle(PAGE_TITLES.FAVORITES);
    
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/favorites' } });
    }
  }, [isAuthenticated, navigate]);

  const handleRemoveFromFavorites = async (productId) => {
    try {
      await removeFromFavorites(productId);
      setNotification({
        open: true,
        message: 'Product removed from favorites',
        severity: 'success'
      });
    } catch (err) {
      setNotification({
        open: true,
        message: 'Failed to remove from favorites',
        severity: 'error'
      });
    }
  };

  const handleAddToCart = async (product) => {
    try {
      await addToCart(
        product._id,
        1,
        product.price,
        product.sizes && product.sizes.length > 0 ? product.sizes[0] : null,
        product.colors && product.colors.length > 0 ? product.colors[0] : null
      );
      setNotification({
        open: true,
        message: `${product.name} added to cart!`,
        severity: 'success'
      });
    } catch (err) {
      setNotification({
        open: true,
        message: 'Failed to add item to cart',
        severity: 'error'
      });
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          My Favorites
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Products you've saved as favorites
        </Typography>
      </Paper>

      {loading ? (
        <Box display="flex" justifyContent="center" my={6}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error || 'An error occurred while loading your favorites'}
        </Alert>
      ) : favorites.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            You haven't added any favorites yet
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Browse our products and heart the ones you like to add them to favorites
          </Typography>
          <Button
            variant="contained"
            color="primary"
            component={RouterLink}
            to="/products"
            sx={{ mt: 2 }}
          >
            Browse Products
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {favorites.map((product) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: (theme) => theme.shadows[4],
                  },
                  borderRadius: 2,
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    pt: '75%', // 4:3 aspect ratio
                    bgcolor: 'background.paper',
                    cursor: 'pointer',
                  }}
                  onClick={() => navigate(`/products/${product._id}`)}
                >
                  <CardMedia
                    component="img"
                    image={getProductImageUrl(product, 0)}
                    alt={product.name}
                    sx={{
                      objectFit: 'contain',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      p: 2,
                    }}
                    onError={handleImageError(defaultProductImage)}
                  />
                  
                  <IconButton
                    aria-label="remove from favorites"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFromFavorites(product._id);
                    }}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      },
                    }}
                  >
                    <FavoriteIcon color="error" />
                  </IconButton>
                </Box>

                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography
                    variant="subtitle1"
                    component="h2"
                    sx={{
                      fontWeight: 600,
                      mb: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {product.name}
                  </Typography>

                  {product.ratings && product.ratings.length > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Rating
                        value={
                          product.ratings.reduce((acc, curr) => acc + curr.rating, 0) /
                          product.ratings.length
                        }
                        precision={0.5}
                        size="small"
                        readOnly
                      />
                      <Typography variant="body2" sx={{ ml: 0.5 }}>
                        ({product.ratings.length})
                      </Typography>
                    </Box>
                  )}

                  <Typography
                    variant="h6"
                    color="primary.main"
                    sx={{ fontWeight: 'bold', mt: 'auto' }}
                  >
                    {formatCurrency(product.price)}
                  </Typography>
                </CardContent>

                <Divider />
                
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/products/${product._id}`);
                    }}
                    sx={{ borderRadius: 2 }}
                  >
                    Details
                  </Button>
                  
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<CartIcon />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(product);
                    }}
                    disabled={product.stock <= 0}
                    sx={{ borderRadius: 2 }}
                  >
                    Add to Cart
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Notification Snackbar */}
      {notification.open && (
        <Alert 
          severity={notification.severity} 
          sx={{ 
            position: 'fixed', 
            bottom: 16, 
            right: 16, 
            zIndex: 9999,
            boxShadow: 3 
          }}
          onClose={() => setNotification(prev => ({ ...prev, open: false }))}
        >
          {notification.message}
        </Alert>
      )}
    </Container>
  );
};

export default Favorites; 