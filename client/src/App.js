import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';

// Customer Pages
import Home from './pages/Home';
import Cart from './pages/Cart';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import CustomerLogin from './pages/customer/Login';
import CustomerRegister from './pages/customer/Register';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import NotFound from './pages/NotFound';
import ProfilePage from './pages/Profile';
import CustomerSupport from './pages/CustomerSupport';
import Favorites from './pages/Favorites';

// Admin Pages
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import Inventory from './pages/admin/Inventory';
import AdminOrders from './pages/admin/Orders';
import Reports from './pages/admin/Reports';
import AdminProfile from './pages/admin/Profile';
import Messages from './pages/admin/Messages';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import Loader from './components/Loader';

// Context
import { AuthProvider, AuthContext } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { FavoritesProvider } from './context/FavoritesContext';

// Layouts
import AdminLayout from './components/layout/AdminLayout';
import CustomerLayout from './components/layout/CustomerLayout';

// Define theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#0599DF', // Azure (was Dark blue)
      light: '#82D0F1', // Sky Blue
      dark: '#24292A', // Almost Black
      contrastText: '#FFFFFF', // White
    },
    secondary: {
      main: '#EC048D', // Pink
      light: '#82D0F1', // Sky Blue
      dark: '#24292A', // Almost Black
      contrastText: '#FFFFFF', // White
    },
    accent: {
      main: '#82D0F1', // Sky Blue
      light: '#FFFFFF', // White
      dark: '#0599DF', // Azure
      contrastText: '#24292A', // Almost Black
    },
    background: {
      default: '#FFFFFF', // White (was #D1CFC9)
      paper: '#FFFFFF', // White (was #D1CFC9)
      dark: '#24292A', // Almost Black (was #0F1A2B)
    },
    text: {
      primary: '#24292A', // Almost Black (was Darkest blue)
      secondary: '#0599DF', // Azure (was #1C2E4A)
    },
    error: {
      main: '#f44336',
    },
    success: {
      main: '#4CAF50',
    },
    info: {
      main: '#0599DF', // Azure (was same as primary)
    },
    warning: {
      main: '#EC048D', // Pink (was Same as accent)
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
          background: 'linear-gradient(45deg, #0599DF 30%, #82D0F1 90%)',
        },
        containedSecondary: {
          background: 'linear-gradient(45deg, #EC048D 30%, #82D0F1 90%)',
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
          backgroundColor: '#24292A',
          color: '#FFFFFF',
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
          <FavoritesProvider>
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
                        <Route path="/orders" element={<AdminOrders />} />
                        <Route path="/reports" element={<Reports />} />
                        <Route path="/profile" element={<AdminProfile />} />
                        <Route path="/messages" element={<Messages />} />
                        {/* Add other admin routes here */}
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </AdminLayout>
                  </AdminProtectedRoute>
                } />
                
                {/* Customer Routes */}
                <Route path="/*" element={
                  <CustomerLayout>
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/products" element={<ProductList />} />
                      <Route path="/products/:id" element={<ProductDetail />} />
                      <Route path="/cart" element={<Cart />} />
                      <Route path="/checkout" element={
                        <CustomerProtectedRoute>
                          <Checkout />
                        </CustomerProtectedRoute>
                      } />
                      <Route path="/orders" element={
                        <CustomerProtectedRoute>
                          <Orders />
                        </CustomerProtectedRoute>
                      } />
                      <Route path="/orders/:id" element={
                        <CustomerProtectedRoute>
                          <OrderDetail />
                        </CustomerProtectedRoute>
                      } />
                      <Route path="/profile" element={
                        <CustomerProtectedRoute>
                          <ProfilePage />
                        </CustomerProtectedRoute>
                      } />
                      <Route path="/favorites" element={
                        <CustomerProtectedRoute>
                          <Favorites />
                        </CustomerProtectedRoute>
                      } />
                      <Route path="/login" element={<CustomerLogin />} />
                      <Route path="/register" element={<CustomerRegister />} />
                      <Route path="/support" element={<CustomerSupport />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </CustomerLayout>
                } />
              </Routes>
            </Router>
          </FavoritesProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
