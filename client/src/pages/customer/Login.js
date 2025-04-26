import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Grid,
  Alert,
  CircularProgress,
  useTheme,
  alpha,
  Divider
} from '@mui/material';
import { AuthContext } from '../../context/AuthContext';
import logo from '../../assets/logo.png';
import { setDocumentTitle, PAGE_TITLES } from '../../utils/titleUtils';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState(null);
  
  const { login, error: authError, setError } = useContext(AuthContext);
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    setDocumentTitle(PAGE_TITLES.LOGIN);
  }, []);

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
      await login(email, password);
      navigate('/');
    } catch (err) {
      setFormError(err.response?.data?.msg || 'Login failed. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box 
      sx={{ 
        minHeight: 'calc(100vh - 140px)', 
        display: 'flex', 
        alignItems: 'center',
        py: 6,
        background: theme => `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.1)}, ${alpha(theme.palette.secondary.light, 0.1)})`,
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
              Welcome Back
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              Sign in to your account
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
              label="Email Address"
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
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Link to="#" style={{ textDecoration: 'none' }}>
                <Typography variant="body2" color="primary" sx={{ '&:hover': { textDecoration: 'underline' } }}>
                  Forgot password?
                </Typography>
              </Link>
              <Link to="/register" style={{ textDecoration: 'none' }}>
                <Typography variant="body2" color="primary" sx={{ '&:hover': { textDecoration: 'underline' } }}>
                  {"Don't have an account? Sign Up"}
                </Typography>
              </Link>
            </Box>
            
            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary">
                OR
              </Typography>
            </Divider>
            
            <Button
              fullWidth
              variant="outlined"
              component={Link}
              to="/"
              sx={{ 
                py: 1.5,
                borderRadius: 2, 
                mb: 2,
                borderColor: theme.palette.accent.main,
                color: theme.palette.accent.main,
                '&:hover': {
                  borderColor: theme.palette.accent.dark,
                  backgroundColor: alpha(theme.palette.accent.main, 0.05),
                }
              }}
            >
              Continue as Guest
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login; 