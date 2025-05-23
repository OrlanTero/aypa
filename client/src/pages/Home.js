import React, { useState, useEffect, useContext, useRef } from 'react';
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
  Alert,
  Paper,
  useTheme,
  alpha,
  useMediaQuery
} from '@mui/material';
import axios from 'axios';
import { PRODUCT_ENDPOINTS } from '../constants/apiConfig';
import defaultProductImage from '../assets/default-product.jpg';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { 
  ShoppingCart as CartIcon,
  ArrowForward as ArrowForwardIcon,
  LocalShipping as ShippingIcon, 
  Security as SecurityIcon,
  Support as SupportIcon,
  Payments as PaymentsIcon
} from '@mui/icons-material';
import { formatCurrency } from '../utils/formatters';
import { getProductImageUrl, handleImageError } from '../utils/imageUtils';
import logo from '../assets/logo.png';
import logoAnother from '../assets/logo.jpg';
import { setDocumentTitle, PAGE_TITLES } from '../utils/titleUtils';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);
  const { addToCart, error: cartError } = useContext(CartContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    setDocumentTitle(PAGE_TITLES.HOME);
    fetchFeaturedProducts();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      const response = await axios.get('/api/products/filters/options');
      const { categories: fetchedCategories } = response.data;
      
      // Map categories to have a path
      const mappedCategories = fetchedCategories.map(category => ({
        name: category,
        path: `/products?category=${encodeURIComponent(category)}`
      }));
      
      setCategories(mappedCategories);
    } catch (err) {
      console.error('Error fetching categories:', err);
      // If there's an error, use default categories
      setCategories([
        { name: 'T-Shirts', path: '/products?category=TShirt' },
        { name: 'Accessories', path: '/products?category=Accessories' }
      ]);
    } finally {
      setCategoriesLoading(false);
    }
  };
  
  const fetchFeaturedProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(PRODUCT_ENDPOINTS.FEATURED);
      console.log('Featured products data:', response.data);
      
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

  const getProductImage = (product) => {
    if (!product || !product.imageUrls || product.imageUrls.length === 0) {
      console.log('No image URLs found for product:', product?.name);
      return defaultProductImage;
    }
    
    const imageUrl = getProductImageUrl(product, 0);
    console.log(`Product ${product.name} image URL:`, imageUrl);
    return imageUrl;
  };

  // Helper function to get category icon/color
  const getCategoryIcon = (categoryName) => {
    const name = categoryName.toLowerCase();
    // Return different icon colors based on category name
    if (name.includes('shirt') || name.includes('clothing')) return theme.palette.primary.main;
    if (name.includes('accessories')) return theme.palette.secondary.main;
    if (name.includes('shoes')) return theme.palette.error.main;
    if (name.includes('electronics')) return theme.palette.info.main;
    if (name.includes('beauty')) return theme.palette.warning.main;
    if (name.includes('home')) return theme.palette.success.main;
    if (name.includes('book')) return theme.palette.info.dark;
    
    // Generate a consistent color based on the category name
    let hash = 0;
    for (let i = 0; i < categoryName.length; i++) {
      hash = categoryName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash % 360);
    return `hsl(${hue}, 70%, 45%)`;
  };

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          bgcolor: 'white',
          color: 'white',
          width: '90%',
          marginLeft: '5%',
          py: { xs: 6, sm: 10, md: 12 },
          mb: { xs: 4, sm: 6 },
          backgroundImage: `url(${logoAnother})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          height: 'calc(100vh - 64px)'
        }}
      >
        
      </Box>

      {/* Features Section */}
      <Container maxWidth="xl">
        <Box 
          sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: { xs: 2, md: 4 },
            justifyContent: 'center',
            mb: { xs: 4, sm: 6 }
          }}
        >
          {[
            { icon: <ShippingIcon />, title: 'Fast Delivery', description: 'Nationwide delivery within 3-5 days' },
            { icon: <SecurityIcon />, title: 'Secure Payments', description: 'Multiple secure payment methods available' },
            { icon: <SupportIcon />, title: '24/7 Support', description: 'Customer service available all day' },
            { icon: <PaymentsIcon />, title: 'Easy Returns', description: '7-day easy return policy' }
          ].map((feature, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                alignItems: 'center',
                p: 2,
                bgcolor: 'background.paper',
                borderRadius: 2,
                boxShadow: 1,
                width: { xs: '100%', sm: 'calc(50% - 16px)', md: 'calc(25% - 24px)' }
              }}
            >
              <Box sx={{ 
                p: 1.5,
                borderRadius: '50%',
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: 'primary.main',
                mr: 2,
                display: 'flex'
              }}>
                {feature.icon}
              </Box>
              <Box>
                <Typography 
                  variant="subtitle1" 
                  fontWeight="bold"
                  sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
                >
                  {feature.title}
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                >
                  {feature.description}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>

        {/* Featured Products Section */}
        <Box sx={{ mb: { xs: 4, sm: 6 } }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: { xs: 2, sm: 3 }
          }}>
            <Typography 
              variant="h4" 
              component="h2"
              sx={{ 
                fontWeight: 600,
                fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' } 
              }}
            >
              Featured Products
            </Typography>
            <Button 
              component={RouterLink} 
              to="/products" 
              endIcon={<ArrowForwardIcon />}
              sx={{ 
                display: { xs: 'none', sm: 'flex' },
                fontSize: { xs: '0.8rem', sm: '0.875rem' }
              }}
            >
              View All
            </Button>
          </Box>
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={{ xs: 1, sm: 2, md: 3 }}>
            {loading
              ? Array.from(new Array(4)).map((_, index) => (
                  <Grid item xs={6} sm={4} md={3} key={index}>
                    <Card sx={{ height: '100%' }}>
                      <Skeleton variant="rectangular" height={200} animation="wave" />
                      <CardContent>
                        <Skeleton animation="wave" height={30} width="80%" />
                        <Skeleton animation="wave" height={20} width="40%" />
                        <Skeleton animation="wave" height={40} width="60%" />
                      </CardContent>
                    </Card>
                  </Grid>
                ))
              : featuredProducts.slice(0, isTablet ? 4 : 8).map((product) => (
                  <Grid item xs={6} sm={4} md={3} key={product._id}>
                    <Card 
                      sx={{ 
                        height: '100%', 
                        display: 'flex', 
                        flexDirection: 'column',
                        transition: 'transform 0.3s ease',
                        '&:hover': { 
                          transform: 'translateY(-5px)',
                          boxShadow: 3 
                        },
                        borderRadius: 2,
                        overflow: 'hidden'
                      }}
                    >
                      <Box 
                        sx={{ position: 'relative', pt: '75%', cursor: 'pointer' }}
                        onClick={() => navigate(`/products/${product._id}`)}
                      >
                        <CardMedia
                          component="img"
                          image={getProductImage(product)}
                          alt={product.name}
                          onError={handleImageError(defaultProductImage)}
                          sx={{ 
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            p: 1,
                            bgcolor: 'background.paper'
                          }}
                        />
                      </Box>
                      <CardContent sx={{ flexGrow: 1, p: { xs: 1.5, sm: 2 } }}>
                        <Typography 
                          gutterBottom 
                          variant="subtitle1" 
                          component="h3"
                          onClick={() => navigate(`/products/${product._id}`)}
                          sx={{ 
                            cursor: 'pointer', 
                            fontWeight: 600,
                            fontSize: { xs: '0.95rem', sm: '1.1rem' },
                            lineHeight: 1.2,
                            mb: 1,
                            height: '2.4em',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical'
                          }}
                        >
                          {product.name}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Rating 
                            value={product.ratings?.length ? product.ratings.reduce((acc, curr) => acc + curr.rating, 0) / product.ratings.length : 0}
                            readOnly 
                            precision={0.5} 
                            size="small"
                          />
                          <Typography variant="body2" sx={{ ml: 0.5, fontSize: '0.75rem' }}>
                            ({product.ratings?.length || 0})
                          </Typography>
                        </Box>
                        <Typography 
                          variant="h6" 
                          color="primary.main"
                          sx={{ 
                            fontWeight: 'bold',
                            fontSize: { xs: '1rem', sm: '1.25rem' },
                            mt: 'auto'
                          }}
                        >
                          {formatCurrency(product.price)}
                        </Typography>
                      </CardContent>
                      <Divider />
                      <CardActions sx={{ p: 1 }}>
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<CartIcon />}
                          fullWidth
                          onClick={() => handleAddToCart(product)}
                          disabled={product.stock <= 0}
                          sx={{ borderRadius: 1 }}
                        >
                          {isMobile ? 'Add' : 'Add to Cart'}
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
          </Grid>
          
          <Box sx={{ display: { xs: 'flex', sm: 'none' }, justifyContent: 'center', mt: 2 }}>
            <Button 
              component={RouterLink} 
              to="/products" 
              variant="outlined"
              endIcon={<ArrowForwardIcon />}
            >
              View All Products
            </Button>
          </Box>
        </Box>

        {/* Product Categories */}
        <Box sx={{ mb: { xs: 4, sm: 6 } }}>
          <Typography 
            variant="h4" 
            component="h2" 
            gutterBottom
            sx={{ 
              fontWeight: 600,
              fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' },
              mb: { xs: 2, sm: 3 }
            }}
          >
            Shop by Category
          </Typography>
          
          {categoriesLoading ? (
            <Grid container spacing={{ xs: 1, sm: 3 }}>
              {Array.from(new Array(4)).map((_, index) => (
                <Grid item xs={6} sm={4} md={3} key={index}>
                  <Skeleton variant="rounded" height={isMobile ? 120 : 200} animation="wave" />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Grid container spacing={{ xs: 1, sm: 3 }}>
              {categories.map((category, index) => (
                <Grid item xs={6} sm={4} md={3} lg={2} key={index}>
                  <Paper
                    component={RouterLink}
                    to={category.path}
                    elevation={2}
                    sx={{
                      height: { xs: 120, sm: 150 },
                      borderRadius: 3,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      textDecoration: 'none',
                      color: 'text.primary',
                      textAlign: 'center',
                      p: 2,
                      transition: 'all 0.3s ease',
                      overflow: 'hidden',
                      position: 'relative',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: 4,
                        '& .category-bg': {
                          opacity: 0.6,
                        }
                      }
                    }}
                  >
                    <Box 
                      className="category-bg"
                      sx={{ 
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: getCategoryIcon(category.name),
                        opacity: 0.2,
                        transition: 'opacity 0.3s ease',
                        zIndex: 0
                      }}
                    />
                    
                    <Box 
                      sx={{ 
                        width: 50,
                        height: 50,
                        borderRadius: '50%',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        bgcolor: alpha(getCategoryIcon(category.name), 0.2),
                        color: getCategoryIcon(category.name),
                        mb: 1,
                        fontWeight: 'bold',
                        fontSize: '1.5rem',
                        position: 'relative',
                        zIndex: 1
                      }}
                    >
                      {category.name.charAt(0).toUpperCase()}
                    </Box>
                    
                    <Typography 
                      variant="subtitle1"
                      sx={{ 
                        fontWeight: 'bold',
                        zIndex: 1,
                        position: 'relative'
                      }}
                    >
                      {category.name}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Container>

      {/* Notifications */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Home; 