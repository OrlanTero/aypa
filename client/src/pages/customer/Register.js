import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Grid,
  Alert,
  CircularProgress,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import { AuthContext } from '../../context/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { register, error: authError, setError } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    }
  });
  
  const [showAddress, setShowAddress] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState(null);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      // Handle nested address fields
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const validateForm = () => {
    // Name validation
    if (!formData.name.trim()) {
      setFormError('Name is required');
      return false;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setFormError('Please enter a valid email address');
      return false;
    }
    
    // Password validation
    if (formData.password.length < 6) {
      setFormError('Password must be at least 6 characters long');
      return false;
    }
    
    // Password confirmation
    if (formData.password !== formData.confirmPassword) {
      setFormError('Passwords do not match');
      return false;
    }
    
    // Address validation (only if showAddress is true)
    if (showAddress) {
      const { street, city, state, zipCode, country } = formData.address;
      if (!street || !city || !state || !zipCode || !country) {
        setFormError('Please complete all address fields');
        return false;
      }
    }
    
    return true;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      setFormError(null);
      
      // Create a data object without confirmPassword
      const registrationData = {
        ...formData,
        confirmPassword: undefined
      };
      
      // Only include address if showAddress is true
      if (!showAddress) {
        registrationData.address = undefined;
      }
      
      const response = await register(registrationData);
      
      // If registration is successful, redirect to home
      navigate('/');
    } catch (err) {
      setFormError(err.response?.data?.msg || 'Registration failed. Please try again.');
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Container maxWidth="md">
      <Paper 
        elevation={3} 
        sx={{ 
          mt: 8,
          mb: 8, 
          p: 4, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center' 
        }}
      >
        <Typography component="h1" variant="h5" sx={{ mb: 2 }}>
          Create an Account
        </Typography>
        
        {(formError || authError) && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {formError || authError}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
          <Grid container spacing={2}>
            {/* Full Name */}
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="name"
                name="name"
                label="Full Name"
                value={formData.name}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>
            
            {/* Email */}
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="email"
                name="email"
                label="Email Address"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>
            
            {/* Password */}
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                id="password"
                name="password"
                label="Password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>
            
            {/* Confirm Password */}
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                id="confirmPassword"
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>
            
            {/* Phone */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="phone"
                name="phone"
                label="Phone Number (Optional)"
                value={formData.phone}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>
            
            {/* Toggle Address */}
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={showAddress}
                    onChange={() => setShowAddress(!showAddress)}
                    color="primary"
                  />
                }
                label="Add shipping address now"
              />
            </Grid>
            
            {/* Address Fields (conditionally displayed) */}
            {showAddress && (
              <>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="street"
                    name="address.street"
                    label="Street Address"
                    value={formData.address.street}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="city"
                    name="address.city"
                    label="City"
                    value={formData.address.city}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="state"
                    name="address.state"
                    label="State/Province"
                    value={formData.address.state}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="zipCode"
                    name="address.zipCode"
                    label="Zip/Postal Code"
                    value={formData.address.zipCode}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="country"
                    name="address.country"
                    label="Country"
                    value={formData.address.country}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </Grid>
              </>
            )}
          </Grid>
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Register'}
          </Button>
          
          <Grid container justifyContent="flex-end">
            <Grid item>
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <Typography variant="body2" color="primary">
                  Already have an account? Sign in
                </Typography>
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default Register; 