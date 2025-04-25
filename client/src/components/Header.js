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
  Divider
} from '@mui/material';
import {
  Menu as MenuIcon,
  ShoppingCart as CartIcon,
  AccountCircle,
  Search as SearchIcon,
  Dashboard as DashboardIcon
} from '@mui/icons-material';

import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import CartMenu from './CartMenu';
import SearchBar from './SearchBar';

const Header = () => {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const { cart } = useContext(CartContext);
  const navigate = useNavigate();

  // Mobile menu
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // User menu
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  
  // Cart menu
  const [cartMenuAnchor, setCartMenuAnchor] = useState(null);
  
  // Search
  const [searchOpen, setSearchOpen] = useState(false);

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
  };

  // Updated navigation items to only include existing pages
  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Cart', path: '/cart' }
  ];

  const isAdmin = user?.role === 'admin';
  const cartItemCount = cart.items.reduce((count, item) => count + item.quantity, 0);

  return (
    <AppBar position="static">
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          {/* Mobile menu icon */}
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2, display: { md: 'none' } }}
            onClick={toggleMobileMenu}
          >
            <MenuIcon />
          </IconButton>
          
          {/* Logo */}
          <Typography
            variant="h6"
            noWrap
            component={RouterLink}
            to="/"
            sx={{
              mr: 2,
              display: 'flex',
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
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
                sx={{ color: 'white', display: 'block', mx: 1 }}
              >
                {item.label}
              </Button>
            ))}
          </Box>

          {/* Search Icon */}
          <IconButton
            size="large"
            color="inherit"
            onClick={toggleSearch}
            sx={{ ml: 1 }}
          >
            <SearchIcon />
          </IconButton>

          {/* Cart Icon */}
          <IconButton
            size="large"
            color="inherit"
            onClick={handleCartClick}
            sx={{ ml: 1 }}
          >
            <Badge badgeContent={cartItemCount} color="secondary">
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
                  sx={{ ml: 1 }}
                >
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
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
              >
                {isAdmin && (
                  <MenuItem 
                    component={RouterLink} 
                    to="/admin/dashboard"
                    onClick={handleUserMenuClose}
                  >
                    <DashboardIcon fontSize="small" sx={{ mr: 1 }} />
                    Admin Dashboard
                  </MenuItem>
                )}
                <MenuItem onClick={handleUserMenuClose}>
                  My Account
                </MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </>
          ) : (
            <Button
              component={RouterLink}
              to="/login"
              color="inherit"
              sx={{ ml: 1 }}
            >
              Login
            </Button>
          )}
        </Toolbar>
      </Container>

      {/* Mobile Menu Drawer */}
      <Drawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={toggleMobileMenu}
      >
        <Box
          sx={{ width: 250 }}
          role="presentation"
          onClick={toggleMobileMenu}
          onKeyDown={toggleMobileMenu}
        >
          <Box sx={{ p: 2, borderBottom: '1px solid #eee' }}>
            <Typography variant="h6" component="div">
              AYPA Shop
            </Typography>
          </Box>
          {navItems.map((item) => (
            <MenuItem
              key={item.label}
              component={RouterLink}
              to={item.path}
              sx={{ py: 1.5 }}
            >
              {item.label}
            </MenuItem>
          ))}
          {isAuthenticated ? (
            <>
              <Divider />
              <MenuItem 
                component={RouterLink} 
                to="/account"
                sx={{ py: 1.5 }}
              >
                My Account
              </MenuItem>
              {isAdmin && (
                <MenuItem 
                  component={RouterLink} 
                  to="/admin/dashboard"
                  sx={{ py: 1.5 }}
                >
                  Admin Dashboard
                </MenuItem>
              )}
              <MenuItem 
                onClick={handleLogout}
                sx={{ py: 1.5 }}
              >
                Logout
              </MenuItem>
            </>
          ) : (
            <>
              <Divider />
              <MenuItem 
                component={RouterLink} 
                to="/login"
                sx={{ py: 1.5 }}
              >
                Login
              </MenuItem>
            </>
          )}
        </Box>
      </Drawer>

      {/* Search Bar Drawer */}
      <Drawer
        anchor="top"
        open={searchOpen}
        onClose={toggleSearch}
      >
        <Box sx={{ p: 2 }}>
          <SearchBar onClose={toggleSearch} />
        </Box>
      </Drawer>

      {/* Cart Menu */}
      <CartMenu
        anchorEl={cartMenuAnchor}
        open={Boolean(cartMenuAnchor)}
        onClose={handleCartClose}
      />
    </AppBar>
  );
};

export default Header; 