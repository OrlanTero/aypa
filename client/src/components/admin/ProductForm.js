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
  InputAdornment,
  Divider,
  FormHelperText
} from '@mui/material';
import {
  Add as AddIcon,
  Close as CloseIcon,
  CloudUpload as CloudUploadIcon
} from '@mui/icons-material';
import axios from 'axios';
import { PRODUCT_ENDPOINTS } from '../../constants/apiConfig';
import { getImageUrl } from '../../utils/imageUtils';
import defaultProductImage from '../../assets/default-product.jpg';

// Suggested categories (no longer enforced as enum)
const suggestedCategories = ['Electronics', 'Clothing', 'Shoes', 'Accessories', 'Home', 'Beauty', 'Sports', 'Books'];

// Suggested sizes (no longer enforced as enum)
const suggestedSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size'];

// Suggested colors (no longer enforced)
const suggestedColors = ['Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Navy', 'Gray', 'Brown'];

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
  
  // New size/color/category inputs
  const [newSize, setNewSize] = useState('');
  const [newColor, setNewColor] = useState('');
  const [customColor, setCustomColor] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [customSize, setCustomSize] = useState('');
  
  // Image upload state
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
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
      
      // Set image previews if available
      if (product.imageUrls && product.imageUrls.length > 0) {
        console.log('Original image URLs:', product.imageUrls);
        
        // Convert relative paths to full URLs
        const fullImageUrls = product.imageUrls.map(url => {
          const fullUrl = getImageUrl(url);
          console.log(`Converted ${url} to ${fullUrl}`);
          return fullUrl;
        });
        
        setImagePreviews(fullImageUrls);
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

  const handleAddCustomSize = () => {
    if (customSize && !formData.sizes.includes(customSize)) {
      setFormData({
        ...formData,
        sizes: [...formData.sizes, customSize]
      });
      setCustomSize('');
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

  const handleAddCustomCategory = () => {
    if (newCategory && newCategory.trim() !== '') {
      setFormData({
        ...formData,
        category: newCategory
      });
      setNewCategory('');
    }
  };
  
  const handleAddCustomColor = () => {
    if (customColor && !formData.colors.includes(customColor)) {
      setFormData({
        ...formData,
        colors: [...formData.colors, customColor]
      });
      setCustomColor('');
    }
  };
  
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;
    
    // Limit to 5 images total
    const newFiles = files.slice(0, 5 - images.length);
    
    // Update images array
    setImages(prevImages => [...prevImages, ...newFiles]);
    
    // Generate and update previews
    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    setImagePreviews(prevPreviews => [...prevPreviews, ...newPreviews]);
  };
  
  const handleRemoveImage = (index) => {
    // Remove image and its preview
    setImages(prevImages => prevImages.filter((_, i) => i !== index));
    
    // Revoke object URL to avoid memory leaks
    URL.revokeObjectURL(imagePreviews[index]);
    setImagePreviews(prevPreviews => prevPreviews.filter((_, i) => i !== index));
  };
  
  const handleRemoveExistingImage = (imageUrl) => {
    setImagePreviews(prevPreviews => prevPreviews.filter(url => url !== imageUrl));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      // Validate form data
      if (!formData.name || !formData.price || !formData.category || !formData.stock || !formData.description) {
        setError('Please fill all required fields');
        setLoading(false);
        return;
      }
      
      // Create FormData object for multipart/form-data submission
      const productFormData = new FormData();
      
      // Add basic product data
      Object.keys(formData).forEach(key => {
        if (key === 'sizes' || key === 'colors') {
          // Convert arrays to JSON strings
          productFormData.append(key, JSON.stringify(formData[key]));
        } else {
          productFormData.append(key, formData[key]);
        }
      });
      
      // Add existing images that haven't been removed
      if (isEditMode && product.imageUrls) {
        // Filter to get original server paths of remaining images
        const existingImagePaths = product.imageUrls.filter(url => {
          // Check if the image URL is still in the previews (by filename)
          return imagePreviews.some(preview => {
            const previewFilename = preview.split('/').pop();
            const urlFilename = url.split('/').pop();
            return previewFilename === urlFilename;
          });
        });
        
        productFormData.append('existingImages', JSON.stringify(existingImagePaths));
      }
      
      // Add new images
      images.forEach(image => {
        productFormData.append('images', image);
      });
      
      // Submit to API
      let response;
      if (isEditMode) {
        response = await axios.put(
          PRODUCT_ENDPOINTS.UPDATE(product._id),
          productFormData,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            },
            onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setUploadProgress(percentCompleted);
            }
          }
        );
      } else {
        response = await axios.post(
          PRODUCT_ENDPOINTS.CREATE,
          productFormData,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            },
            onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setUploadProgress(percentCompleted);
            }
          }
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
                <Typography variant="subtitle1" gutterBottom>
                  Product Images ({imagePreviews.length}/5)
                </Typography>
                
                <Box sx={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: 1,
                  justifyContent: 'center',
                  mb: 2 
                }}>
                  {imagePreviews.length > 0 ? (
                    imagePreviews.map((preview, index) => (
                      <Box 
                        key={index} 
                        sx={{ 
                          position: 'relative',
                          width: 80,
                          height: 80
                        }}
                      >
                        <img 
                          src={preview}
                          alt={`Product preview ${index + 1}`}
                          style={{ 
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            border: '1px solid #eee',
                            borderRadius: '4px',
                            padding: '4px',
                            backgroundColor: '#f9f9f9'
                          }} 
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = defaultProductImage;
                          }}
                        />
                        <IconButton
                          size="small"
                          sx={{ 
                            position: 'absolute', 
                            top: -8, 
                            right: -8,
                            bgcolor: 'rgba(255,255,255,0.8)',
                            '&:hover': {
                              bgcolor: 'rgba(255,255,255,0.9)',
                            }
                          }}
                          onClick={() => {
                            // Check if it's an existing image or a new one
                            if (isEditMode && product.imageUrls) {
                              // Check if this is an existing image (compare base filenames)
                              const isExistingImage = product.imageUrls.some(url => {
                                const previewFilename = preview.split('/').pop();
                                const urlFilename = url.split('/').pop();
                                return previewFilename === urlFilename;
                              });
                              
                              if (isExistingImage) {
                                handleRemoveExistingImage(preview);
                              } else {
                                handleRemoveImage(index);
                              }
                            } else {
                              handleRemoveImage(index);
                            }
                          }}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No images selected
                    </Typography>
                  )}
                </Box>
                
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                  sx={{ mt: 1 }}
                  disabled={imagePreviews.length >= 5}
                >
                  Upload Images
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    multiple
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
                      startAdornment: <InputAdornment position="start">₱</InputAdornment>,
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
                
                {/* Category Dropdown and Custom Category */}
                <Grid item xs={12} sm={6}>
                  <Box sx={{ mb: 1 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel id="category-label">Category</InputLabel>
                      <Select
                        labelId="category-label"
                        id="category"
                        name="category"
                        value={formData.category}
                        label="Category"
                        onChange={handleInputChange}
                        error={!!error}
                      >
                        {suggestedCategories.map((category) => (
                          <MenuItem key={category} value={category}>
                            {category}
                          </MenuItem>
                        ))}
                      </Select>
                      {error && (
                        <FormHelperText error>{error}</FormHelperText>
                      )}
                    </FormControl>
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="New Category"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      placeholder="Add custom category"
                    />
                    <Button 
                      variant="outlined" 
                      onClick={handleAddCustomCategory}
                      startIcon={<AddIcon />}
                      disabled={!newCategory || newCategory === formData.category}
                    >
                      Add
                    </Button>
                  </Box>
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
                    required
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
                
                {/* Sizes Section with custom option */}
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
                        {suggestedSizes
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
                  
                  <Box sx={{ display: 'flex', gap: 1, mt: 1, mb: 1 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Custom Size"
                      value={customSize}
                      onChange={(e) => setCustomSize(e.target.value)}
                      placeholder="Enter a custom size"
                    />
                    <Button 
                      variant="outlined" 
                      onClick={handleAddCustomSize}
                      startIcon={<AddIcon />}
                      disabled={!customSize || formData.sizes.includes(customSize)}
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
                
                {/* Colors Section with custom option */}
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
                        {suggestedColors
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
                  
                  <Box sx={{ display: 'flex', gap: 1, mt: 1, mb: 1 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Custom Color"
                      value={customColor}
                      onChange={(e) => setCustomColor(e.target.value)}
                      placeholder="Enter a custom color"
                    />
                    <Button 
                      variant="outlined" 
                      onClick={handleAddCustomColor}
                      startIcon={<AddIcon />}
                      disabled={!customColor || formData.colors.includes(customColor)}
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