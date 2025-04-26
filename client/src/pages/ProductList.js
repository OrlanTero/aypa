import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  CircularProgress,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Slider,
  Chip,
  Rating,
  Paper,
  Stack,
  Divider,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterAlt as FilterIcon,
  Clear as ClearIcon,
  ShoppingCart as CartIcon
} from '@mui/icons-material';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { formatCurrency } from '../utils/formatters';
import { getProductImageUrl, handleImageError } from '../utils/imageUtils';
import defaultProductImage from '../assets/default-product.jpg';

const categories = ['All', 'TShirt', 'IDLaces', 'Accessories', 'Other'];
const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'popular', label: 'Most Popular' }
];

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [maxPrice, setMaxPrice] = useState(5000);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [availableSizes, setAvailableSizes] = useState([]);
  const [availableColors, setAvailableColors] = useState([]);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
  
  const { isAuthenticated } = useContext(AuthContext);
  const { addToCart, error: cartError } = useContext(CartContext);
  
  const location = useLocation();
  const navigate = useNavigate();
  
  // Products per page
  const ITEMS_PER_PAGE = 9;

  useEffect(() => {
    // Parse query params and set state
    const queryParams = new URLSearchParams(location.search);
    if (queryParams.get('category')) setSelectedCategory(queryParams.get('category'));
    if (queryParams.get('search')) setSearchTerm(queryParams.get('search'));
    if (queryParams.get('page')) setPage(parseInt(queryParams.get('page'), 10) || 1);
    if (queryParams.get('sort')) setSortBy(queryParams.get('sort'));
    if (queryParams.get('size')) setSelectedSize(queryParams.get('size'));
    if (queryParams.get('color')) setSelectedColor(queryParams.get('color'));
  }, [location.search]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        // Fetch all products from the API
        const res = await axios.get('/api/products');
        const allProducts = res.data;
        
        setProducts(allProducts);
        
        // Determine available sizes and colors
        const sizes = [...new Set(allProducts.flatMap(product => product.sizes || []))];
        const colors = [...new Set(allProducts.flatMap(product => product.colors || []))];
        
        setAvailableSizes(sizes);
        setAvailableColors(colors);
        
        // Find the highest price for price range slider
        const highestPrice = Math.max(...allProducts.map(product => product.price), 0);
        setMaxPrice(Math.ceil(highestPrice / 500) * 500); // Round up to nearest 500
        setPriceRange([0, highestPrice > 5000 ? highestPrice : 5000]);
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading products:', err);
        setError('Failed to load products. Please try again later.');
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Calculate average rating
  const getAverageRating = (ratings) => {
    if (!ratings || ratings.length === 0) return 0;
    const sum = ratings.reduce((total, item) => total + item.rating, 0);
    return sum / ratings.length;
  };

  // Handle filter changes
  const handleCategoryChange = (event) => {
    const category = event.target.value;
    setSelectedCategory(category);
    setPage(1);
    updateQueryParams({ category, page: 1 });
  };

  const handleSortChange = (event) => {
    setSortBy(event.target.value);
    updateQueryParams({ sort: event.target.value });
  };

  const handlePriceChange = (event, newValue) => {
    setPriceRange(newValue);
  };

  const handleSizeChange = (event) => {
    setSelectedSize(event.target.value);
    updateQueryParams({ size: event.target.value });
  };

  const handleColorChange = (event) => {
    setSelectedColor(event.target.value);
    updateQueryParams({ color: event.target.value });
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    setPage(1);
    updateQueryParams({ search: searchTerm, page: 1 });
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    updateQueryParams({ page: value });
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
      navigate('/login', { state: { from: location.pathname + location.search } });
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const clearFilters = () => {
    setSelectedCategory('All');
    setSortBy('newest');
    setPriceRange([0, maxPrice]);
    setSearchTerm('');
    setSelectedSize('');
    setSelectedColor('');
    setPage(1);
    navigate('/products');
  };

  // Update URL with query parameters
  const updateQueryParams = (params) => {
    const queryParams = new URLSearchParams(location.search);
    
    Object.entries(params).forEach(([key, value]) => {
      if (value === 'All' || value === '') {
        queryParams.delete(key);
      } else {
        queryParams.set(key, value);
      }
    });
    
    navigate({
      pathname: location.pathname,
      search: queryParams.toString()
    }, { replace: true });
  };

  // Filter products based on all criteria
  const filteredProducts = products
    .filter((product) => {
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      const matchesSearch = searchTerm === '' || 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
      const matchesSize = selectedSize === '' || (product.sizes && product.sizes.includes(selectedSize));
      const matchesColor = selectedColor === '' || (product.colors && product.colors.includes(selectedColor));
      
      return matchesCategory && matchesSearch && matchesPrice && matchesSize && matchesColor;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price_low':
          return a.price - b.price;
        case 'price_high':
          return b.price - a.price;
        case 'popular':
          return getAverageRating(b.ratings) - getAverageRating(a.ratings);
        case 'newest':
        default:
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
    });

  // Paginate products
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  const totalFilteredPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, minHeight: '70vh', alignItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="error" gutterBottom>
            {error}
          </Typography>
          <Button
            variant="contained"
            onClick={() => window.location.reload()}
            sx={{ mt: 2 }}
          >
            Try Again
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
        Products
      </Typography>
      
      <Grid container spacing={3}>
        {/* Filters Sidebar */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, mb: { xs: 2, md: 0 }, position: { md: 'sticky' }, top: { md: '80px' } }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                <FilterIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                Filters
              </Typography>
              
              <Box component="form" onSubmit={handleSearchSubmit} sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  label="Search"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Button type="submit" sx={{ minWidth: 'auto' }}>
                          <SearchIcon />
                        </Button>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
              
              <FormControl fullWidth margin="normal">
                <InputLabel id="category-label">Category</InputLabel>
                <Select
                  labelId="category-label"
                  id="category-select"
                  value={selectedCategory}
                  label="Category"
                  onChange={handleCategoryChange}
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              {availableSizes.length > 0 && (
                <FormControl fullWidth margin="normal">
                  <InputLabel id="size-label">Size</InputLabel>
                  <Select
                    labelId="size-label"
                    id="size-select"
                    value={selectedSize}
                    label="Size"
                    onChange={handleSizeChange}
                  >
                    <MenuItem value="">All Sizes</MenuItem>
                    {availableSizes.map((size) => (
                      <MenuItem key={size} value={size}>
                        {size}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
              
              {availableColors.length > 0 && (
                <FormControl fullWidth margin="normal">
                  <InputLabel id="color-label">Color</InputLabel>
                  <Select
                    labelId="color-label"
                    id="color-select"
                    value={selectedColor}
                    label="Color"
                    onChange={handleColorChange}
                  >
                    <MenuItem value="">All Colors</MenuItem>
                    {availableColors.map((color) => (
                      <MenuItem key={color} value={color}>
                        {color}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
              
              <FormControl fullWidth margin="normal">
                <InputLabel id="sort-label">Sort By</InputLabel>
                <Select
                  labelId="sort-label"
                  id="sort-select"
                  value={sortBy}
                  label="Sort By"
                  onChange={handleSortChange}
                >
                  {sortOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <Box sx={{ mt: 3 }}>
                <Typography id="price-range-slider" gutterBottom>
                  Price Range
                </Typography>
                <Slider
                  value={priceRange}
                  onChange={handlePriceChange}
                  onChangeCommitted={(e, newValue) => updateQueryParams({ price: newValue.join('-') })}
                  valueLabelDisplay="auto"
                  min={0}
                  max={maxPrice}
                  step={100}
                  aria-labelledby="price-range-slider"
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Typography variant="body2">{formatCurrency(priceRange[0])}</Typography>
                  <Typography variant="body2">{formatCurrency(priceRange[1])}</Typography>
                </Box>
              </Box>
              
              <Button
                variant="outlined"
                startIcon={<ClearIcon />}
                onClick={clearFilters}
                sx={{ mt: 2 }}
                fullWidth
              >
                Clear Filters
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        {/* Product Grid */}
        <Grid item xs={12} md={9}>
          {/* Showing results count */}
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Showing {filteredProducts.length > 0 ? startIndex + 1 : 0} - {Math.min(startIndex + ITEMS_PER_PAGE, filteredProducts.length)} of {filteredProducts.length} products
            </Typography>
          </Box>
          
          {paginatedProducts.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6">No products found</Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                Try changing your search criteria or browse our categories
              </Typography>
              <Button
                variant="contained"
                onClick={clearFilters}
                sx={{ mt: 3 }}
              >
                Clear Filters
              </Button>
            </Paper>
          ) : (
            <>
              <Grid container spacing={3}>
                {paginatedProducts.map((product) => (
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
                        overflow: 'hidden'
                      }}
                    >
                      <Box
                        sx={{
                          position: 'relative',
                          pt: '75%', // 4:3 aspect ratio
                          bgcolor: 'background.paper',
                          cursor: 'pointer'
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
                            p: 2
                          }}
                          onError={handleImageError(defaultProductImage)}
                        />
                        {product.stock === 0 && (
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 10,
                              right: 10,
                              bgcolor: 'error.main',
                              color: 'white',
                              py: 0.5,
                              px: 1,
                              borderRadius: 1,
                              fontSize: '0.75rem',
                              fontWeight: 'bold'
                            }}
                          >
                            Out of Stock
                          </Box>
                        )}
                      </Box>
                      
                      <CardContent sx={{ 
                        flexGrow: 1, 
                        display: 'flex', 
                        flexDirection: 'column',
                        p: { xs: 1.5, sm: 2 }
                      }}>
                        <Typography 
                          gutterBottom 
                          variant="h6" 
                          component="h2" 
                          sx={{ 
                            mb: 0.5,
                            fontSize: { xs: '0.95rem', sm: '1.1rem', md: '1.25rem' },
                            lineHeight: 1.2,
                            fontWeight: 600,
                            height: { xs: 'auto', sm: '2.4em' },
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
                            precision={0.5} 
                            readOnly 
                            size="small"
                          />
                          <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                            ({product.ratings?.length || 0})
                          </Typography>
                        </Box>
                        
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{
                            mb: 1,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            height: { xs: 'auto', sm: '2.5em' }
                          }}
                        >
                          {product.description}
                        </Typography>
                        
                        <Typography 
                          variant="h6" 
                          color="primary" 
                          sx={{ 
                            mt: 'auto',
                            fontWeight: 'bold',
                            fontSize: { xs: '1.1rem', sm: '1.25rem' }
                          }}
                        >
                          {formatCurrency(product.price)}
                        </Typography>
                        
                        {/* Size chips */}
                        {product.sizes && product.sizes.length > 0 && (
                          <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {product.sizes.slice(0, 3).map((size) => (
                              <Chip key={size} label={size} size="small" variant="outlined" sx={{ mr: 0.5, mb: 0.5 }} />
                            ))}
                            {product.sizes.length > 3 && (
                              <Chip label={`+${product.sizes.length - 3}`} size="small" variant="outlined" />
                            )}
                          </Box>
                        )}
                      </CardContent>
                      <Divider />
                      <Box sx={{ 
                        p: { xs: 1.5, sm: 2 }, 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <Button 
                          variant="outlined" 
                          size="small" 
                          component={Link} 
                          to={`/products/${product._id}`}
                          sx={{ 
                            minWidth: { xs: '60px', sm: 'auto' }, 
                            fontSize: { xs: '0.7rem', sm: '0.8125rem' },
                            px: { xs: 1, sm: 2 }
                          }}
                        >
                          Details
                        </Button>
                        <Button
                          variant="contained"
                          size="small"
                          disabled={product.stock === 0}
                          onClick={() => handleAddToCart(product)}
                          startIcon={<CartIcon />}
                          sx={{ 
                            minWidth: { xs: '60px', sm: 'auto' }, 
                            fontSize: { xs: '0.7rem', sm: '0.8125rem' },
                            px: { xs: 1, sm: 2 }
                          }}
                        >
                          {product.stock === 0 ? 'Out of Stock' : 'Add'}
                        </Button>
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
              
              {/* Pagination */}
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 2 }}>
                <Pagination 
                  count={Math.ceil(filteredProducts.length / ITEMS_PER_PAGE)} 
                  page={page} 
                  onChange={handlePageChange}
                  color="primary"
                  size="medium"
                />
              </Box>
            </>
          )}
        </Grid>
      </Grid>

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

export default ProductList; 