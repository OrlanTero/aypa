import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
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
  Card,
  CardContent,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
  IconButton,
  Avatar,
  AvatarGroup
} from '@mui/material';
import {
  Search as SearchIcon,
  LocalShipping as ShippingIcon,
  Payment as PaymentIcon,
  Check as CheckIcon,
  PendingActions as PendingIcon,
  ReceiptLong as ReceiptIcon,
  NavigateNext as NavigateNextIcon,
  ArrowBackIos as ArrowBackIcon,
  ArrowForwardIos as ArrowForwardIcon,
  Inventory as InventoryIcon
} from '@mui/icons-material';
import { ordersAPI } from '../utils/api';
import { formatDate, formatCurrency } from '../utils/format';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(5);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await ordersAPI.getMyOrders();
        setOrders(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to load orders. Please try again later.');
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Filter orders based on search term
  const filteredOrders = orders.filter(order =>
    order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.orderStatus.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const paginatedOrders = filteredOrders.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0); // Reset to first page when searching
  };

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

  // Helper function to get order status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <PendingIcon />;
      case 'processing':
        return <ReceiptIcon />;
      case 'shipped':
        return <ShippingIcon />;
      case 'delivered':
        return <CheckIcon />;
      default:
        return <ReceiptIcon />;
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

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          My Orders
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Track your order status and view your order history
        </Typography>
      </Box>

      {/* Search and Filter */}
      <Paper sx={{ p: 2, mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              variant="outlined"
              label="Search Orders"
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              placeholder="Search by Order ID or Status"
              sx={{ mb: { xs: 2, md: 0 } }}
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'flex-end' } }}>
            <Stack direction="row" spacing={1}>
              <Typography variant="body2" color="text.secondary" sx={{ alignSelf: 'center', mr: 1 }}>
                Status:
              </Typography>
              <Chip 
                label="All" 
                onClick={() => setSearchTerm('')}
                color={searchTerm === '' ? 'primary' : 'default'}
                variant={searchTerm === '' ? 'filled' : 'outlined'}
                size="small"
              />
              <Chip 
                label="Pending" 
                onClick={() => setSearchTerm('pending')}
                color={searchTerm === 'pending' ? 'warning' : 'default'}
                variant={searchTerm === 'pending' ? 'filled' : 'outlined'}
                size="small"
              />
              <Chip 
                label="Shipped" 
                onClick={() => setSearchTerm('shipped')}
                color={searchTerm === 'shipped' ? 'primary' : 'default'}
                variant={searchTerm === 'shipped' ? 'filled' : 'outlined'}
                size="small"
              />
              <Chip 
                label="Delivered" 
                onClick={() => setSearchTerm('delivered')}
                color={searchTerm === 'delivered' ? 'success' : 'default'}
                variant={searchTerm === 'delivered' ? 'filled' : 'outlined'}
                size="small"
              />
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Orders List */}
      {orders.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            You haven't placed any orders yet
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Explore our products and place your first order!
          </Typography>
          <Button
            variant="contained"
            component={RouterLink}
            to="/products"
            color="primary"
          >
            Browse Products
          </Button>
        </Paper>
      ) : filteredOrders.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            No orders match your search
          </Typography>
          <Button
            variant="outlined"
            onClick={() => setSearchTerm('')}
            sx={{ mt: 2 }}
          >
            Show All Orders
          </Button>
        </Paper>
      ) : (
        <>
          {paginatedOrders.map((order) => (
            <Card key={order._id} sx={{ mb: 3, borderRadius: 2, boxShadow: 'sm' }}>
              <CardContent sx={{ p: 0 }}>
                {/* Order Header */}
                <Box sx={{ p: 2, bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        Order #{order._id.slice(-6).toUpperCase()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Placed on {formatDate(order.createdAt)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', sm: 'flex-end' }, flexWrap: 'wrap', gap: 1 }}>
                      <Chip
                        label={order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                        color={getStatusColor(order.orderStatus)}
                        icon={getStatusIcon(order.orderStatus)}
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      <Chip
                        label={`Payment: ${order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}`}
                        color={getPaymentStatusColor(order.paymentStatus)}
                        icon={<PaymentIcon />}
                        size="small"
                      />
                    </Grid>
                  </Grid>
                </Box>

                {/* Order Summary */}
                <Box sx={{ px: 2, py: 1.5, bgcolor: 'background.default' }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={8}>
                      <Typography variant="body2" color="text.secondary">
                        Items: {order.items.length} item(s)
                      </Typography>
                      {/* Product Image Thumbnails */}
                      <AvatarGroup max={4} sx={{ my: 1 }}>
                        {order.items.map((item, idx) => (
                          item.product && item.product.imageUrls && item.product.imageUrls[0] ? (
                            <Avatar 
                              key={idx}
                              src={item.product.imageUrls[0]} 
                              alt={item.product.name}
                              sx={{ width: 40, height: 40 }}
                            />
                          ) : (
                            <Avatar 
                              key={idx}
                              sx={{ width: 40, height: 40, bgcolor: 'primary.light' }}
                            >
                              <InventoryIcon sx={{ fontSize: 20 }} />
                            </Avatar>
                          )
                        ))}
                      </AvatarGroup>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {order.items.slice(0, 2).map((item, idx) => (
                          <Box component="span" key={idx} sx={{ display: 'inline-block', mr: 1 }}>
                            {idx > 0 && ", "}
                            {item.product ? item.product.name : "Product no longer available"} ({item.quantity})
                          </Box>
                        ))}
                        {order.items.length > 2 && `, +${order.items.length - 2} more`}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Shipping to: {order.shippingAddress.city}, {order.shippingAddress.state}, {order.shippingAddress.country}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'flex-start', md: 'flex-end' } }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {formatCurrency(order.totalAmount)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {order.paymentMethod.replace('_', ' ').toUpperCase()}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>

                {/* Order Tracking Info (for shipped orders) */}
                {order.orderStatus === 'shipped' && order.deliveryInfo && (
                  <Box sx={{ p: 2, bgcolor: 'primary.light', color: 'white' }}>
                    <Grid container spacing={1} alignItems="center">
                      <Grid item>
                        <ShippingIcon />
                      </Grid>
                      <Grid item xs>
                        <Typography variant="body2" fontWeight="medium">
                          Your order is on the way
                          {order.deliveryInfo.estimatedDelivery && 
                            ` - Expected delivery by ${formatDate(order.deliveryInfo.estimatedDelivery)}`}
                        </Typography>
                        {order.deliveryInfo.trackingNumber && (
                          <Typography variant="caption">
                            Tracking #: {order.deliveryInfo.trackingNumber}
                            {order.deliveryInfo.service && ` via ${order.deliveryInfo.service}`}
                          </Typography>
                        )}
                      </Grid>
                    </Grid>
                  </Box>
                )}

                {/* Order Actions */}
                <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    component={RouterLink}
                    to={`/orders/${order._id}`}
                    variant="outlined"
                    color="primary"
                    size="small"
                    endIcon={<NavigateNextIcon />}
                  >
                    View Details
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))}

          {/* Pagination */}
          {filteredOrders.length > rowsPerPage && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton 
                  onClick={() => handleChangePage(null, page - 1)} 
                  disabled={page === 0}
                >
                  <ArrowBackIcon />
                </IconButton>
                <Typography variant="body2" sx={{ mx: 2 }}>
                  Page {page + 1} of {Math.ceil(filteredOrders.length / rowsPerPage)}
                </Typography>
                <IconButton 
                  onClick={() => handleChangePage(null, page + 1)} 
                  disabled={page >= Math.ceil(filteredOrders.length / rowsPerPage) - 1}
                >
                  <ArrowForwardIcon />
                </IconButton>
              </Box>
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default Orders; 