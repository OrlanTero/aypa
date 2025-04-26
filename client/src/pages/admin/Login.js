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
  CssBaseline,
  useTheme,
  alpha
} from '@mui/material';
import { AuthContext } from '../../context/AuthContext';
import logo from '../../assets/logo.png';

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
          alignItems: 'center',
          py: 6,
          background: theme => `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.1)}, ${alpha(theme.palette.secondary.light, 0.1)})`
        }}
      >
        <Container maxWidth="sm">
          <Paper 
            elevation={2} 
            sx={{ 
              p: { xs: 3, md: 5 }, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              borderRadius: 3,
              boxShadow: '0 8px 40px rgba(0,0,0,0.12)'
            }}
          >
            <Box 
              sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                mb: 4 
              }}
            >
              <img src={logo} alt="AYPA Logo" style={{ height: 60, marginBottom: 16 }} />
              <Typography component="h1" variant="h4" fontWeight={700}>
                Admin Portal
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                Sign in to your admin account
              </Typography>
            </Box>

            {(formError || authError) && (
              <Alert severity="error" sx={{ width: '100%', mb: 3 }}>
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
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
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
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ 
                  py: 1.5,
                  borderRadius: 2,
                  background: theme => `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.light} 90%)`,
                  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)',
                  '&:hover': {
                    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.2)',
                  },
                  mb: 2
                }}
              >
                {loading ? <CircularProgress size={24} /> : 'Sign In'}
              </Button>
            </Box>
          </Paper>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 4 }}>
            © {new Date().getFullYear()} AYPA Admin Portal
          </Typography>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default AdminLogin; 