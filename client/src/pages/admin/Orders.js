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
  Stack
} from '@mui/material';
import {
  Visibility as ViewIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Receipt as ReceiptIcon,
  LocalShipping as ShippingIcon
} from '@mui/icons-material';
import axios from 'axios';
import { ORDER_ENDPOINTS } from '../../constants/apiConfig';
import { formatCurrency } from '../../utils/formatters';

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
  return statusMap[status] || 'default';
};

// Format date to readable string
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

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
      if (order.status) {
        newStats[order.status] = (newStats[order.status] || 0) + 1;
      }
      
      if (order.status !== 'cancelled') {
        newStats.revenue += Number(order.totalPrice) || 0;
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
    setNewStatus(order.status);
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
      await axios.put(ORDER_ENDPOINTS.UPDATE_STATUS(selectedOrder._id), { status: newStatus });
      
      // Update the order in the state
      setOrders(orders.map(order => 
        order._id === selectedOrder._id ? { ...order, status: newStatus } : order
      ));
      
      setStatusUpdateSuccess(true);
      calculateStats(orders.map(order => 
        order._id === selectedOrder._id ? { ...order, status: newStatus } : order
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
    const matchesStatus = filters.status === 'all' || (order.status && order.status === filters.status);
    const matchesSearch = 
      filters.searchQuery === '' || 
      (order._id && order._id.toLowerCase().includes(filters.searchQuery.toLowerCase())) ||
      (order.user && order.user.name && order.user.name.toLowerCase().includes(filters.searchQuery.toLowerCase())) ||
      (order.shippingAddress && order.shippingAddress.address && order.shippingAddress.address.toLowerCase().includes(filters.searchQuery.toLowerCase()));
    
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
      orderItems: Array(Math.floor(Math.random() * 3) + 1).fill().map((_, itemIndex) => ({
        _id: `ITEM${300000 + itemIndex}`,
        name: `Product ${itemIndex + 1}`,
        quantity: Math.floor(Math.random() * 3) + 1,
        image: `https://source.unsplash.com/random/100x100?product=${itemIndex}`,
        price: (Math.random() * 1000 + 500).toFixed(2),
        size: ['S', 'M', 'L', 'XL'][Math.floor(Math.random() * 4)],
        color: ['Black', 'White', 'Red', 'Blue'][Math.floor(Math.random() * 4)]
      })),
      shippingAddress: {
        address: `${Math.floor(Math.random() * 1000) + 1} Main St, City ${index % 5 + 1}`,
        city: `City ${index % 5 + 1}`,
        postalCode: `${10000 + index * 10}`,
        country: 'Philippines'
      },
      paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
      paymentResult: {
        id: `PAY${400000 + index}`,
        status: 'completed',
        updateTime: new Date(Date.now() - Math.random() * 10000000).toISOString(),
        email: `customer${index % 10 + 1}@example.com`
      },
      taxPrice: (Math.random() * 100 + 10).toFixed(2),
      shippingPrice: (Math.random() * 50 + 25).toFixed(2),
      totalPrice: (Math.random() * 2000 + 500).toFixed(2),
      status: statuses[Math.floor(Math.random() * statuses.length)],
      isPaid: Math.random() > 0.3,
      paidAt: Math.random() > 0.3 ? new Date(Date.now() - Math.random() * 10000000).toISOString() : null,
      isDelivered: Math.random() > 0.6,
      deliveredAt: Math.random() > 0.6 ? new Date(Date.now() - Math.random() * 5000000).toISOString() : null,
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
                      <TableCell>{formatCurrency(order.totalPrice)}</TableCell>
                      <TableCell>
                        <Chip 
                          label={order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Unknown'} 
                          color={getStatusColor(order.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={order.isPaid ? 'Paid' : 'Not Paid'} 
                          color={order.isPaid ? 'success' : 'error'}
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
                label={selectedOrder.status ? selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1) : 'Unknown'} 
                color={getStatusColor(selectedOrder.status)}
                size="small"
              />
            </Box>
          </DialogTitle>
          <DialogContent dividers>
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
                      <strong>Payment Status:</strong> {selectedOrder.isPaid ? `Paid on ${formatDate(selectedOrder.paidAt)}` : 'Not Paid'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2">
                      <strong>Delivery Status:</strong> {selectedOrder.isDelivered ? `Delivered on ${formatDate(selectedOrder.deliveredAt)}` : 'Not Delivered'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2">
                      <strong>Status:</strong> {selectedOrder.status || 'Processing'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2">
                      <strong>Total:</strong> ${selectedOrder.totalPrice ? selectedOrder.totalPrice.toFixed(2) : '0.00'}
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
                      <strong>Address:</strong> {selectedOrder.shippingAddress.address || 'N/A'}
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

              {/* Payment Details */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Payment Details
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Subtotal: {formatCurrency(Number(selectedOrder.totalPrice) - Number(selectedOrder.taxPrice) - Number(selectedOrder.shippingPrice))}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Shipping: {formatCurrency(selectedOrder.shippingPrice)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tax: {formatCurrency(selectedOrder.taxPrice)}
                  </Typography>
                  <Typography variant="subtitle2" sx={{ mt: 1 }}>
                    Total: {formatCurrency(selectedOrder.totalPrice)}
                  </Typography>
                </Box>
              </Grid>

              {/* Order Items */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Order Items
                </Typography>
                {selectedOrder.orderItems && selectedOrder.orderItems.length > 0 ? (
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
                        {selectedOrder.orderItems.map((item) => (
                          <TableRow key={item._id || `${item.product}-${item.size}-${item.color}`}>
                            <TableCell>
                              {item.image ? (
                                <Box
                                  component="img"
                                  src={item.image}
                                  alt={item.name}
                                  sx={{ width: 50, height: 50, objectFit: 'cover' }}
                                  onError={(e) => {
                                    e.target.src = '/placeholder.png';
                                  }}
                                />
                              ) : (
                                <Box
                                  component="img"
                                  src="/placeholder.png"
                                  alt="Placeholder"
                                  sx={{ width: 50, height: 50, objectFit: 'cover' }}
                                />
                              )}
                            </TableCell>
                            <TableCell>{item.name || 'Unknown Product'}</TableCell>
                            <TableCell>{item.size || 'N/A'}</TableCell>
                            <TableCell>
                              {item.color ? (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Box
                                    sx={{
                                      width: 16,
                                      height: 16,
                                      bgcolor: item.color,
                                      borderRadius: '50%',
                                      border: '1px solid rgba(0,0,0,0.1)',
                                    }}
                                  />
                                  {item.color}
                                </Box>
                              ) : (
                                'N/A'
                              )}
                            </TableCell>
                            <TableCell align="right">${item.price ? item.price.toFixed(2) : '0.00'}</TableCell>
                            <TableCell align="right">{item.quantity || 0}</TableCell>
                            <TableCell align="right">
                              ${item.price && item.quantity ? (item.price * item.quantity).toFixed(2) : '0.00'}
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow>
                          <TableCell colSpan={5} />
                          <TableCell align="right">
                            <Typography variant="subtitle2">Subtotal:</Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2">
                              ${selectedOrder.itemsPrice ? selectedOrder.itemsPrice.toFixed(2) : '0.00'}
                            </Typography>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell colSpan={5} />
                          <TableCell align="right">
                            <Typography variant="subtitle2">Shipping:</Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2">
                              ${selectedOrder.shippingPrice ? selectedOrder.shippingPrice.toFixed(2) : '0.00'}
                            </Typography>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell colSpan={5} />
                          <TableCell align="right">
                            <Typography variant="subtitle2">Tax:</Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2">
                              ${selectedOrder.taxPrice ? selectedOrder.taxPrice.toFixed(2) : '0.00'}
                            </Typography>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell colSpan={5} />
                          <TableCell align="right">
                            <Typography variant="subtitle2">Total:</Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="subtitle2">
                              ${selectedOrder.totalPrice ? selectedOrder.totalPrice.toFixed(2) : '0.00'}
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
          </DialogContent>
          <DialogActions>
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
    </Container>
  );
};

export default Orders; 