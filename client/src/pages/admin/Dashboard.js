import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Divider
} from '@mui/material';
import {
  PeopleAlt as PeopleIcon,
  Inventory as InventoryIcon,
  Receipt as ReceiptIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
import axios from 'axios';

// Mock data for when API is not yet connected
const mockData = {
  totalProducts: 48,
  totalOrders: 124,
  totalCustomers: 87,
  totalRevenue: 15680,
  recentOrders: [
    { id: '1001', customer: 'John Doe', date: '2023-11-22', total: 129.99, status: 'delivered' },
    { id: '1002', customer: 'Jane Smith', date: '2023-11-21', total: 89.50, status: 'shipped' },
    { id: '1003', customer: 'Mike Johnson', date: '2023-11-20', total: 45.75, status: 'processing' }
  ],
  popularProducts: [
    { id: '101', name: 'Classic White T-Shirt', sold: 32 },
    { id: '105', name: 'Blue ID Lace', sold: 28 },
    { id: '103', name: 'Black Hoodie', sold: 25 }
  ]
};

const Dashboard = () => {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Replace with real API call when available
        // const res = await axios.get('/api/admin/dashboard');
        // setStatistics(res.data);
        
        // Using mock data for now
        setTimeout(() => {
          setStatistics(mockData);
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError('Error loading dashboard data');
        console.error('Dashboard data error:', err);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Divider sx={{ mb: 3 }} />

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', bgcolor: '#e3f2fd' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PeopleIcon fontSize="large" color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" component="div">
                  Customers
                </Typography>
              </Box>
              <Typography variant="h3" component="div">
                {statistics.totalCustomers}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total registered customers
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', bgcolor: '#e8f5e9' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <InventoryIcon fontSize="large" color="success" sx={{ mr: 1 }} />
                <Typography variant="h6" component="div">
                  Products
                </Typography>
              </Box>
              <Typography variant="h3" component="div">
                {statistics.totalProducts}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total products in inventory
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', bgcolor: '#fff8e1' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ReceiptIcon fontSize="large" color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6" component="div">
                  Orders
                </Typography>
              </Box>
              <Typography variant="h3" component="div">
                {statistics.totalOrders}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total orders received
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', bgcolor: '#ffebee' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <MoneyIcon fontSize="large" color="error" sx={{ mr: 1 }} />
                <Typography variant="h6" component="div">
                  Revenue
                </Typography>
              </Box>
              <Typography variant="h3" component="div">
                ${statistics.totalRevenue.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total revenue generated
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Orders and Popular Products */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Orders
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {statistics.recentOrders.map((order, index) => (
              <Box key={order.id} sx={{ mb: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={5}>
                    <Typography variant="subtitle2">
                      Order #{order.id}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {order.customer}
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="body2">
                      {order.date}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 
                          order.status === 'delivered' ? 'success.main' :
                          order.status === 'shipped' ? 'info.main' :
                          order.status === 'processing' ? 'warning.main' : 'inherit'
                      }}
                    >
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Typography>
                  </Grid>
                  <Grid item xs={3} sx={{ textAlign: 'right' }}>
                    <Typography variant="subtitle2" color="primary">
                      ${order.total.toFixed(2)}
                    </Typography>
                  </Grid>
                </Grid>
                {index < statistics.recentOrders.length - 1 && (
                  <Divider sx={{ my: 1 }} />
                )}
              </Box>
            ))}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Popular Products
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {statistics.popularProducts.map((product, index) => (
              <Box key={product.id} sx={{ mb: 2 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={8}>
                    <Typography variant="subtitle2">
                      {product.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Product ID: {product.id}
                    </Typography>
                  </Grid>
                  <Grid item xs={4} sx={{ textAlign: 'right' }}>
                    <Typography variant="subtitle2" color="primary">
                      {product.sold} sold
                    </Typography>
                  </Grid>
                </Grid>
                {index < statistics.popularProducts.length - 1 && (
                  <Divider sx={{ my: 1 }} />
                )}
              </Box>
            ))}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 