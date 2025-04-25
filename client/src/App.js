import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';

// Customer Pages
import Home from './pages/Home';
import Cart from './pages/Cart';
import ProductList from './pages/ProductList';
import Checkout from './pages/Checkout';
import CustomerLogin from './pages/customer/Login';
import CustomerRegister from './pages/customer/Register';
import NotFound from './pages/NotFound';

// Admin Pages
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import Inventory from './pages/admin/Inventory';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import Loader from './components/Loader';

// Context
import { AuthProvider, AuthContext } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Layouts
import AdminLayout from './components/layout/AdminLayout';
import CustomerLayout from './components/layout/CustomerLayout';

// Define theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#11aaea', // Light Blue
      light: '#53c4ef',
      dark: '#0c79a4',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#e4128a', // Pink
      light: '#ec52a9',
      dark: '#a00d61',
      contrastText: '#ffffff',
    },
    accent: {
      main: '#f8f023', // Yellow
      light: '#f9f45c',
      dark: '#d6cf1e',
      contrastText: '#29292a',
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
      dark: '#29292a', // Dark Grey/Almost Black
    },
    text: {
      primary: '#29292a', // Dark Grey/Almost Black
      secondary: '#5a5a5b',
    },
    error: {
      main: '#f44336',
    },
    success: {
      main: '#4CAF50',
    },
    info: {
      main: '#11aaea', // Same as primary
    },
    warning: {
      main: '#f8f023', // Same as accent
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 600,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(45deg, #11aaea 30%, #53c4ef 90%)',
        },
        containedSecondary: {
          background: 'linear-gradient(45deg, #e4128a 30%, #ec52a9 90%)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 2px 8px rgba(0,0,0,0.05)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#29292a',
          color: '#ffffff',
        },
      },
    },
  },
});

// Protected route component for customer routes
const CustomerProtectedRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useContext(AuthContext);
  
  if (loading) return <Loader />;
  if (!isAuthenticated || (user && user.role !== 'customer')) {
    return <Navigate to="/login" />;
  }
  return children;
};

// Protected route component for admin routes
const AdminProtectedRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useContext(AuthContext);
  
  if (loading) return <Loader />;
  if (!isAuthenticated || (user && user.role !== 'admin')) {
    return <Navigate to="/admin/login" />;
  }
  return children;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <CartProvider>
          <Router>
            <Routes>
              {/* Admin Login */}
              <Route path="/admin/login" element={<AdminLogin />} />
              
              {/* Admin Routes */}
              <Route path="/admin/*" element={
                <AdminProtectedRoute>
                  <AdminLayout>
                    <Routes>
                      <Route path="/" element={<AdminDashboard />} />
                      <Route path="/dashboard" element={<AdminDashboard />} />
                      <Route path="/inventory" element={<Inventory />} />
                      {/* Add other admin routes here */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </AdminLayout>
                </AdminProtectedRoute>
              } />
              
              {/* Auth Pages - No Header/Footer */}
              <Route path="/login" element={<CustomerLogin />} />
              <Route path="/register" element={<CustomerRegister />} />
              
              {/* Customer Routes */}
              <Route path="/" element={<CustomerLayout><Home /></CustomerLayout>} />
              <Route path="/cart" element={
                <CustomerProtectedRoute>
                  <CustomerLayout><Cart /></CustomerLayout>
                </CustomerProtectedRoute>
              } />
              <Route path="/products" element={<CustomerLayout><ProductList /></CustomerLayout>} />
              <Route path="/checkout" element={
                <CustomerProtectedRoute>
                  <CustomerLayout><Checkout /></CustomerLayout>
                </CustomerProtectedRoute>
              } />
              
              {/* Catch-all route */}
              <Route path="*" element={<CustomerLayout><NotFound /></CustomerLayout>} />
            </Routes>
          </Router>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
