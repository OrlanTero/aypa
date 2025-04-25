import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  ThemeProvider,
  createTheme,
  CssBaseline
} from '@mui/material';
import { LockOutlined } from '@mui/icons-material';
import { AuthContext } from '../../context/AuthContext';

// Create a custom theme for the admin login page
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
});

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState(null);
  
  const { loginAdmin, error: authError, setError } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Simple validation
    if (!email) {
      setFormError('Email is required');
      return;
    }
    if (!password) {
      setFormError('Password is required');
      return;
    }

    try {
      setLoading(true);
      setFormError(null);
      
      // Use loginAdmin instead of login
      await loginAdmin(email, password);
      
      // Redirect to admin dashboard
      navigate('/admin/dashboard');
    } catch (err) {
      setFormError(err.response?.data?.msg || 'Invalid admin credentials');
      console.error('Admin login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          background: 'linear-gradient(to right bottom, #1976d2, #90caf9)'
        }}
      >
        <Container maxWidth="xs">
          <Paper 
            elevation={6} 
            sx={{ 
              p: 4, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              borderRadius: 2
            }}
          >
            <Box
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                borderRadius: '50%',
                p: 1,
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <LockOutlined />
            </Box>
            
            <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
              AYPA Admin Login
            </Typography>

            {(formError || authError) && (
              <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                {formError || authError}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Admin Email"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2, py: 1.5 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Sign In'}
              </Button>
            </Box>
          </Paper>
        </Container>
        <Typography variant="body2" color="white" align="center" sx={{ mt: 4 }}>
          © {new Date().getFullYear()} AYPA Admin Portal
        </Typography>
      </Box>
    </ThemeProvider>
  );
};

export default AdminLogin; 