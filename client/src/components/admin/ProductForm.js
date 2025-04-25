import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Chip,
  FormControlLabel,
  Switch,
  CircularProgress,
  Typography,
  Paper,
  IconButton,
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  Close as CloseIcon,
  CloudUpload as CloudUploadIcon
} from '@mui/icons-material';
import axios from 'axios';
import { PRODUCT_ENDPOINTS } from '../../constants/apiConfig';
import defaultProductImage from '../../assets/default-product.jpg';

// Available product categories
const categories = ['TShirt', 'IDLaces', 'Accessories', 'Other'];

// Available sizes to match backend validation
const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size'];

// Available colors to match backend validation
const availableColors = ['Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Navy', 'Gray', 'Brown'];

const ProductForm = ({ open, handleClose, product = null, onSubmitSuccess }) => {
  const isEditMode = Boolean(product);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    brand: '',
    stock: '',
    featured: false,
    sizes: [],
    colors: []
  });
  
  // New size/color inputs
  const [newSize, setNewSize] = useState('');
  const [newColor, setNewColor] = useState('');
  
  // Image upload state
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Populate form when editing an existing product
  useEffect(() => {
    if (isEditMode && product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        category: product.category || '',
        brand: product.brand || '',
        stock: product.stock || '',
        featured: product.featured || false,
        sizes: product.sizes || [],
        colors: product.colors || []
      });
      
      // Set image preview if available
      if (product.imageUrls && product.imageUrls.length > 0) {
        setImagePreview(product.imageUrls[0]);
      }
    }
  }, [product, isEditMode]);
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleNumberInput = (e) => {
    const { name, value } = e.target;
    // Only allow numeric input for price and stock
    if (!isNaN(value) || value === '') {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  const handleAddSize = () => {
    if (newSize && !formData.sizes.includes(newSize)) {
      setFormData({
        ...formData,
        sizes: [...formData.sizes, newSize]
      });
      setNewSize('');
    }
  };
  
  const handleRemoveSize = (sizeToRemove) => {
    setFormData({
      ...formData,
      sizes: formData.sizes.filter(size => size !== sizeToRemove)
    });
  };
  
  const handleAddColor = () => {
    if (newColor && !formData.colors.includes(newColor)) {
      setFormData({
        ...formData,
        colors: [...formData.colors, newColor]
      });
      setNewColor('');
    }
  };
  
  const handleRemoveColor = (colorToRemove) => {
    setFormData({
      ...formData,
      colors: formData.colors.filter(color => color !== colorToRemove)
    });
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };
  
  const uploadImage = async () => {
    if (!imageFile) return null;
    
    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    try {
      // Client-side approach - use object URL or base64 for demo
      // In production, you would upload to server with:
      // const formData = new FormData();
      // formData.append('image', imageFile);
      // const response = await axios.post(PRODUCT_ENDPOINTS.UPLOAD_IMAGE, formData, {...});
      
      // Wait for simulated progress
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Clear the interval if it's still running
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Use a local object URL as fallback when server upload not available
      return URL.createObjectURL(imageFile);
    } catch (err) {
      clearInterval(progressInterval);
      console.error('Error handling image:', err);
      throw new Error('Failed to process image');
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      // Validate form data
      if (!formData.name || !formData.price || !formData.category || !formData.stock) {
        setError('Please fill all required fields');
        setLoading(false);
        return;
      }
      
      // Create product data object
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock)
      };
      
      // Handle image - client-side approach for demo
      if (imageFile) {
        try {
          const imageUrl = await uploadImage();
          if (imageUrl) {
            // In a real application with server storage, the URL would be saved to the database
            // For our client-side approach, we'll use the URL directly
            productData.imageUrls = [imageUrl];
          }
        } catch (err) {
          // If image processing fails, we can still proceed with product creation/update
          console.warn('Image processing failed, continuing without image', err);
        }
      } else if (isEditMode && product.imageUrls) {
        // Keep existing images when editing if no new image is uploaded
        productData.imageUrls = product.imageUrls;
      }
      
      // Submit to API
      let response;
      if (isEditMode) {
        response = await axios.put(
          PRODUCT_ENDPOINTS.UPDATE(product._id),
          productData
        );
      } else {
        response = await axios.post(
          PRODUCT_ENDPOINTS.CREATE,
          productData
        );
      }
      
      // Handle success
      onSubmitSuccess(response.data);
      handleClose();
      
    } catch (err) {
      console.error('Error saving product:', err);
      setError(err.response?.data?.message || 'Failed to save product. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle sx={{ pb: 1 }}>
        {isEditMode ? 'Edit Product' : 'Add New Product'}
      </DialogTitle>
      
      <DialogContent dividers>
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
        
        <Box component="form" noValidate sx={{ mt: 1 }}>
          <Grid container spacing={2}>
            {/* Product Image Upload */}
            <Grid item xs={12} md={4}>
              <Paper 
                sx={{ 
                  p: 2, 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center', 
                  justifyContent: 'center',
                  height: '100%',
                  minHeight: 200
                }}
              >
                {imagePreview ? (
                  <Box sx={{ position: 'relative', width: '100%', height: 200, mb: 2 }}>
                    <img 
                      src={imagePreview}
                      alt="Product preview"
                      style={{ 
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        border: '1px solid #eee',
                        borderRadius: '4px',
                        padding: '8px',
                        backgroundColor: '#f9f9f9'
                      }} 
                      onError={(e) => {
                        console.warn('Image preview failed to load, using default image');
                        e.target.onerror = null;
                        e.target.src = defaultProductImage || 'https://via.placeholder.com/300x300?text=Product';
                      }}
                    />
                    <IconButton
                      size="small"
                      sx={{ position: 'absolute', top: 0, right: 0 }}
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview('');
                      }}
                    >
                      <CloseIcon />
                    </IconButton>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    No image selected
                  </Typography>
                )}
                
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                  sx={{ mt: 1 }}
                >
                  Upload Image
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleImageChange}
                  />
                </Button>
                
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <Box sx={{ width: '100%', mt: 2 }}>
                    <CircularProgress 
                      variant="determinate" 
                      value={uploadProgress} 
                      size={24} 
                      sx={{ mx: 'auto', display: 'block' }}
                    />
                    <Typography variant="caption" align="center" display="block">
                      Uploading: {uploadProgress}%
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Grid>
            
            {/* Product Details Form */}
            <Grid item xs={12} md={8}>
              <Grid container spacing={2}>
                {/* Required Fields */}
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    label="Product Name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Price"
                    name="price"
                    value={formData.price}
                    onChange={handleNumberInput}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Stock Quantity"
                    name="stock"
                    value={formData.stock}
                    onChange={handleNumberInput}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Category</InputLabel>
                    <Select
                      name="category"
                      value={formData.category}
                      label="Category"
                      onChange={handleInputChange}
                    >
                      {categories.map((category) => (
                        <MenuItem key={category} value={category}>
                          {category}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Brand"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                  />
                </Grid>
                
                {/* Featured Switch */}
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.featured}
                        onChange={handleInputChange}
                        name="featured"
                        color="primary"
                      />
                    }
                    label="Featured Product"
                  />
                </Grid>
                
                {/* Sizes Section */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Available Sizes
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Select Size</InputLabel>
                      <Select
                        value={newSize}
                        label="Select Size"
                        onChange={(e) => setNewSize(e.target.value)}
                      >
                        {availableSizes
                          .filter(size => !formData.sizes.includes(size))
                          .map((size) => (
                            <MenuItem key={size} value={size}>
                              {size}
                            </MenuItem>
                          ))}
                      </Select>
                    </FormControl>
                    <Button 
                      variant="outlined" 
                      onClick={handleAddSize}
                      startIcon={<AddIcon />}
                      disabled={!newSize || formData.sizes.includes(newSize)}
                    >
                      Add
                    </Button>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {formData.sizes.map((size) => (
                      <Chip
                        key={size}
                        label={size}
                        onDelete={() => handleRemoveSize(size)}
                      />
                    ))}
                  </Box>
                </Grid>
                
                {/* Colors Section */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Available Colors
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Select Color</InputLabel>
                      <Select
                        value={newColor}
                        label="Select Color"
                        onChange={(e) => setNewColor(e.target.value)}
                      >
                        {availableColors
                          .filter(color => !formData.colors.includes(color))
                          .map((color) => (
                            <MenuItem key={color} value={color}>
                              {color}
                            </MenuItem>
                          ))}
                      </Select>
                    </FormControl>
                    <Button 
                      variant="outlined" 
                      onClick={handleAddColor}
                      startIcon={<AddIcon />}
                      disabled={!newColor || formData.colors.includes(newColor)}
                    >
                      Add
                    </Button>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {formData.colors.map((color) => (
                      <Chip
                        key={color}
                        label={color}
                        onDelete={() => handleRemoveColor(color)}
                        sx={{
                          backgroundColor: color.toLowerCase(),
                          color: ['white', 'black', 'navy', 'darkblue', 'darkgreen'].includes(color.toLowerCase()) ? '#fff' : '#000'
                        }}
                      />
                    ))}
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading}
          startIcon={loading && <CircularProgress size={20} />}
        >
          {isEditMode ? 'Update Product' : 'Create Product'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductForm; 