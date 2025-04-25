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
import { PRODUCT_PLACEHOLDER } from '../assets/placeholder-product';
import defaultProductImage from '../assets/default-product.jpg';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { ShoppingCart as CartIcon } from '@mui/icons-material';
import { formatCurrency } from '../utils/formatters';

// Mock featured products for development
const mockFeaturedProducts = [
  {
    _id: '1',
    name: 'AYPA Branded T-Shirt',
    description: 'Comfortable cotton t-shirt with AYPA logo.',
    price: 1499.00,
    category: 'TShirt',
    brand: 'AYPA',
    stock: 50,
    imageUrls: ['https://source.unsplash.com/random?tshirt'],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'White', 'Navy'],
    featured: true,
    ratings: [{ rating: 4.5 }]
  },
  {
    _id: '3',
    name: 'Classic Lanyard',
    description: 'Simple lanyard for ID cards and keys.',
    price: 649.00,
    category: 'IDLaces',
    brand: 'AYPA',
    stock: 120,
    imageUrls: ['https://source.unsplash.com/random?lanyard'],
    sizes: ['One Size'],
    colors: ['Red', 'Blue', 'Green', 'Black'],
    featured: true,
    ratings: [{ rating: 4.2 }]
  },
  {
    _id: '5',
    name: 'Premium Hoodie',
    description: 'Warm, comfortable hoodie available in multiple colors.',
    price: 2499.00,
    category: 'TShirt',
    brand: 'AYPA Premium',
    stock: 60,
    imageUrls: ['https://source.unsplash.com/random?hoodie'],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'Gray', 'Navy'],
    featured: true,
    ratings: [{ rating: 4.9 }]
  }
];

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
        setFeaturedProducts(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching featured products:', err);
        // Use mock data when API fails
        setFeaturedProducts(mockFeaturedProducts);
        setError('Using demo data - Featured products API is not available');
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
    // For now, just show a notification
    handleNotImplemented('Product Details');
    // When ready, uncomment this:
    // navigate(`/products/${productId}`);
  };

  // Function to get product image with fallback
  const getProductImage = (product) => {
    if (product.imageUrls && product.imageUrls.length > 0 && product.imageUrls[0]) {
      return product.imageUrls[0];
    }
    return defaultProductImage;
  };

  const handleAddToCart = async (product) => {
    if (isAuthenticated) {
      try {
        await addToCart(product, 1, product.sizes[0], product.colors[0]);
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

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: { xs: 6, md: 10 },
          textAlign: 'center'
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h3" component="h1" gutterBottom>
            Custom Apparel & Accessories
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, fontWeight: 'normal' }}>
            Quality products customized to your specific needs
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            sx={{ px: 4, py: 1.5 }}
            onClick={() => navigate('/products')}
          >
            Shop Now
          </Button>
        </Container>
      </Box>

      {/* Featured Products */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h4" component="h2" gutterBottom align="center">
          Featured Products
        </Typography>
        <Divider sx={{ mb: 4 }} />

        <Grid container spacing={4}>
          {loading
            ? Array.from(new Array(3)).map((_, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card>
                    <Skeleton variant="rectangular" height={200} />
                    <CardContent>
                      <Skeleton variant="text" height={30} />
                      <Skeleton variant="text" height={20} width="60%" />
                      <Skeleton variant="text" height={20} width="40%" />
                    </CardContent>
                  </Card>
                </Grid>
              ))
            : featuredProducts.map((product) => (
                <Grid item xs={12} sm={6} md={4} key={product._id}>
                  <Card 
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: 6
                      }
                    }}
                  >
                    <CardMedia
                      component="img"
                      height="200"
                      image={product.imageUrls && product.imageUrls.length > 0 && product.imageUrls[0] ? product.imageUrls[0] : defaultProductImage}
                      alt={product.name}
                      sx={{ 
                        objectFit: 'contain', 
                        bgcolor: '#f5f5f5',
                        p: product.imageUrls && product.imageUrls.length > 0 ? 1 : 2
                      }}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography gutterBottom variant="h6" component="h3">
                        {product.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {product.description?.substring(0, 70)}
                        {product.description?.length > 70 ? '...' : ''}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Rating
                          value={getAverageRating(product.ratings)}
                          precision={0.5}
                          size="small"
                          readOnly
                        />
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                          ({product.ratings?.length || 0})
                        </Typography>
                      </Box>
                      <Typography variant="h6" color="primary" fontWeight="bold">
                        {formatCurrency(product.price)}
                      </Typography>
                    </CardContent>
                    <CardActions sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => navigateToProduct(product._id)}
                      >
                        Details
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<CartIcon />}
                        onClick={() => handleAddToCart(product)}
                      >
                        Add to Cart
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
        </Grid>

        {error && (
          <Typography color="text.secondary" align="center" sx={{ mt: 4 }}>
            {error}
          </Typography>
        )}

        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate('/products')}
          >
            View All Products
          </Button>
        </Box>
      </Container>

      {/* Categories Section */}
      <Box sx={{ bgcolor: 'grey.100', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" component="h2" gutterBottom align="center">
            Shop By Category
          </Typography>
          <Divider sx={{ mb: 4 }} />

          <Grid container spacing={4}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                height: '100%',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: 3
                }
              }}>
                <CardMedia
                  component="img"
                  height={160}
                  image={defaultProductImage}
                  alt="T-Shirts"
                />
                <CardContent>
                  <Typography variant="h6" component="h3" align="center">
                    T-Shirts
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    fullWidth
                    onClick={() => navigate('/products?category=TShirt')}
                  >
                    Browse T-Shirts
                  </Button>
                </CardActions>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                height: '100%',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: 3
                }
              }}>
                <CardMedia
                  component="img"
                  height={160}
                  image={defaultProductImage}
                  alt="ID Laces"
                />
                <CardContent>
                  <Typography variant="h6" component="h3" align="center">
                    ID Laces
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    fullWidth
                    onClick={() => navigate('/products?category=IDLaces')}
                  >
                    Browse ID Laces
                  </Button>
                </CardActions>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                height: '100%',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: 3
                }
              }}>
                <CardMedia
                  component="img"
                  height={160}
                  image={defaultProductImage}
                  alt="Accessories"
                />
                <CardContent>
                  <Typography variant="h6" component="h3" align="center">
                    Accessories
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    fullWidth
                    onClick={() => navigate('/products?category=Accessories')}
                  >
                    Browse Accessories
                  </Button>
                </CardActions>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                height: '100%',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: 3
                }
              }}>
                <CardMedia
                  component="img"
                  height={160}
                  image={defaultProductImage}
                  alt="Other Items"
                />
                <CardContent>
                  <Typography variant="h6" component="h3" align="center">
                    Other Items
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    fullWidth
                    onClick={() => navigate('/products?category=Other')}
                  >
                    Browse Other Items
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

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
    </Box>
  );
};

export default Home; 