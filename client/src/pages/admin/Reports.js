import React, { useState, useEffect, useRef } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Grid, 
  Card, 
  CardContent,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Divider,
  Stack,
  useTheme,
  alpha
} from '@mui/material';
import { 
  FileDownload as DownloadIcon,
  Print as PrintIcon,
  TrendingUp as TrendingUpIcon,
  BarChart as ChartIcon,
  PieChart as PieChartIcon,
  AddShoppingCart as SalesIcon
} from '@mui/icons-material';
import axios from 'axios';
import { ORDER_ENDPOINTS, PRODUCT_ENDPOINTS } from '../../constants/apiConfig';
import { formatCurrency } from '../../utils/formatters';
import { setDocumentTitle, PAGE_TITLES } from '../../utils/titleUtils';

// Tab Panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`report-tabpanel-${index}`}
      aria-labelledby={`report-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Reports = () => {
  const theme = useTheme();
  const printFrameRef = useRef(null);
  const [activeTab, setActiveTab] = useState(0);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
    endDate: new Date()
  });
  const [reportType, setReportType] = useState('sales');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [inventoryData, setInventoryData] = useState([]);
  const [reportGenerating, setReportGenerating] = useState(false);

  useEffect(() => {
    setDocumentTitle(PAGE_TITLES.ADMIN_REPORTS);
    if (activeTab === 0) {
      fetchSalesData();
    } else if (activeTab === 1) {
      fetchInventoryData();
    }
  }, [activeTab, dateRange]);

  const fetchSalesData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Make API call to get orders within date range
      const response = await axios.get(ORDER_ENDPOINTS.ALL);
      
      // Filter orders by date range
      const startTimestamp = dateRange.startDate.getTime();
      const endTimestamp = dateRange.endDate.getTime();
      
      const filteredOrders = response.data.filter(order => {
        const orderDate = new Date(order.createdAt).getTime();
        return orderDate >= startTimestamp && orderDate <= endTimestamp && order.orderStatus !== 'cancelled';
      });
      
      // Process orders for report
      const processedData = processOrdersForSalesReport(filteredOrders);
      setSalesData(processedData);
      
    } catch (err) {
      console.error('Error fetching sales data:', err);
      setError('Failed to load sales data. Please try again.');
      // In development, use mock data
      setSalesData(generateMockSalesData());
    } finally {
      setLoading(false);
    }
  };

  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Make API call to get inventory data
      const response = await axios.get(PRODUCT_ENDPOINTS.ALL);
      
      // Process products for inventory report
      setInventoryData(response.data);
      
    } catch (err) {
      console.error('Error fetching inventory data:', err);
      setError('Failed to load inventory data. Please try again.');
      // In development, use mock data
      setInventoryData(generateMockInventoryData());
    } finally {
      setLoading(false);
    }
  };

  const processOrdersForSalesReport = (orders) => {
    // Group orders by date, product, etc. depending on report type
    const salesByDate = {};
    
    orders.forEach(order => {
      const date = new Date(order.createdAt).toLocaleDateString();
      
      if (!salesByDate[date]) {
        salesByDate[date] = {
          date,
          orderCount: 0,
          revenue: 0,
          items: []
        };
      }
      
      salesByDate[date].orderCount += 1;
      salesByDate[date].revenue += Number(order.totalAmount);
      
      // Process items sold
      if (order.items && order.items.length > 0) {
        order.items.forEach(item => {
          salesByDate[date].items.push({
            product: item.product?.name || 'Unknown Product',
            quantity: item.quantity,
            price: item.price,
            total: item.price * item.quantity
          });
        });
      }
    });
    
    return Object.values(salesByDate).sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const generateMockSalesData = () => {
    // Generate mock sales data for development
    const mockData = [];
    const startDate = new Date(dateRange.startDate);
    const endDate = new Date(dateRange.endDate);
    
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      const dateStr = date.toLocaleDateString();
      
      // Only include some dates to make the data more realistic
      if (Math.random() > 0.3) {
        const orderCount = Math.floor(Math.random() * 5) + 1;
        const revenue = (Math.random() * 10000 + 1000).toFixed(2);
        
        const items = [];
        for (let i = 0; i < Math.floor(Math.random() * 5) + 1; i++) {
          items.push({
            product: `Product ${i + 1}`,
            quantity: Math.floor(Math.random() * 3) + 1,
            price: (Math.random() * 100 + 50).toFixed(2),
            total: (Math.random() * 300 + 50).toFixed(2)
          });
        }
        
        mockData.push({
          date: dateStr,
          orderCount,
          revenue,
          items
        });
      }
    }
    
    return mockData;
  };

  const generateMockInventoryData = () => {
    // Generate mock inventory data for development
    const mockData = [];
    
    for (let i = 0; i < 20; i++) {
      mockData.push({
        _id: `PROD${i + 1}`,
        name: `Product ${i + 1}`,
        price: (Math.random() * 1000 + 100).toFixed(2),
        stock: Math.floor(Math.random() * 100),
        category: ['Clothing', 'Accessories', 'Footwear'][Math.floor(Math.random() * 3)],
        createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString()
      });
    }
    
    return mockData;
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleStartDateChange = (date) => {
    setDateRange({ ...dateRange, startDate: date });
  };

  const handleEndDateChange = (date) => {
    setDateRange({ ...dateRange, endDate: date });
  };

  const handleReportTypeChange = (event) => {
    setReportType(event.target.value);
  };

  const generatePDF = () => {
    setReportGenerating(true);
    
    // We'll use the browser's print feature to generate the PDF
    // This approach is more compatible across browsers
    
    setTimeout(() => {
      const content = document.getElementById('report-content');
      const printWindow = window.open('', '_blank');
      
      // Create a styled document for printing
      printWindow.document.write(`
        <html>
          <head>
            <title>${getReportTitle()}</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                margin: 20px;
              }
              .report-header {
                text-align: center;
                margin-bottom: 20px;
              }
              .report-title {
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 10px;
              }
              .report-subtitle {
                font-size: 16px;
                color: #666;
                margin-bottom: 20px;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
              }
              th, td {
                border: 1px solid #ddd;
                padding: 8px 12px;
                text-align: left;
              }
              th {
                background-color: #f2f2f2;
                font-weight: bold;
              }
              .total-row {
                font-weight: bold;
                background-color: #f9f9f9;
              }
              .report-footer {
                font-size: 12px;
                color: #666;
                text-align: center;
                margin-top: 40px;
              }
            </style>
          </head>
          <body>
            <div class="report-header">
              <div class="report-title">${getReportTitle()}</div>
              <div class="report-subtitle">Period: ${dateRange.startDate.toLocaleDateString()} - ${dateRange.endDate.toLocaleDateString()}</div>
            </div>
            ${content.innerHTML}
            <div class="report-footer">
              Report generated on ${new Date().toLocaleString()}
            </div>
          </body>
        </html>
      `);
      
      printWindow.document.close();
      printWindow.focus();
      
      // Print after a small delay to ensure styles are applied
      setTimeout(() => {
        printWindow.print();
        setReportGenerating(false);
      }, 500);
    }, 1000);
  };

  const handlePrint = () => {
    setReportGenerating(true);
    
    setTimeout(() => {
      const content = document.getElementById('report-content');
      const printWindow = window.open('', '_blank');
      
      // Create a styled document for printing
      printWindow.document.write(`
        <html>
          <head>
            <title>${getReportTitle()}</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                margin: 20px;
              }
              .report-header {
                text-align: center;
                margin-bottom: 20px;
              }
              .report-title {
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 10px;
              }
              .report-subtitle {
                font-size: 16px;
                color: #666;
                margin-bottom: 20px;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
              }
              th, td {
                border: 1px solid #ddd;
                padding: 8px 12px;
                text-align: left;
              }
              th {
                background-color: #f2f2f2;
                font-weight: bold;
              }
              .total-row {
                font-weight: bold;
                background-color: #f9f9f9;
              }
              .report-footer {
                font-size: 12px;
                color: #666;
                text-align: center;
                margin-top: 40px;
              }
              @media print {
                body {
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                }
              }
            </style>
          </head>
          <body>
            <div class="report-header">
              <div class="report-title">${getReportTitle()}</div>
              <div class="report-subtitle">Period: ${dateRange.startDate.toLocaleDateString()} - ${dateRange.endDate.toLocaleDateString()}</div>
            </div>
            ${content.innerHTML}
            <div class="report-footer">
              Report generated on ${new Date().toLocaleString()}
            </div>
          </body>
        </html>
      `);
      
      printWindow.document.close();
      printWindow.focus();
      
      // Print after a small delay to ensure styles are applied
      setTimeout(() => {
        printWindow.print();
        setReportGenerating(false);
      }, 500);
    }, 1000);
  };

  const getReportTitle = () => {
    if (activeTab === 0) {
      return 'Sales Report';
    } else if (activeTab === 1) {
      return 'Inventory Report';
    }
    return 'Generated Report';
  };

  // Render sales report content
  const renderSalesReport = () => {
    if (salesData.length === 0) {
      return (
        <Alert severity="info">
          No sales data found for the selected date range.
        </Alert>
      );
    }
    
    // Calculate totals
    const totalRevenue = salesData.reduce((sum, day) => sum + Number(day.revenue), 0);
    const totalOrders = salesData.reduce((sum, day) => sum + day.orderCount, 0);
    
    return (
      <Box id="report-content">
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
              <CardContent>
                <Typography variant="h6">Total Revenue</Typography>
                <Typography variant="h4">{formatCurrency(totalRevenue)}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.05) }}>
              <CardContent>
                <Typography variant="h6">Total Orders</Typography>
                <Typography variant="h4">{totalOrders}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: alpha(theme.palette.info.main, 0.05) }}>
              <CardContent>
                <Typography variant="h6">Avg. Order Value</Typography>
                <Typography variant="h4">
                  {totalOrders ? formatCurrency(totalRevenue / totalOrders) : formatCurrency(0)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Typography variant="h6" gutterBottom>
          Daily Sales Breakdown
        </Typography>
        <TableContainer component={Paper} sx={{ mb: 4 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell align="right">Orders</TableCell>
                <TableCell align="right">Revenue</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {salesData.map((day) => (
                <TableRow key={day.date}>
                  <TableCell>{day.date}</TableCell>
                  <TableCell align="right">{day.orderCount}</TableCell>
                  <TableCell align="right">{formatCurrency(day.revenue)}</TableCell>
                </TableRow>
              ))}
              <TableRow className="total-row">
                <TableCell><strong>Total</strong></TableCell>
                <TableCell align="right"><strong>{totalOrders}</strong></TableCell>
                <TableCell align="right"><strong>{formatCurrency(totalRevenue)}</strong></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <Typography variant="h6" gutterBottom>
          Product Sales Details
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Product</TableCell>
                <TableCell align="right">Quantity Sold</TableCell>
                <TableCell align="right">Revenue</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {getProductSalesSummary().map((product) => (
                <TableRow key={product.name}>
                  <TableCell>{product.name}</TableCell>
                  <TableCell align="right">{product.quantity}</TableCell>
                  <TableCell align="right">{formatCurrency(product.revenue)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  // Render inventory report content
  const renderInventoryReport = () => {
    if (inventoryData.length === 0) {
      return (
        <Alert severity="info">
          No inventory data available.
        </Alert>
      );
    }
    
    // Sort inventory by stock level (lowest first)
    const sortedInventory = [...inventoryData].sort((a, b) => a.stock - b.stock);
    
    // Calculate inventory statistics
    const totalProducts = inventoryData.length;
    const totalStock = inventoryData.reduce((sum, product) => sum + product.stock, 0);
    const lowStockProducts = inventoryData.filter(product => product.stock < 10).length;
    
    return (
      <Box id="report-content">
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
              <CardContent>
                <Typography variant="h6">Total Products</Typography>
                <Typography variant="h4">{totalProducts}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: alpha(theme.palette.warning.main, 0.05) }}>
              <CardContent>
                <Typography variant="h6">Low Stock Products</Typography>
                <Typography variant="h4">{lowStockProducts}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: alpha(theme.palette.info.main, 0.05) }}>
              <CardContent>
                <Typography variant="h6">Total Stock</Typography>
                <Typography variant="h4">{totalStock} units</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Typography variant="h6" gutterBottom>
          Inventory Status
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Product Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell align="right">Price</TableCell>
                <TableCell align="right">Stock</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedInventory.map((product) => (
                <TableRow key={product._id}>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.category || 'Uncategorized'}</TableCell>
                  <TableCell align="right">{formatCurrency(product.price)}</TableCell>
                  <TableCell align="right">{product.stock}</TableCell>
                  <TableCell>
                    {product.stock === 0 ? (
                      <Typography color="error">Out of Stock</Typography>
                    ) : product.stock < 10 ? (
                      <Typography color="warning.main">Low Stock</Typography>
                    ) : (
                      <Typography color="success.main">In Stock</Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  // Helper to get product sales summary
  const getProductSalesSummary = () => {
    const productSales = {};
    
    salesData.forEach(day => {
      day.items.forEach(item => {
        if (!productSales[item.product]) {
          productSales[item.product] = {
            name: item.product,
            quantity: 0,
            revenue: 0
          };
        }
        
        productSales[item.product].quantity += item.quantity;
        productSales[item.product].revenue += item.total;
      });
    });
    
    return Object.values(productSales).sort((a, b) => b.revenue - a.revenue);
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: 3, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Reports
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Generate and download detailed reports
        </Typography>
      </Box>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={6} lg={3}>
            <TextField
              label="Start Date"
              type="date"
              value={dateRange.startDate.toISOString().split('T')[0]}
              onChange={(e) => handleStartDateChange(new Date(e.target.value))}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <TextField
              label="End Date"
              type="date"
              value={dateRange.endDate.toISOString().split('T')[0]}
              onChange={(e) => handleEndDateChange(new Date(e.target.value))}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={generatePDF}
              disabled={loading || reportGenerating}
              fullWidth
            >
              {reportGenerating ? 'Generating...' : 'Download PDF'}
            </Button>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <Button
              variant="outlined"
              startIcon={<PrintIcon />}
              onClick={handlePrint}
              disabled={loading || reportGenerating}
              fullWidth
            >
              {reportGenerating ? 'Generating...' : 'Print Report'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Sales Report" icon={<SalesIcon />} iconPosition="start" />
          <Tab label="Inventory Report" icon={<ChartIcon />} iconPosition="start" />
        </Tabs>
        
        <Box sx={{ p: 3 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
          ) : (
            <TabPanel value={activeTab} index={0}>
              {renderSalesReport()}
            </TabPanel>
          )}
          
          <TabPanel value={activeTab} index={1}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
            ) : (
              renderInventoryReport()
            )}
          </TabPanel>
        </Box>
      </Paper>
      
      <iframe
        title="Print Frame"
        ref={printFrameRef}
        style={{ display: 'none' }}
      />
    </Container>
  );
};

export default Reports; 