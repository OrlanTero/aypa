import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  Card,
  CardContent,
  Grid,
  Avatar,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Image as ImageIcon
} from '@mui/icons-material';
import axios from 'axios';
import { PRODUCT_ENDPOINTS } from '../../constants/apiConfig';
import { getProductImageUrl, handleImageError } from '../../utils/imageUtils';
import { formatCurrency } from '../../utils/formatters';
import defaultProductImage from '../../assets/default-product.jpg';

// Import the product form and delete confirmation dialog
import ProductForm from '../../components/admin/ProductForm';
import DeleteConfirmDialog from '../../components/admin/DeleteConfirmDialog';

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  // Dialog states
  const [productFormOpen, setProductFormOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Notification state
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  useEffect(() => {
    fetchProducts();
  }, []);
  
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(PRODUCT_ENDPOINTS.ALL);
      console.log('Products data from API:', response.data);
      
      // Log image URLs for debugging
      if (response.data && response.data.length > 0) {
        response.data.forEach(product => {
          if (product.imageUrls && product.imageUrls.length > 0) {
            console.log(`Product ${product.name} has images:`, product.imageUrls);
            const imageUrl = getProductImageUrl(product, 0);
            console.log(`First image URL processed to: ${imageUrl}`);
          }
        });
      }
      
      setProducts(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please try again later.');
      
      // For demo purposes, use mock data if API fails
      setProducts([
      ]);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Handle search and filter
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(0);
  };
  
  const handleCategoryChange = (category) => {
    setSelectedCategory(category === selectedCategory ? '' : category);
    setPage(0);
  };

  // Product form handlers
  const handleOpenProductForm = (product = null) => {
    setSelectedProduct(product);
    setProductFormOpen(true);
  };

  const handleCloseProductForm = () => {
    setProductFormOpen(false);
    setSelectedProduct(null);
  };

  const handleProductSubmit = (product) => {
    if (selectedProduct) {
      // Update existing product in the state
      setProducts(products.map(p => 
        p._id === product._id ? product : p
      ));
      showNotification('Product updated successfully');
    } else {
      // Add new product to the state
      setProducts([product, ...products]);
      showNotification('Product created successfully');
    }
  };

  // Delete product handlers
  const handleOpenDeleteDialog = (product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setProductToDelete(null);
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;

    try {
      setDeleteLoading(true);
      await axios.delete(PRODUCT_ENDPOINTS.DELETE(productToDelete._id));
      
      // Remove product from state
      setProducts(products.filter(p => p._id !== productToDelete._id));
      showNotification('Product deleted successfully');
    } catch (err) {
      console.error('Error deleting product:', err);
      showNotification('Failed to delete product', 'error');
    } finally {
      setDeleteLoading(false);
      handleCloseDeleteDialog();
    }
  };

  // Notification handlers
  const showNotification = (message, severity = 'success') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };
  
  // Filter products based on search query and category
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? product.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  // Slice products for current page
  const displayedProducts = filteredProducts
    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  
  // Get unique categories for filtering
  const categories = [...new Set(products.map(product => product.category))];
  
  // Stats data
  const stats = [
    {
      title: 'Total Products',
      value: products.length,
      color: 'primary.main'
    },
    {
      title: 'Low Stock Items',
      value: products.filter(product => product.stock < 10 && product.stock > 0).length,
      color: 'warning.main'
    },
    {
      title: 'Out of Stock',
      value: products.filter(product => product.stock === 0).length,
      color: 'error.main'
    },
    {
      title: 'Featured Products',
      value: products.filter(product => product.featured).length,
      color: 'success.main'
    }
  ];

  // Debug helper to ensure image URLs are correctly formatted
  const getDebugProductImage = (product, index = 0) => {
    const imageUrl = getProductImageUrl(product, index);
    console.log(`Debug: Image for ${product.name}:`, imageUrl);
    return imageUrl;
  };

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Inventory Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenProductForm()}
        >
          Add Product
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  {stat.title}
                </Typography>
                <Typography variant="h4" sx={{ color: stat.color, fontWeight: 'bold' }}>
                  {stat.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          <TextField
            placeholder="Search products..."
            value={searchQuery}
            onChange={handleSearchChange}
            size="small"
            sx={{ flexGrow: 1, maxWidth: { xs: '100%', sm: 300 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {categories.map((category) => (
              <Chip
                key={category}
                label={category}
                onClick={() => handleCategoryChange(category)}
                color={selectedCategory === category ? 'primary' : 'default'}
                variant={selectedCategory === category ? 'filled' : 'outlined'}
              />
            ))}
          </Box>
        </Box>
      </Paper>

      {/* Products Table */}
      <Paper>
        <TableContainer>
          <Table aria-label="products table">
            <TableHead>
              <TableRow>
                <TableCell>Product</TableCell>
                <TableCell>Category</TableCell>
                <TableCell align="right">Price</TableCell>
                <TableCell align="right">Stock</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">Loading...</TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ color: 'error.main' }}>
                    {error}
                  </TableCell>
                </TableRow>
              ) : displayedProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No products found
                  </TableCell>
                </TableRow>
              ) : (
                displayedProducts.map((product) => (
                  <TableRow key={product._id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar 
                          variant="rounded" 
                          sx={{ width: 50, height: 50, mr: 2 }}
                          src={getDebugProductImage(product, 0)}
                          alt={product.name}
                          onError={handleImageError(defaultProductImage)}
                        />
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {product.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 240 }}>
                            {product.description && product.description.length > 60
                              ? `${product.description.substring(0, 60)}...`
                              : product.description}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell align="right">{formatCurrency(product.price)}</TableCell>
                    <TableCell align="right">{product.stock}</TableCell>
                    <TableCell align="center">
                      {product.stock === 0 ? (
                        <Chip size="small" label="Out of Stock" color="error" />
                      ) : product.stock < 10 ? (
                        <Chip size="small" label="Low Stock" color="warning" />
                      ) : (
                        <Chip size="small" label="In Stock" color="success" />
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleOpenProductForm(product)}
                        title="Edit product"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleOpenDeleteDialog(product)}
                        title="Delete product"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredProducts.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
      
      {/* Product Form Dialog */}
      <ProductForm
        open={productFormOpen}
        handleClose={handleCloseProductForm}
        product={selectedProduct}
        onSubmitSuccess={handleProductSubmit}
      />
      
      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleDeleteProduct}
        loading={deleteLoading}
        title="Delete Product"
        message={`Are you sure you want to delete "${productToDelete?.name}"? This action cannot be undone.`}
      />
      
      {/* Notifications */}
      <Snackbar
        open={notification.open}
        autoHideDuration={5000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          variant="filled"
          elevation={6}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Inventory; 