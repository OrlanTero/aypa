import React, { useState, useEffect, useContext } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Rating,
  Divider,
  Skeleton,
  Snackbar,
  Alert
} from '@mui/material';
import axios from 'axios';
import { PRODUCT_ENDPOINTS } from '../constants/apiConfig';
import defaultProductImage from '../assets/default-product.jpg';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { 
  ShoppingCart as CartIcon,
  ArrowForward as ArrowForwardIcon 
} from '@mui/icons-material';
import { formatCurrency } from '../utils/formatters';
import { getProductImageUrl, handleImageError } from '../utils/imageUtils';
import { alpha } from '@mui/material/styles';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);
  const { addToCart, error: cartError } = useContext(CartContext);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(PRODUCT_ENDPOINTS.FEATURED);
        console.log('Featured products data:', response.data);
        
        // Log each product's image URLs for debugging
        if (response.data && response.data.length > 0) {
          response.data.forEach(product => {
            console.log(`Product ${product.name} images:`, product.imageUrls);
          });
        }
        
        setFeaturedProducts(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching featured products:', err);
        setError('Failed to load featured products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  const getAverageRating = (ratings) => {
    if (!ratings || ratings.length === 0) return 0;
    const sum = ratings.reduce((total, item) => total + item.rating, 0);
    return sum / ratings.length;
  };

  const handleNotImplemented = (feature) => {
    setNotification({
      open: true,
      message: `The ${feature} feature is not implemented yet.`,
      severity: 'info'
    });
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const navigateToProduct = (productId) => {
    navigate(`/products/${productId}`);
  };

  const handleAddToCart = async (product) => {
    if (isAuthenticated) {
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
          message: cartError || 'Failed to add item to cart',
          severity: 'error'
        });
      }
    } else {
      navigate('/login', { state: { from: '/' } });
    }
  };

  // Function to check if the product has valid image URLs
  const getProductImage = (product) => {
    if (!product || !product.imageUrls || product.imageUrls.length === 0) {
      console.log('No image URLs found for product:', product?.name);
      return defaultProductImage;
    }
    
    // Example path: "uploads/products/product-1745637039211.jpg"
    const imageUrl = getProductImageUrl(product, 0);
    console.log(`Product ${product.name} image URL:`, imageUrl);
    return imageUrl;
  };

  return (
    <Container maxWidth="xl">
      {/* Banner Section */}
      <Box 
        sx={{ 
          py: 6, 
          textAlign: 'center',
          background: (theme) => `linear-gradient(to right, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.primary.main, 0.3)})`,
          borderRadius: 2,
          mb: 6
        }}
      >
        <Typography variant="h3" component="h1" gutterBottom>
          Welcome to AYPA E-Commerce
        </Typography>
        <Typography variant="h5" component="h2" color="text.secondary" sx={{ mb: 3 }}>
          Discover our latest featured products
        </Typography>
        <Button 
          variant="contained" 
          size="large" 
          component={RouterLink} 
          to="/products"
          endIcon={<ArrowForwardIcon />}
        >
          Shop All Products
        </Button>
      </Box>

      {/* Featured Products Section */}
      <Typography variant="h4" component="h2" sx={{ mb: 4 }}>
        Featured Products
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={4}>
        {loading ? (
          // Loading skeletons
          Array.from(new Array(3)).map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={`skeleton-${index}`}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Skeleton variant="rectangular" height={200} />
                <CardContent>
                  <Skeleton variant="text" height={40} />
                  <Skeleton variant="text" height={20} width="60%" />
                  <Skeleton variant="text" height={30} width="40%" />
                </CardContent>
                <CardActions>
                  <Skeleton variant="rectangular" width={100} height={36} />
                  <Skeleton variant="rectangular" width={100} height={36} />
                </CardActions>
              </Card>
            </Grid>
          ))
        ) : (
          featuredProducts.length > 0 ? featuredProducts.map((product) => (
            <Grid item xs={12} sm={6} md={4} key={product._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={getProductImage(product)}
                  alt={product.name || 'Product image'}
                  onClick={() => navigateToProduct(product._id)}
                  sx={{ 
                    cursor: 'pointer',
                    objectFit: 'contain',
                    p: 2,
                    bgcolor: 'background.paper'
                  }}
                  onError={handleImageError(defaultProductImage)}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h6" component="h3" sx={{ cursor: 'pointer' }} onClick={() => navigateToProduct(product._id)}>
                    {product.name}
                  </Typography>
                  <Typography color="text.secondary" sx={{ mb: 1 }}>
                    {formatCurrency(product.price)}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Rating
                      value={getAverageRating(product.ratings)}
                      precision={0.5}
                      readOnly
                      size="small"
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                      ({product.ratings ? product.ratings.length : 0})
                    </Typography>
                  </Box>
                </CardContent>
                <Divider />
                <CardActions>
                  <Button 
                    size="small" 
                    onClick={() => navigateToProduct(product._id)}
                  >
                    View Details
                  </Button>
                  <Button 
                    size="small" 
                    startIcon={<CartIcon />}
                    onClick={() => handleAddToCart(product)}
                    variant="contained"
                    color="primary"
                  >
                    Add to Cart
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          )) : (
            <Grid item xs={12}>
              <Typography align="center" color="text.secondary">
                No featured products available at this time.
              </Typography>
            </Grid>
          )
        )}
      </Grid>

      {/* Notification */}
      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Home; 