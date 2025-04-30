import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Typography,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Button,
  Box,
  CircularProgress,
  Divider,
  TextField,
  FormControl,
  FormControlLabel,
  FormLabel,
  RadioGroup,
  Radio,
  MenuItem,
  Select,
  InputLabel,
  Snackbar,
  Alert,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar
} from '@mui/material';
import axios from 'axios';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { ORDER_ENDPOINTS, USER_ENDPOINTS, API_BASE_URL } from '../constants/apiConfig';
import { formatCurrency } from '../utils/formatters';
import defaultProductImage from '../assets/default-product.jpg';
import gcashQR from '../assets/gcash-qr.png';
import paymayaQR from '../assets/paymaya-qr.png';
import { setDocumentTitle, PAGE_TITLES } from '../utils/titleUtils';

// Steps in the checkout process
const steps = ['Shipping Address', 'Delivery Method', 'Payment Method', 'Review Order'];

// Metro Manila coordinates (shop location)
const SHOP_LOCATION = {
  lat: 14.6499, // Navotas coordinates
  lng: 120.9422
};

// Define delivery options
const deliveryOptions = [
  { id: 'standard', label: 'Standard Delivery (3-5 days)', basePrice: 100 },
  { id: 'priority', label: 'Priority Delivery (1-2 days)', basePrice: 300 }
];

// Payment methods
const paymentMethods = [
  { id: 'cash_on_delivery', label: 'Cash on Delivery (Abono)' },
  { id: 'gcash', label: 'GCash' },
  { id: 'paymaya', label: 'PayMaya' }
];

// Philippine regions (simplified)
const regions = [
  'Metro Manila', 'Calabarzon', 'Central Luzon', 
  'Bicol Region', 'Western Visayas', 'Central Visayas', 
  'Eastern Visayas', 'Zamboanga Peninsula', 'Northern Mindanao',
  'Davao Region', 'Soccsksargen', 'Caraga'
];

// Cities by region (simplified)
const citiesByRegion = {
  'Metro Manila': [
    'Manila', 'Quezon City', 'Makati', 'Pasig', 'Taguig',
    'Parañaque', 'Las Piñas', 'Muntinlupa', 'Marikina', 
    'Pasay', 'Valenzuela', 'Navotas', 'Malabon', 'Caloocan',
    'San Juan', 'Pateros', 'Mandaluyong'
  ],
  'Calabarzon': [
    'Batangas City', 'Calamba', 'Lucena', 'Lipa', 'Tagaytay',
    'Antipolo', 'Bacoor', 'Dasmariñas', 'Imus', 'San Pablo'
  ],
  'Central Luzon': [
    'Angeles', 'Olongapo', 'San Fernando', 'Tarlac City', 'Malolos',
    'Cabanatuan', 'Balanga', 'Meycauayan', 'San Jose del Monte'
  ]
  // Add other regions and cities as needed
};

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, loading: cartLoading, clearCart } = useContext(CartContext);
  const { user, token, isAuthenticated, refreshToken } = useContext(AuthContext);
  
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('new');
  const [deliveryMethod, setDeliveryMethod] = useState(deliveryOptions[0].id);
  const [paymentMethod, setPaymentMethod] = useState(paymentMethods[0].id);
  const [deliveryFee, setDeliveryFee] = useState(deliveryOptions[0].basePrice);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
  const [selectedRegion, setSelectedRegion] = useState('');
  const [availableCities, setAvailableCities] = useState([]);
  
  // New state for payment details
  const [paymentDetails, setPaymentDetails] = useState({
    accountName: '',
    accountNumber: '',
    referenceNumber: '',
    dateCreated: new Date().toISOString().split('T')[0]
  });

  // Form state for new address
  const [addressForm, setAddressForm] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Philippines'
  });

  // Form validation errors
  const [formErrors, setFormErrors] = useState({});

  // Define the fetchAddresses function outside useEffect
  const fetchAddresses = async () => {
    try {
      setLoading(true);
      // Ensure the token is still valid
      const isTokenValid = refreshToken();
      if (!isTokenValid) {
        setError('Authentication required. Please log in again.');
        setLoading(false);
        navigate('/login', { state: { from: '/checkout' } });
        return;
      }
      
      // Make sure the token is set in headers for this specific request
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        }
      };
      
      console.log('Fetching user profile with token:', token.substring(0, 10) + '...');
      
      const res = await axios.get(USER_ENDPOINTS.PROFILE, config);
      
      if (res.data && res.data.address && res.data.address.street) {
        console.log('Found existing address:', res.data.address);
        setAddresses([res.data.address]);
        setSelectedAddressId('0'); // Select the first address if it exists
        
        // Also set the region for delivery fee calculation
        if (res.data.address.state) {
          setSelectedRegion(res.data.address.state);
        }
      } else {
        console.log('No address found, showing new address form');
        // If no address is found, default to new address form
        setSelectedAddressId('new');
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching addresses:', err);
      
      if (err.response && err.response.status === 403) {
        setError('Authentication required. Please log in again.');
        // Redirect to login
        setTimeout(() => {
          navigate('/login', { state: { from: '/checkout' } });
        }, 2000);
      } else {
        setError('Failed to load your saved addresses. You can create a new one below.');
        // Continue with checkout using a new address
        setSelectedAddressId('new');
      }
      
      setLoading(false);
    }
  };

  useEffect(() => {
    setDocumentTitle(PAGE_TITLES.CHECKOUT);
    
    // Redirect if not authenticated
    if (!isAuthenticated || !token) {
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }

    // Redirect if cart is empty
    if (cart.items.length === 0 && !cartLoading) {
      navigate('/cart');
      return;
    }

    // Refresh token and set in headers to fix 403 errors
    const isTokenValid = refreshToken();
    if (!isTokenValid) {
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }
    
    // Load user addresses
    fetchAddresses();
  }, [isAuthenticated, cart.items.length, cartLoading, navigate, token, refreshToken]);

  // Update available cities when region changes
  useEffect(() => {
    if (selectedRegion && citiesByRegion[selectedRegion]) {
      setAvailableCities(citiesByRegion[selectedRegion]);
      // Reset city if changing region
      setAddressForm(prev => ({ ...prev, city: '' }));
    } else {
      setAvailableCities([]);
    }
  }, [selectedRegion]);

  // Calculate delivery fee based on region and delivery method
  useEffect(() => {
    const selectedOption = deliveryOptions.find(option => option.id === deliveryMethod);
    let baseFee = selectedOption ? selectedOption.basePrice : deliveryOptions[0].basePrice;
    
    // Add distance-based fee
    if (selectedRegion === 'Metro Manila') {
      // No additional fee for Metro Manila
    } else if (selectedRegion === 'Calabarzon') {
      // Calabarzon delivery fees range from 75 to 150, depending on delivery method
      if (deliveryMethod === 'standard') {
        baseFee = 75; // Standard delivery to Calabarzon is 75 PHP
      } else {
        baseFee = 150; // Priority delivery to Calabarzon is 150 PHP
      }
    } else if (selectedRegion === 'Central Luzon') {
      baseFee += 100; // Additional fee for Central Luzon
    } else {
      baseFee += 250; // Additional fee for farther regions
    }
    
    setDeliveryFee(baseFee);
  }, [deliveryMethod, selectedRegion]);

  const handleNext = () => {
    if (activeStep === 0) {
      if (selectedAddressId === 'new') {
        // Validate new address form
        const errors = {};
        if (!addressForm.street) errors.street = 'Street address is required';
        if (!addressForm.city) errors.city = 'City is required';
        if (!addressForm.state) errors.state = 'State/Region is required';
        if (!addressForm.zipCode) errors.zipCode = 'ZIP code is required';
        
        if (Object.keys(errors).length > 0) {
          setFormErrors(errors);
          return;
        }
        
        // Create a new address (in a real app, you'd save this to the user's profile)
        const newAddress = { ...addressForm };
        setAddresses([...addresses, newAddress]);
        setSelectedAddressId(addresses.length.toString());
        
        // Save address to user profile
        const saveAddressToProfile = async () => {
          try {
            console.log('Saving new address to user profile:', newAddress);
            await axios.put(
              USER_ENDPOINTS.PROFILE,
              { address: newAddress },
              {
                headers: {
                  'Content-Type': 'application/json',
                  'x-auth-token': token
                }
              }
            );
            console.log('Address saved to profile successfully');
          } catch (err) {
            console.error('Error saving address to profile:', err);
            // Continue with checkout even if saving to profile fails
          }
        };
        
        saveAddressToProfile();
      }
    } else if (activeStep === 2) {
      // Validate payment details
      if (!validatePaymentDetails()) {
        return;
      }
    }
    
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleAddressSelect = (event) => {
    setSelectedAddressId(event.target.value);
  };

  const handleDeliveryMethodChange = (event) => {
    setDeliveryMethod(event.target.value);
  };

  const handlePaymentMethodChange = (event) => {
    setPaymentMethod(event.target.value);
  };

  const handleAddressFormChange = (event) => {
    const { name, value } = event.target;
    setAddressForm({ ...addressForm, [name]: value });
    
    // Clear validation error when field is filled
    if (formErrors[name] && value) {
      setFormErrors({ ...formErrors, [name]: undefined });
    }
  };

  const handleRegionChange = (event) => {
    setSelectedRegion(event.target.value);
    setAddressForm({ ...addressForm, state: event.target.value });
  };

  const handleCityChange = (event) => {
    setAddressForm({ ...addressForm, city: event.target.value });
  };

  const handlePaymentDetailsChange = (event) => {
    const { name, value } = event.target;
    setPaymentDetails({ ...paymentDetails, [name]: value });
  };

  const validatePaymentDetails = () => {
    if (paymentMethod !== 'gcash' && paymentMethod !== 'paymaya') {
      return true;
    }
    
    if (!paymentDetails.accountName || paymentDetails.accountName.trim() === '') {
      setNotification({
        open: true,
        message: 'Account name is required',
        severity: 'error'
      });
      return false;
    }
    
    if (!paymentDetails.accountNumber || paymentDetails.accountNumber.trim() === '') {
      setNotification({
        open: true,
        message: 'Account number is required',
        severity: 'error'
      });
      return false;
    }
    
    if (!paymentDetails.referenceNumber || paymentDetails.referenceNumber.trim() === '') {
      setNotification({
        open: true,
        message: 'Reference number is required',
        severity: 'error'
      });
      return false;
    }
    
    if (!paymentDetails.dateCreated) {
      setNotification({
        open: true,
        message: 'Payment date is required',
        severity: 'error'
      });
      return false;
    }
    
    return true;
  };

  const handlePlaceOrder = async () => {
    try {
      setLoading(true);
      
      // Refresh token to ensure it's valid
      const isTokenValid = refreshToken();
      if (!isTokenValid) {
        setNotification({
          open: true,
          message: 'Your session has expired. Please log in again.',
          severity: 'error'
        });
        setTimeout(() => {
          navigate('/login', { state: { from: '/checkout' } });
        }, 2000);
        setLoading(false);
        return;
      }
      
      // Make sure the token is set in headers for this request
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        }
      };

      // Validate payment details
      if (!validatePaymentDetails()) {
        setLoading(false);
        return;
      }

      // Get the selected shipping address
      const shippingAddress = selectedAddressId === 'new' 
        ? addressForm 
        : addresses[parseInt(selectedAddressId)];
      
      // Prepare order items
      const items = cart.items.map(item => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.price,
        size: item.size,
        color: item.color
      }));
      
      // Calculate order total
      const subtotal = cart.totalAmount;
      const total = subtotal + deliveryFee;
      
      // Map our payment method IDs to the ones expected by the API
      const apiPaymentMethod = {
        'cash_on_delivery': 'cash_on_delivery',
        'gcash': 'bank_transfer', 
        'paymaya': 'bank_transfer'
      }[paymentMethod] || 'cash_on_delivery';

      // Create the base request object
      const requestData = {
        items,
        totalAmount: total,
        shippingAddress,
        paymentMethod: apiPaymentMethod,
        deliveryFee
      };
      
      // Add payment info directly to the request object for GCash or PayMaya
      if (paymentMethod === 'gcash' || paymentMethod === 'paymaya') {
        requestData.paymentInfo = {
          accountName: paymentDetails.accountName,
          accountNumber: paymentDetails.accountNumber,
          referenceNumber: paymentDetails.referenceNumber,
          dateCreated: new Date(paymentDetails.dateCreated).toISOString()
        };
        console.log('Added payment info to request:', JSON.stringify(requestData.paymentInfo));
      }
      
      // Log the full request
      console.log('Full order request:', JSON.stringify(requestData));
      
      // Proceed with order creation
      const res = await axios.post(
        ORDER_ENDPOINTS.CREATE,
        requestData,
        config
      );
      
      console.log('Order created successfully:', res.data);
      
      // Clear the cart
      await clearCart();
      
      // Show success message and redirect to order confirmation
      setNotification({
        open: true,
        message: 'Order placed successfully!',
        severity: 'success'
      });
      
      // Navigate to order details page
      setTimeout(() => {
        navigate('/orders/' + res.data._id);
      }, 2000);
      
    } catch (err) {
      console.error('Error placing order:', err);
      let errorMessage = 'Failed to place your order. Please try again.';
      
      if (err.response) {
        if (err.response.status === 403) {
          errorMessage = 'Authentication required. Please log in again.';
          // Redirect to login
          setTimeout(() => {
            navigate('/login', { state: { from: '/checkout' } });
          }, 2000);
        } else if (err.response.data && err.response.data.msg) {
          errorMessage = err.response.data.msg;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setNotification({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
      
      setLoading(false);
    }
  };

  const getAddressDisplay = (address) => {
    if (!address) return 'No address selected';
    
    return `${address.street}, ${address.city}, ${address.state}, ${address.zipCode}, ${address.country}`;
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  // Get the selected shipping address
  const selectedAddress = selectedAddressId === 'new' 
    ? addressForm 
    : addresses[parseInt(selectedAddressId)];

  // Calculate totals
  const subtotal = cart.totalAmount || 0;
  const total = subtotal + deliveryFee;

  // Render different steps
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Shipping Address
            </Typography>
            
            {addresses.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <FormControl component="fieldset" fullWidth>
                  <FormLabel component="legend">Select a shipping address</FormLabel>
                  <RadioGroup
                    aria-label="shipping-address"
                    name="shipping-address"
                    value={selectedAddressId}
                    onChange={handleAddressSelect}
                  >
                    {addresses.map((address, index) => (
                      <FormControlLabel
                        key={index}
                        value={index.toString()}
                        control={<Radio />}
                        label={getAddressDisplay(address)}
                      />
                    ))}
                    <FormControlLabel
                      value="new"
                      control={<Radio />}
                      label="Use a new address"
                    />
                  </RadioGroup>
                </FormControl>
              </Box>
            )}
            
            {(selectedAddressId === 'new' || addresses.length === 0) && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle1">Enter a new address</Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    required
                    id="street"
                    name="street"
                    label="Street Address"
                    fullWidth
                    value={addressForm.street}
                    onChange={handleAddressFormChange}
                    error={!!formErrors.street}
                    helperText={formErrors.street}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required error={!!formErrors.state}>
                    <InputLabel id="region-label">Region</InputLabel>
                    <Select
                      labelId="region-label"
                      id="state"
                      name="state"
                      value={selectedRegion}
                      label="Region"
                      onChange={handleRegionChange}
                    >
                      {regions.map((region) => (
                        <MenuItem key={region} value={region}>
                          {region}
                        </MenuItem>
                      ))}
                    </Select>
                    {formErrors.state && (
                      <Typography variant="caption" color="error">
                        {formErrors.state}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required error={!!formErrors.city}>
                    <InputLabel id="city-label">City</InputLabel>
                    <Select
                      labelId="city-label"
                      id="city"
                      name="city"
                      value={addressForm.city}
                      label="City"
                      onChange={handleCityChange}
                      disabled={!selectedRegion || availableCities.length === 0}
                    >
                      {availableCities.map((city) => (
                        <MenuItem key={city} value={city}>
                          {city}
                        </MenuItem>
                      ))}
                    </Select>
                    {formErrors.city && (
                      <Typography variant="caption" color="error">
                        {formErrors.city}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    required
                    id="zipCode"
                    name="zipCode"
                    label="ZIP / Postal code"
                    fullWidth
                    value={addressForm.zipCode}
                    onChange={handleAddressFormChange}
                    error={!!formErrors.zipCode}
                    helperText={formErrors.zipCode}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    id="country"
                    name="country"
                    label="Country"
                    fullWidth
                    value={addressForm.country}
                    disabled
                  />
                </Grid>
              </Grid>
            )}
          </Box>
        );
        
      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Delivery Method
            </Typography>
            
            <Typography variant="subtitle2" gutterBottom>
              Shipping from: Metro Manila, Navotas
            </Typography>
            
            <FormControl component="fieldset" fullWidth>
              <RadioGroup
                aria-label="delivery-method"
                name="delivery-method"
                value={deliveryMethod}
                onChange={handleDeliveryMethodChange}
              >
                {deliveryOptions.map((option) => (
                  <FormControlLabel
                    key={option.id}
                    value={option.id}
                    control={<Radio />}
                    label={`${option.label} - ${formatCurrency(
                      option.id === deliveryMethod ? deliveryFee : option.basePrice
                    )}`}
                  />
                ))}
              </RadioGroup>
            </FormControl>
            
            <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Delivery fee calculation based on:
              </Typography>
              <Typography variant="body2">
                • Distance from shop (Metro Manila, Navotas)
              </Typography>
              <Typography variant="body2">
                • Delivery speed ({deliveryMethod === 'priority' ? 'Priority' : 'Standard'})
              </Typography>
              <Typography variant="body2">
                • Destination region ({selectedAddress?.state || selectedRegion || 'Not selected'})
              </Typography>
              {selectedRegion === 'Calabarzon' && (
                <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 'bold', mt: 1 }}>
                  Special rates for Calabarzon: ₱75 (Standard) to ₱150 (Priority)
                </Typography>
              )}
            </Box>
          </Box>
        );
        
      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Payment Method
            </Typography>
            
            <FormControl component="fieldset" fullWidth>
              <RadioGroup
                aria-label="payment-method"
                name="payment-method"
                value={paymentMethod}
                onChange={handlePaymentMethodChange}
              >
                {paymentMethods.map((method) => (
                  <FormControlLabel
                    key={method.id}
                    value={method.id}
                    control={<Radio />}
                    label={method.label}
                  />
                ))}
              </RadioGroup>
            </FormControl>
            
            {paymentMethod === 'gcash' && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                  GCash Payment Instructions:
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" paragraph>
                        • Scan the QR code to pay via GCash
                      </Typography>
                      <Typography variant="body2" paragraph>
                        • Please complete the payment within 24 hours to avoid order cancellation
                      </Typography>
                      <Typography variant="body2" paragraph>
                        • After payment, fill in the form with your payment details
                      </Typography>
                    </Box>
                    
                    <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                      Payment Details
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          required
                          fullWidth
                          label="Account Name"
                          name="accountName"
                          value={paymentDetails.accountName}
                          onChange={handlePaymentDetailsChange}
                          margin="dense"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          required
                          fullWidth
                          label="Account Number"
                          name="accountNumber"
                          value={paymentDetails.accountNumber}
                          onChange={handlePaymentDetailsChange}
                          margin="dense"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          required
                          fullWidth
                          label="Reference Number"
                          name="referenceNumber"
                          value={paymentDetails.referenceNumber}
                          onChange={handlePaymentDetailsChange}
                          margin="dense"
                          helperText="Enter the reference number from your GCash transaction"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          required
                          fullWidth
                          label="Date Created"
                          name="dateCreated"
                          type="date"
                          value={paymentDetails.dateCreated}
                          onChange={handlePaymentDetailsChange}
                          margin="dense"
                          InputLabelProps={{
                            shrink: true,
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                  
                  <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
                    <Box
                      component="img"
                      src={gcashQR}
                      alt="GCash QR Code"
                      sx={{
                        maxWidth: '100%',
                        height: 'auto',
                        maxHeight: 300,
                        border: '1px solid #eee',
                        borderRadius: 1,
                        p: 2
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>
            )}
            
            {paymentMethod === 'paymaya' && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                  PayMaya Payment Instructions:
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" paragraph>
                        • Scan the QR code to pay via PayMaya
                      </Typography>
                      <Typography variant="body2" paragraph>
                        • Please complete the payment within 24 hours to avoid order cancellation
                      </Typography>
                      <Typography variant="body2" paragraph>
                        • After payment, fill in the form with your payment details
                      </Typography>
                    </Box>
                    
                    <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                      Payment Details
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          required
                          fullWidth
                          label="Account Name"
                          name="accountName"
                          value={paymentDetails.accountName}
                          onChange={handlePaymentDetailsChange}
                          margin="dense"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          required
                          fullWidth
                          label="Account Number"
                          name="accountNumber"
                          value={paymentDetails.accountNumber}
                          onChange={handlePaymentDetailsChange}
                          margin="dense"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          required
                          fullWidth
                          label="Reference Number"
                          name="referenceNumber"
                          value={paymentDetails.referenceNumber}
                          onChange={handlePaymentDetailsChange}
                          margin="dense"
                          helperText="Enter the reference number from your PayMaya transaction"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          required
                          fullWidth
                          label="Date Created"
                          name="dateCreated"
                          type="date"
                          value={paymentDetails.dateCreated}
                          onChange={handlePaymentDetailsChange}
                          margin="dense"
                          InputLabelProps={{
                            shrink: true,
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                  
                  <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
                    <Box
                      component="img"
                      src={paymayaQR}
                      alt="PayMaya QR Code"
                      sx={{
                        maxWidth: '100%',
                        height: 'auto',
                        maxHeight: 300,
                        border: '1px solid #eee',
                        borderRadius: 1,
                        p: 2
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>
            )}
            
            {paymentMethod === 'cash_on_delivery' && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Cash on Delivery (Abono) Information:
                </Typography>
                <Typography variant="body2">
                  • Pay in cash when your order is delivered.
                </Typography>
                <Typography variant="body2">
                  • Please prepare the exact amount if possible.
                </Typography>
              </Box>
            )}
          </Box>
        );
        
      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Order Summary
            </Typography>
            
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  Shipping Address
                </Typography>
                <Typography variant="body2">
                  {getAddressDisplay(selectedAddress)}
                </Typography>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle1" gutterBottom>
                  Delivery Method
                </Typography>
                <Typography variant="body2">
                  {deliveryOptions.find(option => option.id === deliveryMethod)?.label}
                  {' - '}
                  {formatCurrency(deliveryFee)}
                </Typography>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle1" gutterBottom>
                  Payment Method
                </Typography>
                <Typography variant="body2">
                  {paymentMethods.find(method => method.id === paymentMethod)?.label}
                </Typography>
                
                {(paymentMethod === 'gcash' || paymentMethod === 'paymaya') && (
                  <Box sx={{ mt: 1, pl: 1, borderLeft: '2px solid #eee' }}>
                    {paymentDetails.referenceNumber ? (
                      <>
                        <Typography variant="body2">
                          <strong>Reference Number:</strong> {paymentDetails.referenceNumber}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Account Name:</strong> {paymentDetails.accountName}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Account Number:</strong> {paymentDetails.accountNumber}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Payment Date:</strong> {new Date(paymentDetails.dateCreated).toLocaleDateString()}
                        </Typography>
                      </>
                    ) : (
                      <Typography variant="body2" color="error">
                        Payment details incomplete - please go back and complete them
                      </Typography>
                    )}
                  </Box>
                )}
              </CardContent>
            </Card>
            
            <Typography variant="h6" gutterBottom>
              Items
            </Typography>
            
            <List sx={{ mb: 3 }}>
              {cart.items.map((item) => (
                <ListItem key={item._id} alignItems="flex-start">
                  <ListItemAvatar>
                    <Avatar 
                      src={item.product?.imageUrl || defaultProductImage}
                      variant="rounded"
                      sx={{ width: 60, height: 60, mr: 2 }} 
                    />
                  </ListItemAvatar>
                  <ListItemText
                    primary={item.product?.name}
                    secondary={
                      <>
                        <Typography component="span" variant="body2">
                          {formatCurrency(item.price)} x {item.quantity}
                        </Typography>
                        {item.size && (
                          <Typography component="span" variant="body2" sx={{ ml: 1 }}>
                            Size: {item.size}
                          </Typography>
                        )}
                        {item.color && (
                          <Typography component="span" variant="body2" sx={{ ml: 1 }}>
                            Color: {item.color}
                          </Typography>
                        )}
                      </>
                    }
                  />
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {formatCurrency(item.price * item.quantity)}
                  </Typography>
                </ListItem>
              ))}
            </List>
            
            <Box sx={{ bgcolor: 'background.paper', p: 2, borderRadius: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body1">Subtotal</Typography>
                </Grid>
                <Grid item xs={6} sx={{ textAlign: 'right' }}>
                  <Typography variant="body1">{formatCurrency(subtotal)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body1">Shipping</Typography>
                </Grid>
                <Grid item xs={6} sx={{ textAlign: 'right' }}>
                  <Typography variant="body1">{formatCurrency(deliveryFee)}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Divider />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="h6">Total</Typography>
                </Grid>
                <Grid item xs={6} sx={{ textAlign: 'right' }}>
                  <Typography variant="h6">{formatCurrency(total)}</Typography>
                </Grid>
              </Grid>
            </Box>
          </Box>
        );
        
      default:
        return 'Unknown step';
    }
  };

  if (cartLoading || (loading && activeStep === 0)) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => navigate('/cart')}>
          Return to Cart
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
      <Paper sx={{ p: { xs: 2, md: 3 } }}>
        <Typography component="h1" variant="h4" align="center" gutterBottom>
          Checkout
        </Typography>
        
        <Stepper activeStep={activeStep} sx={{ py: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        <Box sx={{ mt: 2 }}>
          {activeStep === steps.length ? (
            <Box sx={{ textAlign: 'center' }}>
              <CircularProgress sx={{ mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                Processing your order...
              </Typography>
              <Typography variant="subtitle1">
                Please wait while we complete your order.
              </Typography>
            </Box>
          ) : (
            <>
              {getStepContent(activeStep)}
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                <Button
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  variant="outlined"
                >
                  Back
                </Button>
                
                <Button
                  variant="contained"
                  color="primary"
                  onClick={activeStep === steps.length - 1 ? handlePlaceOrder : handleNext}
                  disabled={loading}
                >
                  {activeStep === steps.length - 1 ? (
                    loading ? (
                      <CircularProgress size={24} sx={{ color: 'white' }} />
                    ) : (
                      'Place Order'
                    )
                  ) : (
                    'Next'
                  )}
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Paper>
      
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Checkout; 