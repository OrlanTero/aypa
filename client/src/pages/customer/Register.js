import React, { useState, useContext, useEffect } from 'react';
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
  FormControlLabel,
  useTheme,
  alpha,
  Divider,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import { AuthContext } from '../../context/AuthContext';
import logo from '../../assets/logo.png';
import { setDocumentTitle, PAGE_TITLES } from '../../utils/titleUtils';

const Register = () => {
  const navigate = useNavigate();
  const { register, error: authError, setError } = useContext(AuthContext);
  const theme = useTheme();
  
  const [activeStep, setActiveStep] = useState(0);
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
  
  useEffect(() => {
    setDocumentTitle(PAGE_TITLES.REGISTER);
  }, []);
  
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
  
  const validateBasicInfo = () => {
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
    
    return true;
  };
  
  const validateAddressInfo = () => {
    if (showAddress) {
      const { street, city, state, zipCode, country } = formData.address;
      if (!street || !city || !state || !zipCode || !country) {
        setFormError('Please complete all address fields');
        return false;
      }
    }
    
    return true;
  };
  
  const handleNext = () => {
    setFormError(null);
    
    if (activeStep === 0) {
      if (validateBasicInfo()) {
        setActiveStep(1);
      }
    } else {
      handleSubmit();
    }
  };
  
  const handleBack = () => {
    setActiveStep(0);
  };
  
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    if (activeStep === 1 && !validateAddressInfo()) {
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
      
      await register(registrationData);
      
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
    <Box 
      sx={{ 
        minHeight: 'calc(100vh - 140px)', 
        display: 'flex', 
        alignItems: 'center',
        py: 6,
        background: theme => `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.1)}, ${alpha(theme.palette.secondary.light, 0.1)})`,
      }}
    >
      <Container maxWidth="md">
        <Paper 
          elevation={2} 
          sx={{ 
            p: { xs: 3, md: 5 }, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            borderRadius: 3,
            boxShadow: '0 8px 40px rgba(0,0,0,0.12)'
          }}
        >
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              mb: 4
            }}
          >
            <img src={logo} alt="AYPA Logo" style={{ height: 60, marginBottom: 16 }} />
            <Typography component="h1" variant="h4" fontWeight={700}>
              Create an Account
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              Join us for a better shopping experience
            </Typography>
          </Box>
          
          <Stepper activeStep={activeStep} sx={{ width: '100%', mb: 4 }}>
            <Step>
              <StepLabel>Account Information</StepLabel>
            </Step>
            <Step>
              <StepLabel>Shipping Address</StepLabel>
            </Step>
          </Stepper>
          
          {(formError || authError) && (
            <Alert severity="error" sx={{ width: '100%', mb: 3 }}>
              {formError || authError}
            </Alert>
          )}
          
          <Box component="form" onSubmit={(e) => { e.preventDefault(); handleNext(); }} sx={{ width: '100%' }}>
            {activeStep === 0 ? (
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
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      }
                    }}
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
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      }
                    }}
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
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      }
                    }}
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
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      }
                    }}
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
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      }
                    }}
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
              </Grid>
            ) : (
              <Grid container spacing={2}>
                {/* Address Fields - Only show if showAddress is true */}
                {showAddress ? (
                  <>
                    <Grid item xs={12}>
                      <TextField
                        required
                        fullWidth
                        id="street"
                        name="address.street"
                        label="Street Address"
                        value={formData.address.street}
                        onChange={handleChange}
                        disabled={loading}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                          }
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        required
                        fullWidth
                        id="city"
                        name="address.city"
                        label="City"
                        value={formData.address.city}
                        onChange={handleChange}
                        disabled={loading}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                          }
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        required
                        fullWidth
                        id="state"
                        name="address.state"
                        label="State/Province"
                        value={formData.address.state}
                        onChange={handleChange}
                        disabled={loading}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                          }
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        required
                        fullWidth
                        id="zipCode"
                        name="address.zipCode"
                        label="Postal / Zip Code"
                        value={formData.address.zipCode}
                        onChange={handleChange}
                        disabled={loading}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                          }
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        required
                        fullWidth
                        id="country"
                        name="address.country"
                        label="Country"
                        value={formData.address.country}
                        onChange={handleChange}
                        disabled={loading}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                          }
                        }}
                      />
                    </Grid>
                  </>
                ) : (
                  <Grid item xs={12}>
                    <Typography align="center" color="text.secondary">
                      You've chosen to skip adding a shipping address. You can add it later from your profile.
                    </Typography>
                  </Grid>
                )}
              </Grid>
            )}
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              {activeStep === 1 && (
                <Button
                  onClick={handleBack}
                  variant="outlined"
                  sx={{ 
                    py: 1.5,
                    px: 4,
                    borderRadius: 2,
                    borderColor: theme.palette.primary.main,
                    color: theme.palette.primary.main,
                  }}
                  disabled={loading}
                >
                  Back
                </Button>
              )}
              
              <Button
                type="submit"
                variant="contained"
                size="large"
                sx={{ 
                  py: 1.5,
                  px: 4,
                  borderRadius: 2,
                  ml: activeStep === 1 ? 'auto' : 0,
                  background: theme => `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.light} 90%)`,
                  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)',
                  '&:hover': {
                    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.2)',
                  }
                }}
                disabled={loading}
              >
                {loading ? (
                  <CircularProgress size={24} />
                ) : activeStep === 0 ? (
                  'Next'
                ) : (
                  'Create Account'
                )}
              </Button>
            </Box>
            
            <Divider sx={{ my: 4 }} />
            
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Already have an account?
              </Typography>
              <Button
                variant="outlined"
                component={Link}
                to="/login"
                sx={{ 
                  py: 1.5,
                  px: 4,
                  borderRadius: 2,
                  borderColor: theme.palette.accent.main,
                  color: theme.palette.accent.main,
                  '&:hover': {
                    borderColor: theme.palette.accent.dark,
                    backgroundColor: alpha(theme.palette.accent.main, 0.05),
                  }
                }}
              >
                Sign In
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Register; 