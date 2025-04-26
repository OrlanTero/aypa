import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  LocalShipping as ShippingIcon,
  Payment as PaymentIcon,
  Check as CheckIcon,
  CalendarToday as CalendarIcon,
  Inventory as InventoryIcon,
  LocationOn as LocationIcon,
  Receipt as ReceiptIcon,
  OpenInNew as OpenInNewIcon
} from '@mui/icons-material';
import { ordersAPI } from '../utils/api';
import { formatDate, formatCurrency } from '../utils/format';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const response = await ordersAPI.getById(id);
        setOrder(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to load order details. Please try again later.');
        console.error('Error fetching order details:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrderDetails();
    }
  }, [id]);

  // Helper function to get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'processing':
        return 'info';
      case 'shipped':
        return 'primary';
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  // Helper function to get payment status color
  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'completed':
        return 'success';
      case 'failed':
        return 'error';
      case 'refunded':
        return 'info';
      default:
        return 'default';
    }
  };

  // Get current step in the order process
  const getOrderStep = (status) => {
    switch (status) {
      case 'pending':
        return 0;
      case 'processing':
        return 1;
      case 'shipped':
        return 2;
      case 'delivered':
        return 3;
      case 'cancelled':
        return -1; // Special case
      default:
        return 0;
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !order) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/orders')}
          sx={{ mb: 2 }}
        >
          Back to Orders
        </Button>
        <Alert severity="error">
          {error || 'Order not found'}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      {/* Header with back button */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/orders')}
          sx={{ mr: 2 }}
        >
          Back to Orders
        </Button>
        <Typography variant="h4" component="h1">
          Order #{order._id.slice(-6).toUpperCase()}
        </Typography>
      </Box>

      {/* Order Status & Summary */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Order Summary
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Order Date
                </Typography>
                <Typography variant="body1">
                  {formatDate(order.createdAt)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Order Total
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {formatCurrency(order.totalAmount)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Payment Method
                </Typography>
                <Typography variant="body1">
                  {order.paymentMethod.replace('_', ' ').toUpperCase()}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Payment Status
                </Typography>
                <Chip
                  size="small"
                  label={order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                  color={getPaymentStatusColor(order.paymentStatus)}
                />
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Order Status
              </Typography>
              <Chip
                label={order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                color={getStatusColor(order.orderStatus)}
              />
            </Box>
            
            {order.orderStatus !== 'cancelled' ? (
              <Stepper activeStep={getOrderStep(order.orderStatus)} alternativeLabel>
                <Step>
                  <StepLabel>Order Placed</StepLabel>
                </Step>
                <Step>
                  <StepLabel>Processing</StepLabel>
                </Step>
                <Step>
                  <StepLabel>Shipped</StepLabel>
                </Step>
                <Step>
                  <StepLabel>Delivered</StepLabel>
                </Step>
              </Stepper>
            ) : (
              <Alert severity="error" sx={{ mt: 2 }}>
                This order has been cancelled.
              </Alert>
            )}
          </Grid>
        </Grid>
      </Paper>

      {/* Tracking Information (if shipped) */}
      {order.orderStatus === 'shipped' && order.deliveryInfo && (
        <Paper sx={{ p: 3, mb: 4, bgcolor: 'primary.light', color: 'white' }}>
          <Typography variant="h6" gutterBottom>
            Tracking Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Shipping Service
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {order.deliveryInfo.service || 'Standard Shipping'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Tracking Number
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {order.deliveryInfo.trackingNumber || 'Not available'}
                {order.deliveryInfo.trackingLink && (
                  <IconButton 
                    size="small" 
                    component="a" 
                    href={order.deliveryInfo.trackingLink} 
                    target="_blank"
                    sx={{ color: 'white', ml: 1 }}
                  >
                    <OpenInNewIcon fontSize="small" />
                  </IconButton>
                )}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Estimated Delivery
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {order.deliveryInfo.estimatedDelivery ? 
                  formatDate(order.deliveryInfo.estimatedDelivery) : 
                  'Not specified'}
              </Typography>
            </Grid>
            {order.deliveryInfo.contactNumber && (
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Contact Number
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {order.deliveryInfo.contactNumber}
                </Typography>
              </Grid>
            )}
            {order.deliveryInfo.notes && (
              <Grid item xs={12}>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Delivery Notes
                </Typography>
                <Typography variant="body1">
                  {order.deliveryInfo.notes}
                </Typography>
              </Grid>
            )}
          </Grid>
        </Paper>
      )}

      <Grid container spacing={4}>
        {/* Order Items */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 0, overflow: 'hidden' }}>
            <Box sx={{ p: 2, bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="h6">
                Order Items
              </Typography>
            </Box>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'background.default' }}>
                    <TableCell>Product</TableCell>
                    <TableCell align="center">Price</TableCell>
                    <TableCell align="center">Quantity</TableCell>
                    <TableCell align="right">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {order.items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box sx={{ mr: 2 }}>
                            {item.product && item.product.imageUrls && item.product.imageUrls[0] ? (
                              <Avatar 
                                variant="rounded" 
                                src={item.product.imageUrls[0]} 
                                alt={item.product.name || 'Product Image'}
                                sx={{ width: 60, height: 60 }}
                              />
                            ) : (
                              <Avatar 
                                variant="rounded" 
                                sx={{ width: 60, height: 60, bgcolor: 'primary.light' }}
                              >
                                <InventoryIcon />
                              </Avatar>
                            )}
                          </Box>
                          <Box>
                            <Typography 
                              variant="body1" 
                              fontWeight="medium"
                              component={item.product && item.product._id ? RouterLink : 'span'}
                              to={item.product && item.product._id ? `/products/${item.product._id}` : undefined}
                              sx={item.product && item.product._id ? {
                                color: 'primary.main',
                                textDecoration: 'none',
                                '&:hover': {
                                  textDecoration: 'underline'
                                }
                              } : {}}
                            >
                              {item.product ? item.product.name : 'Product No Longer Available'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {item.color && `Color: ${item.color}`}
                              {item.color && item.size && ' | '}
                              {item.size && `Size: ${item.size}`}
                              {(item.color || item.size) && item.product?.category && ' | '}
                              {item.product?.category && `Category: ${item.product.category}`}
                            </Typography>
                            {item.product?.brand && (
                              <Typography variant="body2" color="text.secondary">
                                Brand: {item.product.brand}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        {formatCurrency(item.price)}
                      </TableCell>
                      <TableCell align="center">
                        {item.quantity}
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(item.price * item.quantity)}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={2} />
                    <TableCell align="right">
                      <Typography variant="body1" fontWeight="bold">
                        Total
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body1" fontWeight="bold">
                        {formatCurrency(order.totalAmount)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Shipping and Payment Info */}
        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
            {/* Shipping Address */}
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LocationIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Shipping Address
                </Typography>
              </Box>
              <Typography variant="body1">
                {order.shippingAddress.street}
              </Typography>
              <Typography variant="body1">
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
              </Typography>
              <Typography variant="body1" gutterBottom>
                {order.shippingAddress.country}
              </Typography>
            </Paper>
            
            {/* Payment Information */}
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PaymentIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Payment Information
                </Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Method
                  </Typography>
                  <Typography variant="body1">
                    {order.paymentMethod.replace('_', ' ').toUpperCase()}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Status
                  </Typography>
                  <Typography variant="body1">
                    {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                  </Typography>
                </Grid>
                {order.paymentInfo && (
                  <>
                    {order.paymentInfo.accountName && (
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">
                          Account Name
                        </Typography>
                        <Typography variant="body1">
                          {order.paymentInfo.accountName}
                        </Typography>
                      </Grid>
                    )}
                    {order.paymentInfo.accountNumber && (
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">
                          Account Number
                        </Typography>
                        <Typography variant="body1">
                          {order.paymentInfo.accountNumber}
                        </Typography>
                      </Grid>
                    )}
                    {order.paymentInfo.referenceNumber && (
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">
                          Reference Number
                        </Typography>
                        <Typography variant="body1">
                          {order.paymentInfo.referenceNumber}
                        </Typography>
                      </Grid>
                    )}
                    {order.paymentInfo.dateCreated && (
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">
                          Payment Date
                        </Typography>
                        <Typography variant="body1">
                          {formatDate(order.paymentInfo.dateCreated)}
                        </Typography>
                      </Grid>
                    )}
                  </>
                )}
              </Grid>
            </Paper>

            {/* Need Help? */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Need Help?
              </Typography>
              <Typography variant="body2" paragraph>
                If you have any questions about your order, please contact our customer support team.
              </Typography>
              <Button 
                variant="outlined" 
                color="primary" 
                fullWidth
                component={RouterLink}
                to="/contact"
              >
                Contact Support
              </Button>
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
};

export default OrderDetail; 