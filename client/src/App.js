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
      main: '#556cd6',
    },
    secondary: {
      main: '#19857b',
    },
    background: {
      default: '#f5f5f5',
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
