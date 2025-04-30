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
  CardContent,
  Link,
  Menu,
  MenuItem as MenuItemUI,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  ShoppingCart as CartIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Share as ShareIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Send as SendIcon,
  ContentCopy as ContentCopyIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  WhatsApp as WhatsAppIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { FavoritesContext } from '../context/FavoritesContext';
import { PRODUCT_ENDPOINTS } from '../constants/apiConfig';
import defaultProductImage from '../assets/default-product.jpg';
import { getProductImageUrl, handleImageError } from '../utils/imageUtils';
import { formatCurrency } from '../utils/formatters';
import { setDocumentTitle, PAGE_TITLES } from '../utils/titleUtils';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);
  const { isFavorite, addToFavorites, removeFromFavorites } = useContext(FavoritesContext);
  
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
  const [isProductFavorite, setIsProductFavorite] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [userHasReviewed, setUserHasReviewed] = useState(false);
  
  // Share menu state
  const [shareMenuAnchor, setShareMenuAnchor] = useState(null);
  const shareMenuOpen = Boolean(shareMenuAnchor);

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
        
        // Check if user has already reviewed this product
        if (isAuthenticated && user && productData.ratings) {
          const hasReviewed = productData.ratings.some(
            review => review.user === user.id
          );
          setUserHasReviewed(hasReviewed);
        }
        
        setLoading(false);
        setDocumentTitle(product ? `${product.name} | ${PAGE_TITLES.PRODUCT_DETAIL}` : PAGE_TITLES.PRODUCT_DETAIL);
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError('Failed to load product details. Please try again later.');
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, isAuthenticated, user]);

  useEffect(() => {
    if (product && isAuthenticated) {
      setIsProductFavorite(isFavorite(product._id));
    }
  }, [product, isFavorite, isAuthenticated]);

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

  // Add toggleFavorite function
  const toggleFavorite = async () => {
    if (!isAuthenticated) {
      // Show login prompt
      setSnackbarMessage('Please log in to add items to favorites');
      setSnackbarSeverity('info');
      setSnackbarOpen(true);
      return;
    }

    try {
      if (isProductFavorite) {
        await removeFromFavorites(product._id);
        setSnackbarMessage('Removed from favorites');
      } else {
        await addToFavorites(product._id);
        setSnackbarMessage('Added to favorites');
      }
      setIsProductFavorite(!isProductFavorite);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Error toggling favorite:', err);
      setSnackbarMessage('Failed to update favorites');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleReviewRatingChange = (event, newValue) => {
    setReviewRating(newValue);
  };
  
  const handleReviewCommentChange = (event) => {
    setReviewComment(event.target.value);
  };
  
  const handleSubmitReview = async () => {
    if (!isAuthenticated) {
      setSnackbarMessage('Please log in to submit a review');
      setSnackbarSeverity('info');
      setSnackbarOpen(true);
      return;
    }
    
    if (!reviewComment.trim()) {
      setSnackbarMessage('Please enter a review comment');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    
    try {
      setReviewSubmitting(true);
      const response = await axios.post(
        PRODUCT_ENDPOINTS.REVIEWS(id),
        {
          rating: reviewRating,
          review: reviewComment
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': localStorage.getItem('token')
          }
        }
      );
      
      // Update product with new reviews
      setProduct({ ...product, ratings: response.data });
      setUserHasReviewed(true);
      
      // Reset form
      setReviewComment('');
      setReviewRating(5);
      
      setSnackbarMessage('Review submitted successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Error submitting review:', err);
      let errorMsg = 'Failed to submit review. Please try again.';
      
      if (err.response && err.response.data && err.response.data.msg) {
        errorMsg = err.response.data.msg;
      }
      
      setSnackbarMessage(errorMsg);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setReviewSubmitting(false);
    }
  };

  // Handle share menu open
  const handleShareClick = (event) => {
    setShareMenuAnchor(event.currentTarget);
  };

  // Handle share menu close
  const handleShareMenuClose = () => {
    setShareMenuAnchor(null);
  };

  // Copy product URL to clipboard
  const handleCopyLink = () => {
    const productUrl = window.location.href;
    navigator.clipboard.writeText(productUrl)
      .then(() => {
        setSnackbarMessage('Link copied to clipboard');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        handleShareMenuClose();
      })
      .catch((err) => {
        console.error('Failed to copy link:', err);
        setSnackbarMessage('Failed to copy link');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      });
  };

  // Share on Facebook
  const handleShareFacebook = () => {
    const productUrl = encodeURIComponent(window.location.href);
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${productUrl}`;
    window.open(shareUrl, '_blank');
    handleShareMenuClose();
  };

  // Share on Twitter
  const handleShareTwitter = () => {
    const productUrl = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`Check out this ${product.name}!`);
    const shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${productUrl}`;
    window.open(shareUrl, '_blank');
    handleShareMenuClose();
  };

  // Share on WhatsApp
  const handleShareWhatsApp = () => {
    const productUrl = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`Check out this ${product.name}! ${window.location.href}`);
    const shareUrl = `https://wa.me/?text=${text}`;
    window.open(shareUrl, '_blank');
    handleShareMenuClose();
  };

  // Share via Email
  const handleShareEmail = () => {
    const subject = encodeURIComponent(`Check out this ${product.name}!`);
    const body = encodeURIComponent(`I found this amazing product: ${product.name}\n\nPrice: ${formatCurrency(product.price)}\n\nCheck it out here: ${window.location.href}`);
    const mailtoUrl = `mailto:?subject=${subject}&body=${body}`;
    window.location.href = mailtoUrl;
    handleShareMenuClose();
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
    <Container maxWidth="lg" sx={{ mt: { xs: 2, sm: 4 }, mb: { xs: 4, sm: 6 } }}>
      <Grid container spacing={{ xs: 2, md: 4 }}>
        {/* Product Images */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: { xs: 1, sm: 2 }, mb: 2 }}>
            <Box
              component="img"
              src={getProductImageUrl(product, selectedImage)}
              alt={product.name}
              sx={{
                width: '100%',
                height: 'auto',
                maxHeight: { xs: 300, sm: 400 },
                objectFit: 'contain',
                borderRadius: 1,
                mb: { xs: 1, sm: 2 }
              }}
              onError={handleImageError(defaultProductImage)}
            />
            <Box sx={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              justifyContent: 'center', 
              gap: { xs: 0.5, sm: 1 } 
            }}>
              {product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls.map((url, index) => (
                <Box
                  key={index}
                  component="img"
                  src={getProductImageUrl(product, index)}
                  sx={{
                    width: { xs: 60, sm: 80 },
                    height: { xs: 60, sm: 80 },
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
                    width: { xs: 60, sm: 80 },
                    height: { xs: 60, sm: 80 },
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
          <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography 
              variant="h4" 
              component="h1" 
              gutterBottom
              sx={{ 
                fontSize: { xs: '1.5rem', sm: '2rem', md: '2.25rem' },
                fontWeight: 600,
                lineHeight: 1.2
              }}
            >
              {product.name}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Rating
                value={getAverageRating(product.ratings)}
                precision={0.1}
                readOnly
                size="small"
              />
              <Typography variant="body2" sx={{ ml: 1 }}>
                ({product.ratings?.length || 0} reviews)
              </Typography>
            </Box>
            
            <Typography 
              variant="h5" 
              color="primary" 
              sx={{ 
                mb: 2,
                fontWeight: 'bold',
                fontSize: { xs: '1.25rem', sm: '1.5rem' }
              }}
            >
              {formatCurrency(product.price)}
            </Typography>
            
            <Divider sx={{ mb: 2 }} />
            
            <Typography variant="body1" sx={{ mb: 3 }}>
              {product.description}
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                {product.stock > 0 ? (
                  <Chip 
                    label={`In Stock (${product.stock} available)`} 
                    color="success" 
                    size="small" 
                    sx={{ mr: 1 }}
                  />
                ) : (
                  <Chip 
                    label="Out of Stock" 
                    color="error" 
                    size="small" 
                    sx={{ mr: 1 }}
                  />
                )}
                {product.brand && (
                  <Chip 
                    label={`Brand: ${product.brand}`} 
                    variant="outlined" 
                    size="small" 
                    sx={{ mr: 1 }}
                  />
                )}
                <Chip 
                  label={`Category: ${product.category}`} 
                  variant="outlined" 
                  size="small" 
                />
              </Typography>
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
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
              </Box>
            )}
            
            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
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
              </Box>
            )}
            
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
            
            <Box sx={{ 
              display: 'flex', 
              gap: 2,
              flexDirection: { xs: 'column', sm: 'row' }
            }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<CartIcon />}
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                size="large"
                fullWidth
                sx={{ py: { xs: 1, sm: 1.5 } }}
              >
                Add to Cart
              </Button>
              <Box sx={{ 
                display: 'flex', 
                gap: 1,
                justifyContent: { xs: 'center', sm: 'flex-start' },
                mt: { xs: 1, sm: 0 }
              }}>
                <IconButton 
                  color={isProductFavorite ? "secondary" : "default"} 
                  aria-label={isProductFavorite ? "remove from favorites" : "add to favorites"}
                  onClick={toggleFavorite}
                >
                  {isProductFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                </IconButton>
                <IconButton 
                  color="primary" 
                  aria-label="share"
                  onClick={handleShareClick}
                >
                  <ShareIcon />
                </IconButton>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Tabs for Details, Reviews, etc. */}
      <Paper sx={{ mt: { xs: 2, sm: 4 } }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="product tabs"
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
          >
            <Tab label="Description" id="tab-0" />
            <Tab label="Reviews" id="tab-1" />
            <Tab label="Shipping & Returns" id="tab-2" />
          </Tabs>
        </Box>
        
        <Box role="tabpanel" hidden={tabValue !== 0} p={{ xs: 2, sm: 3 }}>
          {tabValue === 0 && (
            <Typography variant="body1">
              {product.description}
            </Typography>
          )}
        </Box>
        
        <Box role="tabpanel" hidden={tabValue !== 1} p={{ xs: 2, sm: 3 }}>
          {tabValue === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Customer Reviews
              </Typography>
              
              {/* Review submission form */}
              {isAuthenticated ? (
                !userHasReviewed ? (
                  <Box sx={{ mb: 4, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid rgba(0, 0, 0, 0.12)' }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Write a Review
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography component="legend" variant="body2" gutterBottom>
                        Your Rating
                      </Typography>
                      <Rating
                        name="review-rating"
                        value={reviewRating}
                        onChange={handleReviewRatingChange}
                        precision={1}
                      />
                    </Box>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      variant="outlined"
                      placeholder="Share your experience with this product..."
                      value={reviewComment}
                      onChange={handleReviewCommentChange}
                      sx={{ mb: 2 }}
                    />
                    <Button
                      variant="contained"
                      color="primary"
                      endIcon={<SendIcon />}
                      onClick={handleSubmitReview}
                      disabled={reviewSubmitting || !reviewComment.trim()}
                    >
                      {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                    </Button>
                  </Box>
                ) : (
                  <Alert severity="info" sx={{ mb: 3 }}>
                    You have already reviewed this product.
                  </Alert>
                )
              ) : (
                <Alert severity="info" sx={{ mb: 3 }}>
                  Please <Link href="/login" underline="hover">log in</Link> to leave a review.
                </Alert>
              )}
              
              {/* Reviews list */}
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
        
        <Box role="tabpanel" hidden={tabValue !== 2} p={{ xs: 2, sm: 3 }}>
          {tabValue === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Shipping Information
              </Typography>
              <Typography variant="body2" paragraph>
                We ship all over the Philippines. Standard delivery takes 3-5 business days, while express shipping takes 1-2 business days.
              </Typography>
              
              <Typography variant="h6" gutterBottom>
                Return Policy
              </Typography>
              <Typography variant="body2">
                Returns are accepted within 7 days of delivery. Items must be unused and in original packaging. Please contact our customer service team to initiate a return.
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>
      
      {/* Share Menu */}
      <Menu
        anchorEl={shareMenuAnchor}
        open={shareMenuOpen}
        onClose={handleShareMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <MenuItemUI onClick={handleCopyLink}>
          <ListItemIcon>
            <ContentCopyIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Copy Link</ListItemText>
        </MenuItemUI>
        <MenuItemUI onClick={handleShareFacebook}>
          <ListItemIcon>
            <FacebookIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText>Facebook</ListItemText>
        </MenuItemUI>
        <MenuItemUI onClick={handleShareTwitter}>
          <ListItemIcon>
            <TwitterIcon fontSize="small" sx={{ color: '#1DA1F2' }} />
          </ListItemIcon>
          <ListItemText>Twitter</ListItemText>
        </MenuItemUI>
        <MenuItemUI onClick={handleShareWhatsApp}>
          <ListItemIcon>
            <WhatsAppIcon fontSize="small" sx={{ color: '#25D366' }} />
          </ListItemIcon>
          <ListItemText>WhatsApp</ListItemText>
        </MenuItemUI>
        <MenuItemUI onClick={handleShareEmail}>
          <ListItemIcon>
            <EmailIcon fontSize="small" color="action" />
          </ListItemIcon>
          <ListItemText>Email</ListItemText>
        </MenuItemUI>
      </Menu>
      
      {/* Notification snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={snackbarSeverity}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ProductDetail; 