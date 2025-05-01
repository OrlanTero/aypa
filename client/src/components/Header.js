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
  Close as CloseIcon,
  HelpOutline as HelpOutlineIcon,
  Favorite as FavoriteIcon
} from '@mui/icons-material';

import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import CartMenu from './CartMenu';
import SearchBar from './SearchBar';
import { getUserAvatarUrl } from '../utils/imageUtils';
import defaultUserAvatar from '../assets/default-avatar.png';
import logo from '../assets/logo.png';

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
    { label: 'Support', path: '/support', icon: <HelpOutlineIcon /> },
    { label: 'Cart', path: '/cart', icon: <CartIcon /> },
    { label: 'Favorites', path: '/favorites', icon: <FavoriteIcon />, protected: true }
  ];

  const isAdmin = user?.role === 'admin';
  const cartItemCount = cart.items.reduce((count, item) => count + item.quantity, 0);

  return (
    <AppBar 
      position="sticky" 
      elevation={1}
      sx={{
        background: `linear-gradient(to right, ${theme.palette.background.dark}, ${alpha(theme.palette.primary.dark, 0.85)})`,
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
          
          {/* Logo - Improved with better sizing and positioning */}
          <Box 
            component={RouterLink} 
            to="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              mr: { xs: 'auto', md: 3 },
              ml: { xs: 'auto', md: 0 },
              textDecoration: 'none',
            }}
          >
            <Box 
              component="img" 
              src={logo} 
              alt="AYPA Logo"
              sx={{ 
                height: { xs: 45, md: 50 },
                mr: 1.5,
                filter: 'drop-shadow(0px 2px 3px rgba(0,0,0,0.2))'
              }}
            />
            <Typography
              variant="h5"
              noWrap
              sx={{
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 700,
                letterSpacing: '.2rem',
                color: theme.palette.accent.main,
                display: { xs: 'none', sm: 'block' },
                textShadow: '0px 2px 4px rgba(0,0,0,0.2)'
              }}
            >
              AYPA
            </Typography>
          </Box>

          {/* Desktop navigation */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, marginRight: 3 }}>
            {navItems
              .filter(item => !item.protected || (item.protected && isAuthenticated))
              .map((item) => (
                <Button
                  key={item.label}
                  component={RouterLink}
                  to={item.path}
                  startIcon={item.icon}
                  sx={{ 
                    color: 'white', 
                    display: 'flex', 
                    mx: 1.5,
                    fontWeight: 500,
                    position: 'relative',
                    '&:hover': {
                      color: theme.palette.accent.main,
                      backgroundColor: 'transparent'
                    },
                    '&:hover::after': {
                      width: '70%'
                    },
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: 5,
                      left: '15%',
                      width: 0,
                      height: 2,
                      bgcolor: theme.palette.accent.main,
                      transition: 'width 0.3s ease'
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
          <Box sx={{ display: 'flex', alignItems: 'center', ml: { xs: 'auto', md: 0 } }}>
            {/* Search Icon - visible when searchOpen is false */}
            {!searchOpen && (
              <IconButton
                size="large"
                color="inherit"
                onClick={toggleSearch}
                sx={{ 
                  mx: 0.5,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    color: theme.palette.accent.main,
                    transform: 'scale(1.1)',
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
                transition: 'all 0.2s ease',
                '&:hover': {
                  color: theme.palette.accent.main,
                  transform: 'scale(1.1)',
                  backgroundColor: 'transparent'
                }
              }}
            >
              <Badge badgeContent={cartItemCount} color="secondary">
                <CartIcon />
              </Badge>
            </IconButton>

            {/* User Account - Enhanced UI */}
            {isAuthenticated ? (
              <>
                <Tooltip title="Account settings">
                  <IconButton 
                    onClick={handleUserMenuOpen}
                    size="large"
                    sx={{ 
                      ml: 0.5,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'scale(1.1)',
                      }
                    }}
                  >
                    <Avatar 
                      src={user?.avatar ? getUserAvatarUrl(user) : defaultUserAvatar} 
                      alt={user?.name}
                      sx={{ 
                        width: 36, 
                        height: 36,
                        border: `2px solid ${theme.palette.accent.main}`,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}
                    />
                  </IconButton>
                </Tooltip>
                <Menu
                  anchorEl={userMenuAnchor}
                  id="account-menu"
                  open={Boolean(userMenuAnchor)}
                  onClose={handleUserMenuClose}
                  onClick={handleUserMenuClose}
                  PaperProps={{
                    elevation: 3,
                    sx: {
                      overflow: 'visible',
                      filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.15))',
                      mt: 1.5,
                      borderRadius: 3,
                      width: 280,
                      '&::before': {
                        content: '""',
                        display: 'block',
                        position: 'absolute',
                        top: 0,
                        right: 14,
                        width: 10,
                        height: 10,
                        bgcolor: 'background.paper',
                        transform: 'translateY(-50%) rotate(45deg)',
                        zIndex: 0,
                      },
                    },
                  }}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                  <Box sx={{ pt: 2, pb: 1, px: 2.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Avatar 
                        src={user?.avatar ? getUserAvatarUrl(user) : defaultUserAvatar} 
                        alt={user?.name}
                        sx={{ 
                          width: 50, 
                          height: 50,
                          mr: 2,
                          border: `2px solid ${theme.palette.primary.main}`,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}
                      />
                      <Box sx={{ overflow: 'hidden' }}>
                        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 0.3 }}>
                          {user?.name || 'User'}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          color="text.secondary" 
                          sx={{ 
                            maxWidth: '100%',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {user?.email || 'email@example.com'}
                        </Typography>
                      </Box>
                    </Box>
                    <Button 
                      component={RouterLink} 
                      to="/profile" 
                      fullWidth 
                      variant="contained" 
                      color="primary"
                      size="small"
                      sx={{ 
                        mt: 1, 
                        mb: 0.5,
                        py: 0.7,
                        textTransform: 'none',
                        fontWeight: 500,
                        boxShadow: 1
                      }}
                    >
                      Manage Your Account
                    </Button>
                  </Box>
                  <Divider />
                  
                  <MenuItem component={RouterLink} to="/profile" sx={{ py: 1.5 }}>
                    <PersonIcon sx={{ mr: 2, color: theme.palette.primary.main }} />
                    My Profile
                  </MenuItem>
                  
                  <MenuItem component={RouterLink} to="/orders" sx={{ py: 1.5 }}>
                    <ShoppingBagIcon sx={{ mr: 2, color: theme.palette.primary.main }} />
                    My Orders
                  </MenuItem>
                  
                  <MenuItem component={RouterLink} to="/favorites" sx={{ py: 1.5 }}>
                    <FavoriteIcon sx={{ mr: 2, color: theme.palette.primary.main }} />
                    My Favorites
                  </MenuItem>
                  
                  {isAdmin && (
                    <MenuItem component={RouterLink} to="/admin" sx={{ py: 1.5 }}>
                      <DashboardIcon sx={{ mr: 2, color: theme.palette.primary.main }} />
                      Admin Dashboard
                    </MenuItem>
                  )}
                  
                  <Divider />
                  
                  <MenuItem 
                    onClick={handleLogout} 
                    sx={{ 
                      color: theme.palette.error.main, 
                      py: 1.5,
                      '&:hover': {
                        bgcolor: alpha(theme.palette.error.main, 0.1)
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'center' }}>
                      Logout
                    </Box>
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Button
                variant="outlined"
                size="small"
                component={RouterLink}
                to="/login"
                sx={{ 
                  ml: 1.5,
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
            )}
          </Box>
        </Toolbar>
      </Container>
      
      {/* Mobile Drawer - Enhanced with better logo */}
      <Drawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={toggleMobileMenu}
        PaperProps={{
          sx: {
            width: 280,
            bgcolor: theme.palette.background.dark,
            color: theme.palette.primary.contrastText
          }
        }}
      >
        <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box 
              component="img" 
              src={logo} 
              alt="AYPA Logo"
              sx={{ 
                height: 42, 
                mr: 1.5,
                filter: 'drop-shadow(0px 2px 3px rgba(0,0,0,0.2))'
              }}
            />
            <Typography variant="h6" fontWeight={700} color={theme.palette.accent.main}>
              AYPA
            </Typography>
          </Box>
          <IconButton 
            color="inherit" 
            onClick={toggleMobileMenu}
            sx={{ color: 'white' }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        
        <Divider sx={{ borderColor: alpha('#fff', 0.1) }} />
        
        {isAuthenticated && (
          <Box sx={{ p: 2.5, backgroundColor: alpha(theme.palette.primary.main, 0.1) }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar 
                src={user?.avatar ? getUserAvatarUrl(user) : defaultUserAvatar} 
                alt={user?.name}
                sx={{ 
                  width: 50, 
                  height: 50,
                  mr: 2,
                  border: `2px solid ${theme.palette.accent.main}`,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.2)'
                }}
              />
              <Box sx={{ overflow: 'hidden' }}>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 0.3 }}>
                  {user?.name || 'User'}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    opacity: 0.7,
                    maxWidth: '100%',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {user?.email || 'email@example.com'}
                </Typography>
              </Box>
            </Box>
            
            <Button
              component={RouterLink}
              to="/profile"
              fullWidth
              variant="outlined"
              size="small"
              sx={{ 
                borderColor: alpha('#fff', 0.3),
                color: 'white',
                mb: 1,
                '&:hover': {
                  borderColor: theme.palette.accent.main,
                  color: theme.palette.accent.main
                }
              }}
              onClick={toggleMobileMenu}
            >
              Manage Account
            </Button>
          </Box>
        )}
        
        <Box sx={{ p: 2 }}>
          {navItems
            .filter(item => !item.protected || (item.protected && isAuthenticated))
            .map((item) => (
              <Button
                key={item.label}
                component={RouterLink}
                to={item.path}
                startIcon={item.icon}
                fullWidth
                sx={{ 
                  color: 'white', 
                  justifyContent: 'flex-start',
                  py: 1.5,
                  mb: 1,
                  borderRadius: 2,
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.2)
                  }
                }}
                onClick={toggleMobileMenu}
              >
                {item.label}
              </Button>
            ))}
            
          {!isAuthenticated && (
            <Button
              variant="contained"
              fullWidth
              component={RouterLink}
              to="/login"
              sx={{ 
                mt: 2,
                bgcolor: theme.palette.accent.main,
                color: theme.palette.accent.contrastText,
                '&:hover': {
                  bgcolor: theme.palette.accent.dark
                }
              }}
              onClick={toggleMobileMenu}
            >
              Login / Register
            </Button>
          )}
        </Box>
        
        {isAuthenticated && (
          <>
            <Divider sx={{ borderColor: alpha('#fff', 0.1), mt: 'auto' }} />
            <Box sx={{ p: 2 }}>
              <Button
                fullWidth
                variant="text"
                onClick={() => {
                  handleLogout();
                  toggleMobileMenu();
                }}
                sx={{ 
                  color: theme.palette.error.main, 
                  justifyContent: 'center',
                  py: 1.5,
                  mb: 1,
                  borderRadius: 2,
                  '&:hover': {
                    bgcolor: alpha(theme.palette.error.main, 0.1)
                  }
                }}
              >
                Logout
              </Button>
            </Box>
          </>
        )}
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