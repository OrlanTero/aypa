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
import { 
  ShoppingCart as CartIcon,
  ArrowForward as ArrowForwardIcon 
} from '@mui/icons-material';
import { formatCurrency } from '../utils/formatters';
import { alpha } from '@mui/material/styles';

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
          position: 'relative',
          height: { xs: '70vh', md: '90vh' },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundImage: 'url(https://images.unsplash.com/photo-1556905055-8f358a7a47b2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: 'white',
          textAlign: 'center',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)', // Dark overlay for better text visibility
            zIndex: 1
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '150px',
            background: 'linear-gradient(to top, rgba(41, 41, 42, 1), rgba(41, 41, 42, 0))',
            zIndex: 1
          }
        }}
      >
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 2 }}>
          <Typography 
            variant="h2" 
            component="h1" 
            gutterBottom 
            fontWeight="bold"
            sx={{
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
              color: 'white',
              position: 'relative',
              pb: 2,
              '&::after': {
                content: '""',
                position: 'absolute',
                width: '80px',
                height: '4px',
                bgcolor: (theme) => theme.palette.accent.main,
                bottom: 0,
                left: '50%',
                transform: 'translateX(-50%)'
              }
            }}
          >
            Custom Apparel & Accessories
          </Typography>
          <Typography 
            variant="h5" 
            sx={{ 
              mb: 5, 
              fontWeight: 'normal',
              textShadow: '1px 1px 3px rgba(0,0,0,0.5)',
              maxWidth: '700px',
              mx: 'auto'
            }}
          >
            Quality products customized to your specific needs with fast delivery and excellent customer service
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              sx={{ 
                px: 4, 
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 'bold',
                '&:hover': {
                  transform: 'scale(1.05)',
                  transition: 'transform 0.3s ease'
                }
              }}
              onClick={() => navigate('/products')}
            >
              Shop Now
            </Button>
            <Button
              variant="outlined"
              size="large"
              sx={{ 
                px: 4, 
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 'bold',
                color: 'white',
                borderColor: 'white',
                '&:hover': {
                  borderColor: (theme) => theme.palette.accent.main,
                  color: (theme) => theme.palette.accent.main,
                  backgroundColor: 'rgba(255,255,255,0.1)'
                }
              }}
              onClick={() => navigate('/products?category=all')}
            >
              Explore Products
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Featured Products */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography 
            variant="h4" 
            component="h2" 
            gutterBottom 
            sx={{ 
              fontWeight: 'bold',
              position: 'relative',
              display: 'inline-block',
              pb: 2,
              '&::after': {
                content: '""',
                position: 'absolute',
                width: '60px',
                height: '4px',
                bgcolor: (theme) => theme.palette.secondary.main,
                bottom: 0,
                left: '50%',
                transform: 'translateX(-50%)'
              }
            }}
          >
            Featured Products
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ maxWidth: '700px', mx: 'auto' }}>
            Discover our most popular items, handpicked for quality and style
          </Typography>
        </Box>

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
                      transition: 'transform 0.3s, box-shadow 0.3s',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: (theme) => `0 12px 20px -10px ${alpha(theme.palette.primary.main, 0.3)}`
                      }
                    }}
                  >
                    <CardMedia
                      component="img"
                      height="220"
                      image={product.imageUrls && product.imageUrls.length > 0 && product.imageUrls[0] ? product.imageUrls[0] : defaultProductImage}
                      alt={product.name}
                      sx={{ 
                        objectFit: 'contain', 
                        bgcolor: '#f5f5f5',
                        p: product.imageUrls && product.imageUrls.length > 0 ? 1 : 2
                      }}
                    />
                    <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                      <Typography gutterBottom variant="h6" component="h3" sx={{ fontWeight: 600 }}>
                        {product.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                        {product.description?.substring(0, 70)}
                        {product.description?.length > 70 ? '...' : ''}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
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
                      <Typography 
                        variant="h6" 
                        fontWeight="bold"
                        sx={{ 
                          color: (theme) => theme.palette.secondary.main
                        }}
                      >
                        {formatCurrency(product.price)}
                      </Typography>
                    </CardContent>
                    <CardActions sx={{ display: 'flex', justifyContent: 'space-between', px: 2, pb: 2 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => navigateToProduct(product._id)}
                        sx={{
                          borderColor: (theme) => theme.palette.primary.main,
                          color: (theme) => theme.palette.primary.main,
                          '&:hover': {
                            backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1)
                          }
                        }}
                      >
                        Details
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<CartIcon />}
                        onClick={() => handleAddToCart(product)}
                        sx={{
                          color: 'white'
                        }}
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
            sx={{
              px: 4,
              py: 1.2,
              borderColor: (theme) => theme.palette.primary.main,
              color: (theme) => theme.palette.primary.main,
              '&:hover': {
                backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1)
              }
            }}
          >
            View All Products
          </Button>
        </Box>
      </Container>

      {/* Categories Section */}
      <Box sx={{ bgcolor: (theme) => alpha(theme.palette.accent.main, 0.05), py: 8 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography 
              variant="h4" 
              component="h2" 
              gutterBottom 
              sx={{ 
                fontWeight: 'bold',
                position: 'relative',
                display: 'inline-block',
                pb: 2,
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  width: '60px',
                  height: '4px',
                  bgcolor: (theme) => theme.palette.secondary.main,
                  bottom: 0,
                  left: '50%',
                  transform: 'translateX(-50%)'
                }
              }}
            >
              Shop By Category
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ maxWidth: '700px', mx: 'auto' }}>
              Browse our collections by category to find exactly what you need
            </Typography>
          </Box>

          <Grid container spacing={4}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                height: '100%',
                transition: 'transform 0.3s, box-shadow 0.3s',
                overflow: 'hidden',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: (theme) => `0 12px 20px -10px ${alpha(theme.palette.primary.main, 0.3)}`,
                  '& .MuiCardMedia-root': {
                    transform: 'scale(1.05)'
                  }
                }
              }}>
                <CardMedia
                  component="img"
                  height={180}
                  image={defaultProductImage}
                  alt="T-Shirts"
                  sx={{ 
                    transition: 'transform 0.5s ease',
                    objectFit: 'cover'
                  }}
                />
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
                    T-Shirts
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                  <Button
                    size="small"
                    onClick={() => navigate('/products?category=TShirt')}
                    endIcon={<ArrowForwardIcon />}
                    sx={{ 
                      color: (theme) => theme.palette.primary.main,
                      '&:hover': {
                        backgroundColor: 'transparent',
                        transform: 'translateX(4px)'
                      }
                    }}
                  >
                    Browse T-Shirts
                  </Button>
                </CardActions>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                height: '100%',
                transition: 'transform 0.3s, box-shadow 0.3s',
                overflow: 'hidden',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: (theme) => `0 12px 20px -10px ${alpha(theme.palette.primary.main, 0.3)}`,
                  '& .MuiCardMedia-root': {
                    transform: 'scale(1.05)'
                  }
                }
              }}>
                <CardMedia
                  component="img"
                  height={180}
                  image={defaultProductImage}
                  alt="ID Laces"
                  sx={{ 
                    transition: 'transform 0.5s ease',
                    objectFit: 'cover'
                  }}
                />
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
                    ID Laces
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                  <Button
                    size="small"
                    onClick={() => navigate('/products?category=IDLaces')}
                    endIcon={<ArrowForwardIcon />}
                    sx={{ 
                      color: (theme) => theme.palette.primary.main,
                      '&:hover': {
                        backgroundColor: 'transparent',
                        transform: 'translateX(4px)'
                      }
                    }}
                  >
                    Browse ID Laces
                  </Button>
                </CardActions>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                height: '100%',
                transition: 'transform 0.3s, box-shadow 0.3s',
                overflow: 'hidden',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: (theme) => `0 12px 20px -10px ${alpha(theme.palette.primary.main, 0.3)}`,
                  '& .MuiCardMedia-root': {
                    transform: 'scale(1.05)'
                  }
                }
              }}>
                <CardMedia
                  component="img"
                  height={180}
                  image={defaultProductImage}
                  alt="Accessories"
                  sx={{ 
                    transition: 'transform 0.5s ease',
                    objectFit: 'cover'
                  }}
                />
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
                    Accessories
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                  <Button
                    size="small"
                    onClick={() => navigate('/products?category=Accessories')}
                    endIcon={<ArrowForwardIcon />}
                    sx={{ 
                      color: (theme) => theme.palette.primary.main,
                      '&:hover': {
                        backgroundColor: 'transparent',
                        transform: 'translateX(4px)'
                      }
                    }}
                  >
                    Browse Accessories
                  </Button>
                </CardActions>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                height: '100%',
                transition: 'transform 0.3s, box-shadow 0.3s',
                overflow: 'hidden',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: (theme) => `0 12px 20px -10px ${alpha(theme.palette.primary.main, 0.3)}`,
                  '& .MuiCardMedia-root': {
                    transform: 'scale(1.05)'
                  }
                }
              }}>
                <CardMedia
                  component="img"
                  height={180}
                  image={defaultProductImage}
                  alt="Other Items"
                  sx={{ 
                    transition: 'transform 0.5s ease',
                    objectFit: 'cover'
                  }}
                />
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
                    Other Items
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                  <Button
                    size="small"
                    onClick={() => navigate('/products?category=Other')}
                    endIcon={<ArrowForwardIcon />}
                    sx={{ 
                      color: (theme) => theme.palette.primary.main,
                      '&:hover': {
                        backgroundColor: 'transparent',
                        transform: 'translateX(4px)'
                      }
                    }}
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