import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Container, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Grid,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  Tooltip,
  CircularProgress,
  Alert,
  InputAdornment,
  useTheme,
  alpha,
  Stack,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Visibility as ViewIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Receipt as ReceiptIcon,
  LocalShipping as ShippingIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as VerifiedIcon,
  Cancel as RejectedIcon,
  Payment as PaymentIcon,
  LocalShipping as DeliveryIcon
} from '@mui/icons-material';
import axios from 'axios';
import { ORDER_ENDPOINTS } from '../../constants/apiConfig';
import { formatCurrency, formatDate } from '../../utils/formatters';

// Order status color mapping
const getStatusColor = (status) => {
  if (!status) return 'default';
  
  const statusMap = {
    'pending': 'warning',
    'processing': 'info',
    'shipped': 'primary',
    'delivered': 'success',
    'cancelled': 'error'
  };
  return statusMap[status.toLowerCase()] || 'default';
};

// Payment status color mapping
const getPaymentStatusColor = (status) => {
  if (!status) return 'default';
  
  const statusMap = {
    'pending': 'warning',
    'completed': 'success',
    'failed': 'error',
    'refunded': 'info'
  };
  return statusMap[status.toLowerCase()] || 'default';
};

// Payment verification status color mapping
const getVerificationStatusColor = (status) => {
  if (!status) return 'default';
  
  const statusMap = {
    'pending': 'warning',
    'verified': 'success',
    'rejected': 'error'
  };
  return statusMap[status.toLowerCase()] || 'default';
};

// Delivery service options
const deliveryServices = [
  'Grab', 
  'LBC', 
  'LalaMove', 
  'JRS', 
  'J&T', 
  'Other'
];

const Orders = () => {
  const theme = useTheme();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [statusUpdateDialogOpen, setStatusUpdateDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusUpdateSuccess, setStatusUpdateSuccess] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    searchQuery: ''
  });
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    revenue: 0
  });
  
  // New state variables for payment verification and delivery
  const [activeTab, setActiveTab] = useState(0);
  const [paymentVerificationDialogOpen, setPaymentVerificationDialogOpen] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState('pending');
  const [verificationNotes, setVerificationNotes] = useState('');
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  
  const [deliveryDialogOpen, setDeliveryDialogOpen] = useState(false);
  const [deliveryInfo, setDeliveryInfo] = useState({
    service: '',
    driverName: '',
    contactNumber: '',
    trackingNumber: '',
    trackingLink: '',
    estimatedDelivery: '',
    notes: ''
  });
  const [deliveryLoading, setDeliveryLoading] = useState(false);
  const [deliverySuccess, setDeliverySuccess] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(ORDER_ENDPOINTS.ALL);
      setOrders(response.data);
      calculateStats(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders. Please try again.');
      // Use mock data for development
      const mockOrders = generateMockOrders();
      setOrders(mockOrders);
      calculateStats(mockOrders);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (orderData) => {
    const newStats = {
      total: orderData.length,
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      revenue: 0
    };

    orderData.forEach(order => {
      if (order.orderStatus) {
        const status = order.orderStatus.toLowerCase();
        if (newStats.hasOwnProperty(status)) {
          newStats[status] += 1;
        }
      }
      
      if (order.orderStatus !== 'cancelled') {
        newStats.revenue += Number(order.totalAmount) || 0;
      }
    });

    setStats(newStats);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setViewDialogOpen(true);
  };

  const handleCloseViewDialog = () => {
    setViewDialogOpen(false);
  };

  const handleOpenStatusDialog = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.orderStatus || 'pending');
    setStatusUpdateDialogOpen(true);
  };

  const handleCloseStatusDialog = () => {
    setStatusUpdateDialogOpen(false);
    setStatusUpdateSuccess(false);
  };

  const handleStatusChange = (event) => {
    setNewStatus(event.target.value);
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder || !newStatus) return;

    try {
      setStatusLoading(true);
      await axios.put(ORDER_ENDPOINTS.UPDATE_STATUS(selectedOrder._id), { orderStatus: newStatus });
      
      // Update the order in the state
      setOrders(orders.map(order => 
        order._id === selectedOrder._id ? { ...order, orderStatus: newStatus } : order
      ));
      
      setStatusUpdateSuccess(true);
      calculateStats(orders.map(order => 
        order._id === selectedOrder._id ? { ...order, orderStatus: newStatus } : order
      ));
      
      // Close dialog after short delay
      setTimeout(() => {
        setStatusUpdateDialogOpen(false);
        setStatusUpdateSuccess(false);
      }, 1500);
    } catch (err) {
      console.error('Error updating order status:', err);
      setError('Failed to update order status.');
    } finally {
      setStatusLoading(false);
    }
  };

  // Handle tab change in order detail dialog
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Open payment verification dialog
  const handleOpenPaymentVerification = () => {
    if (!selectedOrder) return;
    
    // Initialize with existing verification status if available
    if (selectedOrder.paymentInfo && selectedOrder.paymentInfo.verificationStatus) {
      setVerificationStatus(selectedOrder.paymentInfo.verificationStatus);
      setVerificationNotes(selectedOrder.paymentInfo.verificationNotes || '');
    } else {
      setVerificationStatus('pending');
      setVerificationNotes('');
    }
    
    setPaymentVerificationDialogOpen(true);
  };

  // Close payment verification dialog
  const handleClosePaymentVerification = () => {
    setPaymentVerificationDialogOpen(false);
    setVerificationSuccess(false);
  };

  // Handle verification status change
  const handleVerificationStatusChange = (event) => {
    setVerificationStatus(event.target.value);
  };

  // Handle verification notes change
  const handleVerificationNotesChange = (event) => {
    setVerificationNotes(event.target.value);
  };

  // Submit payment verification
  const handleVerifyPayment = async () => {
    if (!selectedOrder) return;

    try {
      setVerificationLoading(true);
      
      const response = await axios.put(
        ORDER_ENDPOINTS.VERIFY_PAYMENT(selectedOrder._id), 
        { 
          verificationStatus,
          verificationNotes
        }
      );
      
      // Update the order in the state
      setOrders(orders.map(order => 
        order._id === selectedOrder._id ? response.data : order
      ));
      
      // Update the selected order
      setSelectedOrder(response.data);
      
      setVerificationSuccess(true);
      
      // Close dialog after short delay
      setTimeout(() => {
        setPaymentVerificationDialogOpen(false);
        setVerificationSuccess(false);
      }, 1500);
    } catch (err) {
      console.error('Error verifying payment:', err);
      setError('Failed to verify payment.');
    } finally {
      setVerificationLoading(false);
    }
  };

  // Open delivery information dialog
  const handleOpenDeliveryDialog = () => {
    if (!selectedOrder) return;
    
    // Initialize with existing delivery info if available
    if (selectedOrder.deliveryInfo) {
      setDeliveryInfo({
        service: selectedOrder.deliveryInfo.service || '',
        driverName: selectedOrder.deliveryInfo.driverName || '',
        contactNumber: selectedOrder.deliveryInfo.contactNumber || '',
        trackingNumber: selectedOrder.deliveryInfo.trackingNumber || '',
        trackingLink: selectedOrder.deliveryInfo.trackingLink || '',
        estimatedDelivery: selectedOrder.deliveryInfo.estimatedDelivery 
          ? new Date(selectedOrder.deliveryInfo.estimatedDelivery).toISOString().split('T')[0]
          : '',
        notes: selectedOrder.deliveryInfo.notes || ''
      });
    } else {
      setDeliveryInfo({
        service: '',
        driverName: '',
        contactNumber: '',
        trackingNumber: '',
        trackingLink: '',
        estimatedDelivery: '',
        notes: ''
      });
    }
    
    setDeliveryDialogOpen(true);
  };

  // Close delivery dialog
  const handleCloseDeliveryDialog = () => {
    setDeliveryDialogOpen(false);
    setDeliverySuccess(false);
  };

  // Handle delivery info change
  const handleDeliveryInfoChange = (event) => {
    const { name, value } = event.target;
    setDeliveryInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Submit delivery information
  const handleUpdateDelivery = async () => {
    if (!selectedOrder) return;

    try {
      setDeliveryLoading(true);
      
      const response = await axios.put(
        ORDER_ENDPOINTS.UPDATE_DELIVERY(selectedOrder._id), 
        deliveryInfo
      );
      
      // Update the order in the state
      setOrders(orders.map(order => 
        order._id === selectedOrder._id ? response.data : order
      ));
      
      // Update the selected order
      setSelectedOrder(response.data);
      
      setDeliverySuccess(true);
      
      // Close dialog after short delay
      setTimeout(() => {
        setDeliveryDialogOpen(false);
        setDeliverySuccess(false);
      }, 1500);
    } catch (err) {
      console.error('Error updating delivery information:', err);
      setError('Failed to update delivery information.');
    } finally {
      setDeliveryLoading(false);
    }
  };

  const handleSearchChange = (event) => {
    setFilters({
      ...filters,
      searchQuery: event.target.value
    });
  };

  const handleStatusFilterChange = (event) => {
    setFilters({
      ...filters,
      status: event.target.value
    });
  };

  const handleFilterToggle = () => {
    setFilterDialogOpen(!filterDialogOpen);
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = filters.status === 'all' || (order.orderStatus && order.orderStatus.toLowerCase() === filters.status);
    const matchesSearch = 
      filters.searchQuery === '' || 
      (order._id && order._id.toLowerCase().includes(filters.searchQuery.toLowerCase())) ||
      (order.user && order.user.name && order.user.name.toLowerCase().includes(filters.searchQuery.toLowerCase())) ||
      (order.shippingAddress && order.shippingAddress.street && order.shippingAddress.street.toLowerCase().includes(filters.searchQuery.toLowerCase()));
    
    return matchesStatus && matchesSearch;
  });

  // Generate mock orders for development
  const generateMockOrders = () => {
    const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    const paymentMethods = ['credit_card', 'paypal', 'bank_transfer'];
    
    return Array(25).fill().map((_, index) => ({
      _id: `ORD${100000 + index}`,
      user: {
        _id: `USR${200000 + index % 10}`,
        name: `Customer ${index % 10 + 1}`,
        email: `customer${index % 10 + 1}@example.com`
      },
      items: Array(Math.floor(Math.random() * 3) + 1).fill().map((_, itemIndex) => ({
        product: {
          _id: `PROD${300000 + itemIndex}`,
          name: `Product ${itemIndex + 1}`
        },
        quantity: Math.floor(Math.random() * 3) + 1,
        price: (Math.random() * 1000 + 500).toFixed(2),
        size: ['S', 'M', 'L', 'XL'][Math.floor(Math.random() * 4)],
        color: ['Black', 'White', 'Red', 'Blue'][Math.floor(Math.random() * 4)]
      })),
      shippingAddress: {
        street: `${Math.floor(Math.random() * 1000) + 1} Main St, City ${index % 5 + 1}`,
        city: `City ${index % 5 + 1}`,
        state: `Region ${index % 3 + 1}`,
        zipCode: `${10000 + index * 10}`,
        country: 'Philippines'
      },
      paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
      paymentInfo: Math.random() > 0.3 ? {
        accountName: `Account ${index % 5 + 1}`,
        accountNumber: `ACC${500000 + index}`,
        referenceNumber: `REF${600000 + index}`,
        dateCreated: new Date(Date.now() - Math.random() * 10000000).toISOString(),
        verificationStatus: ['pending', 'verified', 'rejected'][Math.floor(Math.random() * 3)]
      } : null,
      paymentStatus: ['pending', 'completed', 'failed'][Math.floor(Math.random() * 3)],
      orderStatus: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'][Math.floor(Math.random() * 5)],
      totalAmount: (Math.random() * 2000 + 500).toFixed(2),
      createdAt: new Date(Date.now() - Math.random() * 15000000).toISOString(),
      updatedAt: new Date(Date.now() - Math.random() * 1000000).toISOString(),
    }));
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: 3, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Order Management
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          View and manage all customer orders
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Total Orders
                </Typography>
                <Typography variant="h4" sx={{ mt: 1, fontWeight: 'bold' }}>
                  {stats.total}
                </Typography>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    color: theme.palette.primary.main 
                  }}
                >
                  <ReceiptIcon sx={{ ml: 1, fontSize: 20 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', bgcolor: alpha(theme.palette.secondary.main, 0.05) }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Total Revenue
                </Typography>
                <Typography variant="h4" sx={{ mt: 1, fontWeight: 'bold' }}>
                  {formatCurrency(stats.revenue)}
                </Typography>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    color: theme.palette.secondary.main 
                  }}
                >
                  <ReceiptIcon sx={{ ml: 1, fontSize: 20 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', bgcolor: alpha(theme.palette.warning.main, 0.05) }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Pending
                </Typography>
                <Typography variant="h4" sx={{ mt: 1, fontWeight: 'bold' }}>
                  {stats.pending || 0}
                </Typography>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    color: theme.palette.warning.main 
                  }}
                >
                  <ReceiptIcon sx={{ ml: 1, fontSize: 20 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', bgcolor: alpha(theme.palette.info.main, 0.05) }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Shipped
                </Typography>
                <Typography variant="h4" sx={{ mt: 1, fontWeight: 'bold' }}>
                  {stats.shipped || 0}
                </Typography>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    color: theme.palette.info.main 
                  }}
                >
                  <ShippingIcon sx={{ ml: 1, fontSize: 20 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Filter and Search */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <TextField
            size="small"
            placeholder="Search orders..."
            value={filters.searchQuery}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ flexGrow: 1, maxWidth: { xs: '100%', sm: 300 } }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="status-filter-label">Status</InputLabel>
            <Select
              labelId="status-filter-label"
              value={filters.status}
              label="Status"
              onChange={handleStatusFilterChange}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="processing">Processing</MenuItem>
              <MenuItem value="shipped">Shipped</MenuItem>
              <MenuItem value="delivered">Delivered</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
          <Button 
            variant="outlined" 
            color="primary" 
            startIcon={<RefreshIcon />}
            onClick={fetchOrders}
            sx={{ ml: 'auto' }}
          >
            Refresh
          </Button>
        </Box>
      </Paper>

      {/* Orders Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
      ) : (
        <Paper>
          <TableContainer>
            <Table sx={{ minWidth: 800 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Order ID</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Payment</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredOrders
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((order) => (
                    <TableRow key={order._id} hover>
                      <TableCell 
                        component="th" 
                        scope="row"
                        sx={{ fontWeight: 'medium' }}
                      >
                        {order._id}
                      </TableCell>
                      <TableCell>{order.user.name}</TableCell>
                      <TableCell>{formatDate(order.createdAt)}</TableCell>
                      <TableCell>{formatCurrency(order.totalAmount)}</TableCell>
                      <TableCell>
                        <Chip 
                          label={order.orderStatus ? order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1) : 'Unknown'} 
                          color={getStatusColor(order.orderStatus)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={order.paymentStatus ? order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1) : 'Pending'} 
                          color={getPaymentStatusColor(order.paymentStatus)}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                          <Tooltip title="View Details">
                            <IconButton 
                              size="small" 
                              onClick={() => handleViewOrder(order)}
                              color="primary"
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                {filteredOrders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                      <Typography variant="body1" color="text.secondary">
                        No orders found
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={filteredOrders.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </Paper>
      )}

      {/* Order Detail Dialog */}
      {selectedOrder && (
        <Dialog 
          open={viewDialogOpen} 
          onClose={handleCloseViewDialog}
          fullWidth
          maxWidth="md"
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h6">
                Order Details - {selectedOrder._id}
              </Typography>
              <Chip 
                label={selectedOrder.orderStatus ? selectedOrder.orderStatus.charAt(0).toUpperCase() + selectedOrder.orderStatus.slice(1) : 'Unknown'} 
                color={getStatusColor(selectedOrder.orderStatus)}
                size="small"
              />
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab label="Order Info" />
              <Tab label="Payment Details" />
              <Tab label="Delivery Info" />
            </Tabs>

            {activeTab === 0 && (
            <Grid container spacing={3}>
              {/* Order Information */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Order Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2">
                      <strong>Order ID:</strong> {selectedOrder._id || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2">
                      <strong>Date:</strong> {selectedOrder.createdAt ? formatDate(selectedOrder.createdAt) : 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2">
                      <strong>Payment Method:</strong> {selectedOrder.paymentMethod || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2">
                      <strong>Payment Status:</strong> {selectedOrder.paymentStatus ? selectedOrder.paymentStatus.charAt(0).toUpperCase() + selectedOrder.paymentStatus.slice(1) : 'Pending'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2">
                      <strong>Delivery Status:</strong> {selectedOrder.isDelivered ? `Delivered on ${formatDate(selectedOrder.deliveredAt)}` : 'Not Delivered'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2">
                      <strong>Status:</strong> {selectedOrder.orderStatus ? selectedOrder.orderStatus.charAt(0).toUpperCase() + selectedOrder.orderStatus.slice(1) : 'Processing'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2">
                      <strong>Total:</strong> {formatCurrency(selectedOrder.totalAmount)}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>

              {/* Customer Info */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Customer Details
                </Typography>
                <Stack spacing={1}>
                  <Typography variant="body2">
                    <strong>Name:</strong> {selectedOrder.user && selectedOrder.user.name || 'N/A'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Email:</strong> {selectedOrder.user && selectedOrder.user.email || 'N/A'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Phone:</strong> {selectedOrder.user && selectedOrder.user.phone || 'N/A'}
                  </Typography>
                </Stack>
              </Grid>
              
              {/* Shipping Address */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Shipping Address
                </Typography>
                {selectedOrder.shippingAddress ? (
                  <Stack spacing={1}>
                    <Typography variant="body2">
                      <strong>Address:</strong> {selectedOrder.shippingAddress.street || 'N/A'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>City:</strong> {selectedOrder.shippingAddress.city || 'N/A'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>State:</strong> {selectedOrder.shippingAddress.state || 'N/A'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Zip Code:</strong> {selectedOrder.shippingAddress.zipCode || 'N/A'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Country:</strong> {selectedOrder.shippingAddress.country || 'N/A'}
                    </Typography>
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No shipping address available
                  </Typography>
                )}
              </Grid>

              {/* Order Items */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Order Items
                </Typography>
                {selectedOrder.items && selectedOrder.items.length > 0 ? (
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Image</TableCell>
                          <TableCell>Product</TableCell>
                          <TableCell>Size</TableCell>
                          <TableCell>Color</TableCell>
                          <TableCell align="right">Price</TableCell>
                          <TableCell align="right">Quantity</TableCell>
                          <TableCell align="right">Total</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedOrder.items.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <Box
                                component="img"
                                src="/placeholder.png"
                                alt="Product"
                                sx={{ width: 50, height: 50, objectFit: 'cover' }}
                              />
                            </TableCell>
                            <TableCell>{item.product ? item.product.name || 'Product' : 'Product'}</TableCell>
                            <TableCell>{item.size || 'N/A'}</TableCell>
                            <TableCell>{item.color || 'N/A'}</TableCell>
                            <TableCell align="right">{formatCurrency(item.price)}</TableCell>
                            <TableCell align="right">{item.quantity}</TableCell>
                            <TableCell align="right">{formatCurrency(item.price * item.quantity)}</TableCell>
                          </TableRow>
                        ))}
                        <TableRow>
                          <TableCell colSpan={5} />
                          <TableCell align="right">
                            <Typography variant="subtitle2">Total:</Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="subtitle2">
                              {formatCurrency(selectedOrder.totalAmount)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      No items in this order
                    </Typography>
                  </Paper>
                )}
              </Grid>
            </Grid>
            )}

            {activeTab === 1 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6">Payment Information</Typography>
                      {selectedOrder.paymentInfo && selectedOrder.paymentInfo.verificationStatus && (
                        <Chip 
                          label={selectedOrder.paymentInfo.verificationStatus.charAt(0).toUpperCase() + selectedOrder.paymentInfo.verificationStatus.slice(1)}
                          color={getVerificationStatusColor(selectedOrder.paymentInfo.verificationStatus)}
                          icon={selectedOrder.paymentInfo.verificationStatus === 'verified' ? <VerifiedIcon /> : 
                                 selectedOrder.paymentInfo.verificationStatus === 'rejected' ? <RejectedIcon /> : null}
                        />
                      )}
                    </Box>

                    {selectedOrder.paymentMethod === 'bank_transfer' || selectedOrder.paymentMethod === 'paypal' ? (
                      <>
                        {selectedOrder.paymentInfo ? (
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="body2">
                                <strong>Account Name:</strong> {selectedOrder.paymentInfo.accountName || 'N/A'}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="body2">
                                <strong>Account Number:</strong> {selectedOrder.paymentInfo.accountNumber || 'N/A'}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="body2">
                                <strong>Reference Number:</strong> {selectedOrder.paymentInfo.referenceNumber || 'N/A'}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="body2">
                                <strong>Payment Date:</strong> {selectedOrder.paymentInfo.dateCreated ? formatDate(selectedOrder.paymentInfo.dateCreated) : 'N/A'}
                              </Typography>
                            </Grid>
                            
                            {selectedOrder.paymentInfo.verificationStatus !== 'pending' && (
                              <>
                                <Grid item xs={12}>
                                  <Divider sx={{ my: 1 }} />
                                  <Typography variant="subtitle2">Verification Details</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <Typography variant="body2">
                                    <strong>Verified By:</strong> {selectedOrder.paymentInfo.verifiedBy || 'N/A'}
                                  </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <Typography variant="body2">
                                    <strong>Verified On:</strong> {selectedOrder.paymentInfo.verifiedAt ? formatDate(selectedOrder.paymentInfo.verifiedAt) : 'N/A'}
                                  </Typography>
                                </Grid>
                                <Grid item xs={12}>
                                  <Typography variant="body2">
                                    <strong>Notes:</strong> {selectedOrder.paymentInfo.verificationNotes || 'No notes provided'}
                                  </Typography>
                                </Grid>
                              </>
                            )}
                          </Grid>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No payment information provided by the customer.
                          </Typography>
                        )}
                      </>
                    ) : (
                      <Typography variant="body2">
                        {selectedOrder.paymentMethod === 'cash_on_delivery' 
                          ? 'This order uses Cash on Delivery. Payment will be collected upon delivery.'
                          : `Payment method: ${selectedOrder.paymentMethod}`
                        }
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            )}

            {activeTab === 2 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Delivery Information</Typography>
                    
                    {selectedOrder.deliveryInfo ? (
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2">
                            <strong>Delivery Service:</strong> {selectedOrder.deliveryInfo.service || 'Not assigned'}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2">
                            <strong>Driver Name:</strong> {selectedOrder.deliveryInfo.driverName || 'Not assigned'}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2">
                            <strong>Contact Number:</strong> {selectedOrder.deliveryInfo.contactNumber || 'Not provided'}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2">
                            <strong>Tracking Number:</strong> {selectedOrder.deliveryInfo.trackingNumber || 'Not available'}
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="body2">
                            <strong>Tracking Link:</strong> {
                              selectedOrder.deliveryInfo.trackingLink ? (
                                <a href={selectedOrder.deliveryInfo.trackingLink} target="_blank" rel="noopener noreferrer">
                                  {selectedOrder.deliveryInfo.trackingLink}
                                </a>
                              ) : 'Not available'
                            }
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2">
                            <strong>Estimated Delivery:</strong> {
                              selectedOrder.deliveryInfo.estimatedDelivery 
                                ? formatDate(selectedOrder.deliveryInfo.estimatedDelivery) 
                                : 'Not specified'
                            }
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2">
                            <strong>Assigned:</strong> {
                              selectedOrder.deliveryInfo.assignedAt 
                                ? formatDate(selectedOrder.deliveryInfo.assignedAt) 
                                : 'Not assigned'
                            }
                          </Typography>
                        </Grid>
                        {selectedOrder.deliveryInfo.notes && (
                          <Grid item xs={12}>
                            <Typography variant="body2">
                              <strong>Notes:</strong> {selectedOrder.deliveryInfo.notes}
                            </Typography>
                          </Grid>
                        )}
                      </Grid>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No delivery information has been assigned to this order yet.
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            )}
          </DialogContent>
          <DialogActions>
            {activeTab === 0 && (
              <Button 
                variant="outlined" 
                color="primary"
                onClick={() => {
                  handleCloseViewDialog();
                  handleOpenStatusDialog(selectedOrder);
                }}
              >
                Update Status
              </Button>
            )}
            {activeTab === 1 && selectedOrder.paymentMethod !== 'cash_on_delivery' && (
              <Button 
                variant="outlined" 
                color="primary"
                startIcon={<PaymentIcon />}
                onClick={handleOpenPaymentVerification}
              >
                Verify Payment
              </Button>
            )}
            {activeTab === 2 && (
              <Button 
                variant="outlined" 
                color="primary"
                startIcon={<DeliveryIcon />}
                onClick={handleOpenDeliveryDialog}
              >
                {selectedOrder.deliveryInfo ? 'Update Delivery Info' : 'Add Delivery Info'}
              </Button>
            )}
            <Button onClick={handleCloseViewDialog}>Close</Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Update Status Dialog */}
      {selectedOrder && (
        <Dialog
          open={statusUpdateDialogOpen}
          onClose={handleCloseStatusDialog}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle>Update Order Status</DialogTitle>
          <DialogContent>
            {statusUpdateSuccess ? (
              <Alert severity="success" sx={{ mt: 1 }}>
                Status updated successfully!
              </Alert>
            ) : (
              <FormControl fullWidth sx={{ mt: 1 }}>
                <InputLabel id="status-select-label">Status</InputLabel>
                <Select
                  labelId="status-select-label"
                  value={newStatus}
                  label="Status"
                  onChange={handleStatusChange}
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="processing">Processing</MenuItem>
                  <MenuItem value="shipped">Shipped</MenuItem>
                  <MenuItem value="delivered">Delivered</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseStatusDialog}>Cancel</Button>
            <Button 
              onClick={handleUpdateStatus} 
              variant="contained" 
              color="primary"
              disabled={statusLoading || statusUpdateSuccess || newStatus === selectedOrder.status}
            >
              {statusLoading ? <CircularProgress size={24} /> : 'Update'}
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Payment Verification Dialog */}
      {selectedOrder && (
        <Dialog
          open={paymentVerificationDialogOpen}
          onClose={handleClosePaymentVerification}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Verify Payment</DialogTitle>
          <DialogContent>
            {verificationSuccess ? (
              <Alert severity="success" sx={{ mt: 1 }}>
                Payment verification updated successfully!
              </Alert>
            ) : (
              <Box sx={{ mt: 1 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>
                      Payment Information
                    </Typography>
                    {selectedOrder.paymentInfo ? (
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2">
                            <strong>Account Name:</strong> {selectedOrder.paymentInfo.accountName || 'N/A'}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2">
                            <strong>Account Number:</strong> {selectedOrder.paymentInfo.accountNumber || 'N/A'}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2">
                            <strong>Reference Number:</strong> {selectedOrder.paymentInfo.referenceNumber || 'N/A'}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2">
                            <strong>Payment Date:</strong> {selectedOrder.paymentInfo.dateCreated ? formatDate(selectedOrder.paymentInfo.dateCreated) : 'N/A'}
                          </Typography>
                        </Grid>
                      </Grid>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No payment information provided by the customer.
                      </Typography>
                    )}
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="subtitle2" gutterBottom>
                      Verification
                    </Typography>
                    
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel id="verification-status-label">Verification Status</InputLabel>
                      <Select
                        labelId="verification-status-label"
                        value={verificationStatus}
                        label="Verification Status"
                        onChange={handleVerificationStatusChange}
                      >
                        <MenuItem value="verified">Verified</MenuItem>
                        <MenuItem value="rejected">Rejected</MenuItem>
                        <MenuItem value="pending">Pending</MenuItem>
                      </Select>
                    </FormControl>
                    
                    <TextField
                      fullWidth
                      label="Verification Notes"
                      multiline
                      rows={3}
                      value={verificationNotes}
                      onChange={handleVerificationNotesChange}
                      placeholder="Enter any notes about the payment verification"
                    />
                  </Grid>
                </Grid>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClosePaymentVerification}>Cancel</Button>
            <Button 
              onClick={handleVerifyPayment} 
              variant="contained" 
              color="primary"
              disabled={verificationLoading || verificationSuccess}
            >
              {verificationLoading ? <CircularProgress size={24} /> : 'Update Verification'}
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Delivery Information Dialog */}
      {selectedOrder && (
        <Dialog
          open={deliveryDialogOpen}
          onClose={handleCloseDeliveryDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {selectedOrder.deliveryInfo ? 'Update Delivery Information' : 'Add Delivery Information'}
          </DialogTitle>
          <DialogContent>
            {deliverySuccess ? (
              <Alert severity="success" sx={{ mt: 1 }}>
                Delivery information updated successfully!
              </Alert>
            ) : (
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel id="delivery-service-label">Delivery Service</InputLabel>
                    <Select
                      labelId="delivery-service-label"
                      name="service"
                      value={deliveryInfo.service}
                      label="Delivery Service"
                      onChange={handleDeliveryInfoChange}
                    >
                      {deliveryServices.map(service => (
                        <MenuItem key={service} value={service}>{service}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Driver Name"
                    name="driverName"
                    value={deliveryInfo.driverName}
                    onChange={handleDeliveryInfoChange}
                    placeholder="Enter driver's name"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Contact Number"
                    name="contactNumber"
                    value={deliveryInfo.contactNumber}
                    onChange={handleDeliveryInfoChange}
                    placeholder="Enter contact number"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    label="Tracking Number"
                    name="trackingNumber"
                    value={deliveryInfo.trackingNumber}
                    onChange={handleDeliveryInfoChange}
                    placeholder="Enter tracking number"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Tracking Link"
                    name="trackingLink"
                    value={deliveryInfo.trackingLink}
                    onChange={handleDeliveryInfoChange}
                    placeholder="Enter tracking link URL"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Estimated Delivery Date"
                    name="estimatedDelivery"
                    type="date"
                    value={deliveryInfo.estimatedDelivery}
                    onChange={handleDeliveryInfoChange}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Delivery Notes"
                    name="notes"
                    multiline
                    rows={3}
                    value={deliveryInfo.notes}
                    onChange={handleDeliveryInfoChange}
                    placeholder="Any additional notes about this delivery"
                  />
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDeliveryDialog}>Cancel</Button>
            <Button 
              onClick={handleUpdateDelivery} 
              variant="contained" 
              color="primary"
              disabled={deliveryLoading || deliverySuccess || !deliveryInfo.service || !deliveryInfo.trackingNumber}
            >
              {deliveryLoading ? <CircularProgress size={24} /> : 'Save Delivery Info'}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Container>
  );
};

export default Orders; 