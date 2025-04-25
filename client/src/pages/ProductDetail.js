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

// Mock product data for development
const mockProduct = {
  _id: '1',
  name: 'Basic White T-Shirt',
  description: 'A comfortable white t-shirt made from premium cotton. Perfect for everyday wear, this t-shirt offers both comfort and style. The breathable fabric ensures you stay cool throughout the day.',
  price: 29.99,
  category: 'TShirt',
  brand: 'AYPA',
  stock: 150,
  imageUrls: [
    'https://source.unsplash.com/random?tshirt,white,front',
    'https://source.unsplash.com/random?tshirt,white,back',
    'https://source.unsplash.com/random?tshirt,white,detail'
  ],
  sizes: ['S', 'M', 'L', 'XL'],
  colors: ['White'],
  featured: true,
  ratings: [
    { user: 'user1', rating: 4.5, review: 'Great quality and fits perfectly!', date: '2023-10-15' },
    { user: 'user2', rating: 5, review: 'Excellent material, very comfortable.', date: '2023-10-10' }
  ]
};

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
        // Replace with real API call when available
        // const res = await axios.get(`/api/products/${id}`);
        // setProduct(res.data);
        
        // Using mock data for now
        setTimeout(() => {
          setProduct(mockProduct);
          if (mockProduct.colors.length > 0) {
            setSelectedColor(mockProduct.colors[0]);
          }
          if (mockProduct.sizes.length > 0) {
            setSelectedSize(mockProduct.sizes[0]);
          }
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError('Error loading product details');
        console.error('Product detail error:', err);
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

    if (!selectedSize) {
      setSnackbarMessage('Please select a size');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    if (!selectedColor) {
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

    const result = await addToCart(product, quantity, selectedSize, selectedColor);
    
    if (result && result.error) {
      // Handle stock error from server
      setSnackbarMessage(result.message);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      
      // If available stock info was returned, update quantity to match available stock
      if (result.availableStock) {
        setQuantity(result.availableStock);
      }
    } else {
      setSnackbarMessage('Product added to cart!');
      setSnackbarSeverity('success');
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
              src={product.imageUrls[selectedImage]}
              alt={product.name}
              sx={{
                width: '100%',
                height: 'auto',
                objectFit: 'contain',
                borderRadius: 1,
                mb: 2
              }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
              {product.imageUrls.map((url, index) => (
                <Box
                  key={index}
                  component="img"
                  src={url}
                  sx={{
                    width: 80,
                    height: 80,
                    objectFit: 'cover',
                    cursor: 'pointer',
                    border: index === selectedImage ? '2px solid #1976d2' : '2px solid transparent',
                    borderRadius: 1
                  }}
                  onClick={() => setSelectedImage(index)}
                />
              ))}
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
                ({product.ratings.length} reviews)
              </Typography>
            </Box>
            
            <Typography variant="h5" color="primary" sx={{ mb: 2 }}>
              ${product.price.toFixed(2)}
            </Typography>
            
            <Divider sx={{ mb: 2 }} />
            
            <Typography variant="body1" sx={{ mb: 3 }}>
              {product.description}
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Brand: <Chip label={product.brand} size="small" />
              </Typography>
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
              {product.sizes.length > 0 && (
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
              
              {product.colors.length > 0 && (
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
                  InputProps={{ inputProps: { min: 1, max: 100 } }}
                  sx={{ width: 60, mx: 1 }}
                  size="small"
                />
                <IconButton
                  onClick={incrementQuantity}
                  disabled={quantity >= 100}
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
              <br /><br />
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </Typography>
          )}
        </Box>
        
        <Box role="tabpanel" hidden={tabValue !== 1} p={3}>
          {tabValue === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Customer Reviews
              </Typography>
              
              {product.ratings.length === 0 ? (
                <Typography>No reviews yet. Be the first to leave a review!</Typography>
              ) : (
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Rating
                      value={getAverageRating(product.ratings)}
                      precision={0.1}
                      readOnly
                    />
                    <Typography variant="subtitle1" sx={{ ml: 1 }}>
                      {getAverageRating(product.ratings).toFixed(1)} out of 5
                    </Typography>
                  </Box>
                  
                  {product.ratings.map((rating, index) => (
                    <Card key={index} sx={{ mb: 2 }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="subtitle1">
                            User
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {rating.date}
                          </Typography>
                        </Box>
                        <Rating value={rating.rating} precision={0.5} readOnly size="small" />
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {rating.review}
                        </Typography>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              )}
            </Box>
          )}
        </Box>
        
        <Box role="tabpanel" hidden={tabValue !== 2} p={3}>
          {tabValue === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Shipping Information
              </Typography>
              <Typography variant="body1" paragraph>
                We ship to most countries worldwide. Standard shipping takes 3-7 business days, while express shipping takes 1-3 business days.
              </Typography>
              
              <Typography variant="h6" gutterBottom>
                Return Policy
              </Typography>
              <Typography variant="body1">
                If you're not satisfied with your purchase, you can return it within 30 days for a full refund. The product must be in its original condition and packaging.
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>

      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={6000} 
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ProductDetail; 