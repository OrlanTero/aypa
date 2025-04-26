import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  CardHeader,
  Divider,
  CircularProgress,
  Alert,
  Button
} from '@mui/material';
import {
  AttachMoney as MoneyIcon,
  ShoppingCart as CartIcon,
  Inventory as InventoryIcon,
  TrendingUp as TrendingUpIcon,
  Person as PersonIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import Chart from 'react-apexcharts';
import { formatCurrency } from '../../utils/formatters';
import { PRODUCT_ENDPOINTS, ORDER_ENDPOINTS, USER_ENDPOINTS } from '../../constants/apiConfig';
import { setDocumentTitle, PAGE_TITLES } from '../../utils/titleUtils';

// Custom styled components
const StatsCard = styled(Card)(({ theme, color }) => ({
  height: '100%',
  backgroundColor: color ? color : theme.palette.background.paper,
  boxShadow: theme.shadows[2],
  '&:hover': {
    boxShadow: theme.shadows[6],
    transform: 'translateY(-4px)',
    transition: 'all 0.3s'
  }
}));

const IconBox = styled(Box)(({ theme, color }) => ({
  backgroundColor: color ? color : theme.palette.primary.main,
  color: theme.palette.common.white,
  borderRadius: '50%',
  width: 56,
  height: 56,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: theme.shadows[3]
}));

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    averageOrderValue: 0,
    totalCustomers: 0,
    topSellingProducts: [],
    recentOrders: [],
    monthlySales: [],
    productCategories: []
  });

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch real data from APIs
      const [productsResponse, ordersResponse, usersResponse] = await Promise.all([
        axios.get(PRODUCT_ENDPOINTS.ALL),
        axios.get(ORDER_ENDPOINTS.ALL),
        axios.get(USER_ENDPOINTS.ALL)
      ]);
      
      const products = productsResponse.data;
      const orders = ordersResponse.data;
      const users = usersResponse.data;
      
      // Calculate total revenue and average order value
      const totalRevenue = orders.reduce((sum, order) => sum + (Number(order.totalAmount) || 0), 0);
      const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
      
      // Get top selling products
      // In a real application, this would come from a dedicated API endpoint
      // Here we're simulating it by aggregating order items
      const productSales = {};
      orders.forEach(order => {
        if (order.items && order.items.length > 0) {
          order.items.forEach(item => {
            const productId = item.product?._id || (typeof item.product === 'string' ? item.product : 'unknown');
            const productName = item.product?.name || 'Unknown Product';
            
            if (!productSales[productId]) {
              productSales[productId] = {
                id: productId,
                name: productName,
                sales: 0,
                revenue: 0
              };
            }
            
            productSales[productId].sales += Number(item.quantity) || 0;
            productSales[productId].revenue += Number(item.price) * Number(item.quantity) || 0;
          });
        }
      });
      
      const topSellingProducts = Object.values(productSales)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);
      
      // Get recent orders
      const recentOrders = orders
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
        .map(order => ({
          id: order._id,
          customer: order.user?.name || 'Anonymous',
          date: order.createdAt,
          amount: order.totalAmount,
          status: order.orderStatus || 'Pending'
        }));
      
      // Calculate monthly sales
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthlySalesMap = {};
      
      // Initialize all months with zero
      monthNames.forEach(month => {
        monthlySalesMap[month] = 0;
      });
      
      // Aggregate order amounts by month
      orders.forEach(order => {
        if (order.createdAt) {
          const date = new Date(order.createdAt);
          const month = monthNames[date.getMonth()];
          monthlySalesMap[month] += Number(order.totalAmount) || 0;
        }
      });
      
      const monthlySales = Object.entries(monthlySalesMap).map(([month, sales]) => ({
        month,
        sales
      }));
      
      // Calculate product categories
      const categoryCounts = {};
      let totalProductCount = products.length;
      
      products.forEach(product => {
        const category = product.category || 'Uncategorized';
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      });
      
      const productCategories = Object.entries(categoryCounts).map(([name, count]) => ({
        name,
        count,
        percentage: (count / totalProductCount) * 100
      }));
      
      // Set the real data
      setStats({
        totalRevenue,
        totalOrders: orders.length,
        totalProducts: products.length,
        averageOrderValue,
        totalCustomers: users.length,
        topSellingProducts,
        recentOrders,
        monthlySales,
        productCategories
      });
      
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setDocumentTitle(PAGE_TITLES.ADMIN_DASHBOARD);
    fetchDashboardData();
  }, []);

  // Chart options for monthly sales
  const salesChartOptions = {
    chart: {
      type: 'area',
      height: 350,
      toolbar: {
        show: false
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'smooth',
      width: 3
    },
    xaxis: {
      categories: stats.monthlySales.map(item => item.month)
    },
    yaxis: {
      labels: {
        formatter: function(value) {
          return formatCurrency(value, false);
        }
      }
    },
    colors: ['#4CAF50'],
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.2,
        stops: [0, 90, 100]
      }
    },
    tooltip: {
      y: {
        formatter: function(value) {
          return formatCurrency(value);
        }
      }
    }
  };

  const salesChartSeries = [{
    name: 'Monthly Sales',
    data: stats.monthlySales.map(item => item.sales)
  }];

  // Chart options for product categories
  const categoryChartOptions = {
    chart: {
      type: 'pie',
      height: 350
    },
    labels: stats.productCategories.map(item => item.name),
    legend: {
      position: 'bottom'
    },
    dataLabels: {
      formatter: function(val) {
        return val.toFixed(1) + "%";
      }
    },
    tooltip: {
      y: {
        formatter: function(value) {
          return value.toFixed(2) + "%";
        }
      }
    },
    colors: ['#3f51b5', '#f44336', '#ff9800', '#4caf50', '#2196f3']
  };

  const categoryChartSeries = stats.productCategories.map(item => item.percentage);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ my: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button 
          variant="contained" 
          startIcon={<RefreshIcon />} 
          onClick={fetchDashboardData}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>
        <Button 
          variant="outlined" 
          startIcon={<RefreshIcon />} 
          onClick={fetchDashboardData}
        >
          Refresh Data
        </Button>
      </Box>
      
      {/* Key Statistics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard>
            <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Total Revenue
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  {formatCurrency(stats.totalRevenue)}
                </Typography>
                <Typography variant="body2" color="success.main">
                  +15.3% from last month
                </Typography>
              </Box>
              <IconBox color="#4caf50">
                <MoneyIcon />
              </IconBox>
            </CardContent>
          </StatsCard>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard>
            <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Total Orders
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  {stats.totalOrders}
                </Typography>
                <Typography variant="body2" color="success.main">
                  +8.2% from last month
                </Typography>
              </Box>
              <IconBox color="#f44336">
                <CartIcon />
              </IconBox>
            </CardContent>
          </StatsCard>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard>
            <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Average Order Value
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  {formatCurrency(stats.averageOrderValue)}
                </Typography>
                <Typography variant="body2" color="success.main">
                  +4.6% from last month
                </Typography>
              </Box>
              <IconBox color="#ff9800">
                <TrendingUpIcon />
              </IconBox>
            </CardContent>
          </StatsCard>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard>
            <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Total Customers
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  {stats.totalCustomers}
                </Typography>
                <Typography variant="body2" color="success.main">
                  +12.7% from last month
                </Typography>
              </Box>
              <IconBox color="#2196f3">
                <PersonIcon />
              </IconBox>
            </CardContent>
          </StatsCard>
        </Grid>
      </Grid>
      
      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Monthly Sales
            </Typography>
            <Chart 
              options={salesChartOptions}
              series={salesChartSeries}
              type="area"
              height={350}
            />
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Product Categories
            </Typography>
            <Chart 
              options={categoryChartOptions}
              series={categoryChartSeries}
              type="pie"
              height={350}
            />
          </Paper>
        </Grid>
      </Grid>
      
      {/* Top Selling Products & Recent Orders */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 0, overflow: 'hidden' }}>
            <CardHeader title="Top Selling Products" />
            <Divider />
            <Box sx={{ p: 2 }}>
              {stats.topSellingProducts.map((product, index) => (
                <Box key={product.id} sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  py: 1.5,
                  borderBottom: index < stats.topSellingProducts.length - 1 ? '1px solid #f0f0f0' : 'none'
                }}>
                  <Box>
                    <Typography variant="body1" fontWeight="medium">
                      {product.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {product.sales} units sold
                    </Typography>
                  </Box>
                  <Typography variant="body1" fontWeight="bold">
                    {formatCurrency(product.revenue)}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 0, overflow: 'hidden' }}>
            <CardHeader title="Recent Orders" />
            <Divider />
            <Box sx={{ p: 2 }}>
              {stats.recentOrders.map((order, index) => (
                <Box key={order.id} sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  py: 1.5,
                  borderBottom: index < stats.recentOrders.length - 1 ? '1px solid #f0f0f0' : 'none'
                }}>
                  <Box>
                    <Typography variant="body1" fontWeight="medium">
                      {order.id}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {order.customer} • {new Date(order.date).toLocaleDateString('en-PH')}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <Typography variant="body1" fontWeight="bold">
                      {formatCurrency(order.amount)}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 
                          order.status === 'Completed' ? 'success.main' : 
                          order.status === 'Processing' ? 'warning.main' : 
                          'info.main' 
                      }}
                    >
                      {order.status}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 