import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  CircularProgress,
  Divider,
  Paper,
  Rating,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  IconButton,
  Snackbar,
  Alert,
  Tabs,
  Tab,
  Card,
  CardContent
} from '@mui/material';
import {
  ShoppingCart as CartIcon,
  Favorite as FavoriteIcon,
  Share as ShareIcon,
  Add as AddIcon,
  Remove as RemoveIcon
} from '@mui/icons-material';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { PRODUCT_ENDPOINTS } from '../constants/apiConfig';
import defaultProductImage from '../assets/default-product.jpg';
import { getProductImageUrl, handleImageError } from '../utils/imageUtils';
import { formatCurrency } from '../utils/formatters';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [tabValue, setTabValue] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await axios.get(PRODUCT_ENDPOINTS.DETAILS(id));
        const productData = response.data;
        setProduct(productData);
        
        if (productData.colors && productData.colors.length > 0) {
          setSelectedColor(productData.colors[0]);
        }
        if (productData.sizes && productData.sizes.length > 0) {
          setSelectedSize(productData.sizes[0]);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError('Failed to load product details. Please try again later.');
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleSizeChange = (event) => {
    setSelectedSize(event.target.value);
  };

  const handleColorChange = (event) => {
    setSelectedColor(event.target.value);
  };

  const handleQuantityChange = (event) => {
    setQuantity(Math.max(1, Math.min(100, Number(event.target.value))));
  };

  const incrementQuantity = () => {
    setQuantity(Math.min(100, quantity + 1));
  };

  const decrementQuantity = () => {
    setQuantity(Math.max(1, quantity - 1));
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/products/${id}` } });
      return;
    }

    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      setSnackbarMessage('Please select a size');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    if (product.colors && product.colors.length > 0 && !selectedColor) {
      setSnackbarMessage('Please select a color');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    // Check if requested quantity exceeds available stock
    if (quantity > product.stock) {
      setSnackbarMessage(`Only ${product.stock} items available in stock`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    try {
      await addToCart(
        product._id,
        quantity,
        product.price,
        selectedSize,
        selectedColor
      );
      
      setSnackbarMessage(`${product.name} added to cart!`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Error adding to cart:', err);
      setSnackbarMessage('Failed to add item to cart');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // Calculate average rating
  const getAverageRating = (ratings) => {
    if (!ratings || ratings.length === 0) return 0;
    const sum = ratings.reduce((total, item) => total + item.rating, 0);
    return sum / ratings.length;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!product) {
    return (
      <Alert severity="warning" sx={{ mt: 2 }}>
        Product not found
      </Alert>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Grid container spacing={4}>
        {/* Product Images */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
            <Box
              component="img"
              src={getProductImageUrl(product, selectedImage)}
              alt={product.name}
              sx={{
                width: '100%',
                height: 'auto',
                maxHeight: 400,
                objectFit: 'contain',
                borderRadius: 1,
                mb: 2
              }}
              onError={handleImageError(defaultProductImage)}
            />
            <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 1 }}>
              {product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls.map((url, index) => (
                <Box
                  key={index}
                  component="img"
                  src={getProductImageUrl(product, index)}
                  sx={{
                    width: 80,
                    height: 80,
                    objectFit: 'cover',
                    cursor: 'pointer',
                    border: index === selectedImage ? '2px solid #1976d2' : '2px solid transparent',
                    borderRadius: 1
                  }}
                  onClick={() => setSelectedImage(index)}
                  onError={handleImageError(defaultProductImage)}
                />
              )) : (
                <Box
                  component="img"
                  src={defaultProductImage}
                  sx={{
                    width: 80,
                    height: 80,
                    objectFit: 'cover',
                    borderRadius: 1
                  }}
                />
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Product Details */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              {product.name}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Rating
                value={getAverageRating(product.ratings)}
                precision={0.1}
                readOnly
              />
              <Typography variant="body2" sx={{ ml: 1 }}>
                ({product.ratings?.length || 0} reviews)
              </Typography>
            </Box>
            
            <Typography variant="h5" color="primary" sx={{ mb: 2 }}>
              {formatCurrency(product.price)}
            </Typography>
            
            <Divider sx={{ mb: 2 }} />
            
            <Typography variant="body1" sx={{ mb: 3 }}>
              {product.description}
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              {product.brand && (
                <Typography variant="subtitle1" gutterBottom>
                  Brand: <Chip label={product.brand} size="small" />
                </Typography>
              )}
              <Typography variant="subtitle1" gutterBottom>
                Category: <Chip label={product.category} size="small" />
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                Availability: 
                <Chip 
                  label={product.stock > 0 ? 'In Stock' : 'Out of Stock'} 
                  color={product.stock > 0 ? 'success' : 'error'}
                  size="small"
                  sx={{ ml: 1 }}
                />
              </Typography>
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {product.sizes && product.sizes.length > 0 && (
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel id="size-select-label">Size</InputLabel>
                    <Select
                      labelId="size-select-label"
                      id="size-select"
                      value={selectedSize}
                      label="Size"
                      onChange={handleSizeChange}
                    >
                      {product.sizes.map((size) => (
                        <MenuItem key={size} value={size}>
                          {size}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}
              
              {product.colors && product.colors.length > 0 && (
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel id="color-select-label">Color</InputLabel>
                    <Select
                      labelId="color-select-label"
                      id="color-select"
                      value={selectedColor}
                      label="Color"
                      onChange={handleColorChange}
                    >
                      {product.colors.map((color) => (
                        <MenuItem key={color} value={color}>
                          {color}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}
            </Grid>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Typography variant="subtitle1" sx={{ mr: 2 }}>
                Quantity:
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton 
                  onClick={decrementQuantity} 
                  disabled={quantity <= 1}
                  size="small"
                >
                  <RemoveIcon />
                </IconButton>
                <TextField
                  type="number"
                  value={quantity}
                  onChange={handleQuantityChange}
                  InputProps={{ inputProps: { min: 1, max: product.stock } }}
                  sx={{ width: 60, mx: 1 }}
                  size="small"
                />
                <IconButton
                  onClick={incrementQuantity}
                  disabled={quantity >= product.stock}
                  size="small"
                >
                  <AddIcon />
                </IconButton>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<CartIcon />}
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                size="large"
                fullWidth
              >
                Add to Cart
              </Button>
              <IconButton color="secondary" aria-label="add to favorites">
                <FavoriteIcon />
              </IconButton>
              <IconButton color="primary" aria-label="share">
                <ShareIcon />
              </IconButton>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Tabs for Details, Reviews, etc. */}
      <Paper sx={{ mt: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="product tabs">
            <Tab label="Description" id="tab-0" />
            <Tab label="Reviews" id="tab-1" />
            <Tab label="Shipping & Returns" id="tab-2" />
          </Tabs>
        </Box>
        
        <Box role="tabpanel" hidden={tabValue !== 0} p={3}>
          {tabValue === 0 && (
            <Typography variant="body1">
              {product.description}
            </Typography>
          )}
        </Box>
        
        <Box role="tabpanel" hidden={tabValue !== 1} p={3}>
          {tabValue === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Customer Reviews
              </Typography>
              
              {product.ratings && product.ratings.length > 0 ? (
                product.ratings.map((review, index) => (
                  <Card key={index} sx={{ mb: 2 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Rating value={review.rating} readOnly size="small" />
                        <Typography variant="caption" color="text.secondary">
                          {new Date(review.date).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Typography variant="body2">{review.review}</Typography>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No reviews yet. Be the first to review this product!
                </Typography>
              )}
            </Box>
          )}
        </Box>
        
        <Box role="tabpanel" hidden={tabValue !== 2} p={3}>
          {tabValue === 2 && (
            <Typography variant="body1">
              <strong>Shipping Policy:</strong><br />
              We offer free standard shipping on all orders over $50. Orders typically ship within 1-2 business days and delivery times vary based on location.<br /><br />
              
              <strong>Return Policy:</strong><br />
              We accept returns within 30 days of purchase. Items must be in original condition with tags attached. Please contact customer service to initiate a return.
            </Typography>
          )}
        </Box>
      </Paper>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ProductDetail; 