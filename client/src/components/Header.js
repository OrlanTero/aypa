import React, { useState, useContext } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  Button,
  Tooltip,
  MenuItem,
  Badge,
  Drawer,
  Divider,
  InputBase,
  alpha,
  useTheme
} from '@mui/material';
import {
  Menu as MenuIcon,
  ShoppingCart as CartIcon,
  AccountCircle,
  Search as SearchIcon,
  Dashboard as DashboardIcon,
  Storefront as StorefrontIcon,
  PersonOutline as PersonIcon,
  ShoppingBag as ShoppingBagIcon,
  Close as CloseIcon
} from '@mui/icons-material';

import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import CartMenu from './CartMenu';
import SearchBar from './SearchBar';

const Header = () => {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const { cart } = useContext(CartContext);
  const navigate = useNavigate();
  const theme = useTheme();

  // Mobile menu
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // User menu
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  
  // Cart menu
  const [cartMenuAnchor, setCartMenuAnchor] = useState(null);
  
  // Search
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const handleUserMenuOpen = (event) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleCartClick = (event) => {
    setCartMenuAnchor(event.currentTarget);
  };

  const handleCartClose = () => {
    setCartMenuAnchor(null);
  };

  const handleLogout = () => {
    logout();
    handleUserMenuClose();
    navigate('/');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleSearch = () => {
    setSearchOpen(!searchOpen);
    if (searchOpen) {
      setSearchValue('');
    }
  };

  const handleSearchChange = (event) => {
    setSearchValue(event.target.value);
  };

  const handleSearchSubmit = (event) => {
    if (event.key === 'Enter' && searchValue.trim()) {
      navigate(`/products?search=${searchValue.trim()}`);
      setSearchOpen(false);
      setSearchValue('');
    }
  };

  // Updated navigation items to include all pages
  const navItems = [
    { label: 'Home', path: '/', icon: <StorefrontIcon /> },
    { label: 'Products', path: '/products', icon: <ShoppingBagIcon /> },
    { label: 'Cart', path: '/cart', icon: <CartIcon /> }
  ];

  const isAdmin = user?.role === 'admin';
  const cartItemCount = cart.items.reduce((count, item) => count + item.quantity, 0);

  return (
    <AppBar 
      position="sticky" 
      elevation={0}
      sx={{
        borderBottom: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ minHeight: { xs: '64px', md: '70px' } }}>
          {/* Mobile menu icon */}
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 1, display: { md: 'none' } }}
            onClick={toggleMobileMenu}
          >
            <MenuIcon />
          </IconButton>
          
          {/* Logo */}
          <Typography
            variant="h5"
            noWrap
            component={RouterLink}
            to="/"
            sx={{
              mr: 3,
              display: 'flex',
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 700,
              letterSpacing: '.2rem',
              color: theme.palette.accent.main,
              textDecoration: 'none',
            }}
          >
            AYPA
          </Typography>

          {/* Desktop navigation */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {navItems.map((item) => (
              <Button
                key={item.label}
                component={RouterLink}
                to={item.path}
                startIcon={item.icon}
                sx={{ 
                  color: 'white', 
                  display: 'flex', 
                  mx: 1.5,
                  '&:hover': {
                    color: theme.palette.accent.main,
                    backgroundColor: 'transparent'
                  }
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>

          {/* Search Bar - visible when searchOpen is true */}
          {searchOpen && (
            <Box 
              sx={{ 
                flexGrow: 1,
                position: 'relative',
                backgroundColor: alpha(theme.palette.common.white, 0.15),
                '&:hover': {
                  backgroundColor: alpha(theme.palette.common.white, 0.25),
                },
                borderRadius: 2,
                display: 'flex',
                ml: { xs: 1, md: 0 },
                mr: { xs: 1, md: 2 }
              }}
            >
              <InputBase
                placeholder="Search products…"
                autoFocus
                value={searchValue}
                onChange={handleSearchChange}
                onKeyPress={handleSearchSubmit}
                sx={{
                  color: 'inherit',
                  width: '100%',
                  pl: 2,
                  transition: theme.transitions.create('width'),
                }}
              />
              <IconButton 
                color="inherit" 
                onClick={toggleSearch}
                sx={{ p: 1 }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          )}

          {/* Action Icons */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {/* Search Icon - visible when searchOpen is false */}
            {!searchOpen && (
              <IconButton
                size="large"
                color="inherit"
                onClick={toggleSearch}
                sx={{ 
                  mx: 0.5,
                  '&:hover': {
                    color: theme.palette.accent.main,
                    backgroundColor: 'transparent'
                  }
                }}
              >
                <SearchIcon />
              </IconButton>
            )}

            {/* Cart Icon */}
            <IconButton
              size="large"
              color="inherit"
              onClick={handleCartClick}
              sx={{ 
                mx: 0.5,
                '&:hover': {
                  color: theme.palette.accent.main,
                  backgroundColor: 'transparent'
                }
              }}
            >
              <Badge 
                badgeContent={cartItemCount} 
                color="secondary"
                sx={{
                  '& .MuiBadge-badge': {
                    backgroundColor: theme.palette.secondary.main,
                    color: 'white',
                  }
                }}
              >
                <CartIcon />
              </Badge>
            </IconButton>

            {/* User Menu */}
            {isAuthenticated ? (
              <>
                <Tooltip title="Account settings">
                  <IconButton
                    onClick={handleUserMenuOpen}
                    size="large"
                    edge="end"
                    aria-haspopup="true"
                    color="inherit"
                    sx={{ 
                      ml: 0.5,
                      '&:hover': {
                        color: theme.palette.accent.main,
                        backgroundColor: 'transparent'
                      }
                    }}
                  >
                    <Avatar 
                      sx={{ 
                        width: 32, 
                        height: 32, 
                        bgcolor: theme.palette.secondary.main,
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    >
                      {user?.name?.charAt(0) || 'U'}
                    </Avatar>
                  </IconButton>
                </Tooltip>
                <Menu
                  anchorEl={userMenuAnchor}
                  open={Boolean(userMenuAnchor)}
                  onClose={handleUserMenuClose}
                  keepMounted
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                  PaperProps={{
                    elevation: 3,
                    sx: {
                      mt: 1.5,
                      borderRadius: 2,
                      minWidth: 180,
                      '& .MuiMenuItem-root': {
                        px: 2,
                        py: 1.5
                      }
                    }
                  }}
                >
                  {isAdmin && (
                    <MenuItem 
                      component={RouterLink} 
                      to="/admin/dashboard"
                      onClick={handleUserMenuClose}
                    >
                      <DashboardIcon fontSize="small" sx={{ mr: 1.5, color: theme.palette.primary.main }} />
                      Admin Dashboard
                    </MenuItem>
                  )}
                  <MenuItem onClick={handleUserMenuClose}>
                    <PersonIcon fontSize="small" sx={{ mr: 1.5, color: theme.palette.primary.main }} />
                    My Account
                  </MenuItem>
                  <Divider sx={{ my: 1 }} />
                  <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </Menu>
              </>
            ) : (
              <Button
                component={RouterLink}
                to="/login"
                variant="outlined"
                color="inherit"
                sx={{ 
                  ml: 1.5,
                  borderColor: theme.palette.accent.main,
                  color: theme.palette.accent.main,
                  '&:hover': {
                    borderColor: theme.palette.accent.light,
                    backgroundColor: alpha(theme.palette.accent.main, 0.1)
                  }
                }}
              >
                Login
              </Button>
            )}
          </Box>
        </Toolbar>
      </Container>

      {/* Mobile Menu Drawer */}
      <Drawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={toggleMobileMenu}
        PaperProps={{
          sx: {
            width: 270,
            backgroundColor: theme.palette.background.dark,
            color: 'white'
          }
        }}
      >
        <Box
          sx={{ width: '100%' }}
          role="presentation"
        >
          <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6" component="div" sx={{ color: theme.palette.accent.main, fontWeight: 700 }}>
              AYPA Shop
            </Typography>
            <IconButton onClick={toggleMobileMenu} sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider sx={{ borderColor: alpha(theme.palette.common.white, 0.15) }} />
          <Box sx={{ py: 1.5 }}>
            {navItems.map((item) => (
              <MenuItem
                key={item.label}
                component={RouterLink}
                to={item.path}
                onClick={toggleMobileMenu}
                sx={{ 
                  py: 1.5,
                  px: 2.5,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.common.white, 0.1)
                  }
                }}
              >
                <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                  {React.cloneElement(item.icon, { sx: { mr: 2, color: theme.palette.accent.main } })}
                  {item.label}
                </Box>
              </MenuItem>
            ))}
          </Box>
          <Divider sx={{ borderColor: alpha(theme.palette.common.white, 0.15) }} />
          {isAuthenticated ? (
            <Box>
              <MenuItem 
                sx={{ 
                  py: 1.5,
                  px: 2.5,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.common.white, 0.1)
                  }
                }}
              >
                <PersonIcon sx={{ mr: 2, color: theme.palette.accent.main }} />
                My Account
              </MenuItem>
              {isAdmin && (
                <MenuItem 
                  component={RouterLink} 
                  to="/admin/dashboard"
                  onClick={toggleMobileMenu}
                  sx={{ 
                    py: 1.5,
                    px: 2.5,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.common.white, 0.1)
                    }
                  }}
                >
                  <DashboardIcon sx={{ mr: 2, color: theme.palette.accent.main }} />
                  Admin Dashboard
                </MenuItem>
              )}
              <MenuItem 
                onClick={handleLogout}
                sx={{ 
                  py: 1.5,
                  px: 2.5,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.common.white, 0.1)
                  }
                }}
              >
                Logout
              </MenuItem>
            </Box>
          ) : (
            <Box sx={{ p: 2.5 }}>
              <Button
                component={RouterLink}
                to="/login"
                variant="outlined"
                fullWidth
                onClick={toggleMobileMenu}
                sx={{ 
                  color: theme.palette.accent.main,
                  borderColor: theme.palette.accent.main,
                  '&:hover': {
                    borderColor: theme.palette.accent.light,
                    backgroundColor: alpha(theme.palette.accent.main, 0.1)
                  }
                }}
              >
                Login
              </Button>
            </Box>
          )}
        </Box>
      </Drawer>

      {/* Cart Menu Component */}
      <CartMenu
        anchorEl={cartMenuAnchor}
        open={Boolean(cartMenuAnchor)}
        onClose={handleCartClose}
      />

      {/* Search Overlay - can be added if needed */}
    </AppBar>
  );
};

export default Header; 