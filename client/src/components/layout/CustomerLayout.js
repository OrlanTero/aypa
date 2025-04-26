import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Container,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  useMediaQuery,
  useTheme,
  Avatar,
  alpha,
  Paper
} from '@mui/material';
import {
  Menu as MenuIcon,
  ShoppingCart,
  Person,
  Home,
  Store,
  Receipt,
  Login,
  Logout,
  PersonAdd,
  AccountCircle,
  History,
  FavoriteBorder,
  Settings,
  KeyboardArrowRight,
  HelpOutline
} from '@mui/icons-material';
import { AuthContext } from '../../context/AuthContext';
import { CartContext } from '../../context/CartContext';
import logo from '../../assets/logo.png';
import { getUserAvatarUrl } from '../../utils/imageUtils';
import Chatbot from '../customer/Chatbot';

const CustomerLayout = ({ children }) => {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const { cart } = useContext(CartContext);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
    navigate('/');
  };

  const menuId = 'primary-account-menu';
  const renderProfileMenu = (
    <Menu
      anchorEl={anchorEl}
      id={menuId}
      keepMounted
      open={Boolean(anchorEl)}
      onClose={handleMenuClose}
      PaperProps={{
        elevation: 3,
        sx: {
          overflow: 'visible',
          filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.15))',
          mt: 1.5,
          borderRadius: 2,
          minWidth: 220,
          '&:before': {
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
      {isAuthenticated ? (
        <>
          <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center' }}>
            <Avatar 
              sx={{ width: 40, height: 40, mr: 1.5, bgcolor: theme.palette.primary.main }}
              src={getUserAvatarUrl(user)}
            />
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                {user?.name || 'Customer'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                {user?.email || ''}
              </Typography>
            </Box>
          </Box>
          <Divider />
          <MenuItem onClick={() => { handleMenuClose(); navigate('/profile'); }}>
            <ListItemIcon>
              <Person fontSize="small" color="primary" />
            </ListItemIcon>
            <ListItemText primary="My Profile" />
            <KeyboardArrowRight fontSize="small" color="action" sx={{ opacity: 0.5 }} />
          </MenuItem>
          <MenuItem onClick={() => { handleMenuClose(); navigate('/orders'); }}>
            <ListItemIcon>
              <Receipt fontSize="small" color="primary" />
            </ListItemIcon>
            <ListItemText primary="My Orders" />
            <KeyboardArrowRight fontSize="small" color="action" sx={{ opacity: 0.5 }} />
          </MenuItem>
          
          <Divider />
          <MenuItem onClick={handleLogout} sx={{ color: theme.palette.error.main }}>
            <ListItemIcon>
              <Logout fontSize="small" sx={{ color: theme.palette.error.main }} />
            </ListItemIcon>
            <ListItemText primary="Sign Out" />
          </MenuItem>
        </>
      ) : (
        <>
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Welcome to AYPA
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sign in to access all features
            </Typography>
          </Box>
          <Divider />
          <MenuItem 
            onClick={() => { handleMenuClose(); navigate('/login'); }}
            sx={{ 
              py: 1.5,
              '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) }
            }}
          >
            <ListItemIcon>
              <Login fontSize="small" color="primary" />
            </ListItemIcon>
            <ListItemText primary="Sign In" />
          </MenuItem>
          <MenuItem 
            onClick={() => { handleMenuClose(); navigate('/register'); }}
            sx={{ 
              py: 1.5,
              '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) }
            }}
          >
            <ListItemIcon>
              <PersonAdd fontSize="small" color="primary" />
            </ListItemIcon>
            <ListItemText primary="Create Account" />
          </MenuItem>
        </>
      )}
    </Menu>
  );

  const drawer = (
    <Box sx={{ width: 250 }} role="presentation" onClick={handleDrawerToggle}>
      <List>
        <ListItem component={Link} to="/">
          <ListItemIcon><Home /></ListItemIcon>
          <ListItemText primary="Home" />
        </ListItem>
        <ListItem component={Link} to="/products">
          <ListItemIcon><Store /></ListItemIcon>
          <ListItemText primary="Products" />
        </ListItem>
        <ListItem component={Link} to="/support">
          <ListItemIcon><HelpOutline /></ListItemIcon>
          <ListItemText primary="Support" />
        </ListItem>
        {isAuthenticated && (
          <>
            <ListItem component={Link} to="/cart">
              <ListItemIcon>
                <Badge badgeContent={cart?.items?.length || 0} color="primary">
                  <ShoppingCart />
                </Badge>
              </ListItemIcon>
              <ListItemText primary="Cart" />
            </ListItem>
            <ListItem component={Link} to="/orders">
              <ListItemIcon><Receipt /></ListItemIcon>
              <ListItemText primary="Orders" />
            </ListItem>
            <ListItem component={Link} to="/profile">
              <ListItemIcon><Person /></ListItemIcon>
              <ListItemText primary="Profile" />
            </ListItem>
          </>
        )}
      </List>
      <Divider />
      <List>
        {isAuthenticated ? (
          <ListItem button onClick={handleLogout}>
            <ListItemIcon><Logout /></ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItem>
        ) : (
          <>
            <ListItem component={Link} to="/login">
              <ListItemIcon><Login /></ListItemIcon>
              <ListItemText primary="Login" />
            </ListItem>
            <ListItem component={Link} to="/register">
              <ListItemIcon><PersonAdd /></ListItemIcon>
              <ListItemText primary="Register" />
            </ListItem>
          </>
        )}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="sticky">
        <Toolbar sx={{ px: { xs: 1, sm: 2 }, py: { xs: 0.5, sm: 0 } }}>
          {isMobile && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={handleDrawerToggle}
              sx={{ mr: 1 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <Box
            component={Link}
            to="/"
            sx={{ 
              display: 'flex',
              alignItems: 'center',
              flexGrow: 1, 
              textDecoration: 'none', 
              color: 'white'
            }}
          >
            <img 
              src={logo} 
              alt="AYPA Logo" 
              style={{ 
                height: isMobile ? 28 : 35,
                marginRight: isMobile ? 6 : 10 
              }} 
            />
            <Typography
              variant={isMobile ? "body1" : "h6"}
              sx={{ 
                fontWeight: 'bold'
              }}
            >
              AYPA
            </Typography>
          </Box>

          {!isMobile && (
            <Box sx={{ display: 'flex', mx: 2 }}>
              <Button color="inherit" component={Link} to="/">
                Home
              </Button>
              <Button color="inherit" component={Link} to="/products">
                Products
              </Button>
              <Button color="inherit" component={Link} to="/support">
                Support
              </Button>
              {isAuthenticated && (
                <Button color="inherit" component={Link} to="/orders">
                  Orders
                </Button>
              )}
            </Box>
          )}

          <Box sx={{ display: 'flex' }}>
            {isAuthenticated && (
              <IconButton
                color="inherit"
                component={Link}
                to="/cart"
                sx={{ mr: 1 }}
              >
                <Badge 
                  badgeContent={cart?.items?.length || 0} 
                  color="secondary"
                  sx={{
                    '& .MuiBadge-badge': {
                      fontWeight: 'bold',
                      minWidth: '18px',
                      height: '18px'
                    }
                  }}
                >
                  <ShoppingCart />
                </Badge>
              </IconButton>
            )}
            
            <IconButton
              edge="end"
              aria-label="account of current user"
              aria-controls={menuId}
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
              sx={{ 
                ml: 0.5,
                border: isAuthenticated ? `2px solid ${alpha('#fff', 0.5)}` : 'none',
                padding: isAuthenticated ? '3px' : 'default'
              }}
            >
              {isAuthenticated ? (
                <Avatar 
                  sx={{ width: isMobile ? 24 : 28, height: isMobile ? 24 : 28 }}
                  src={getUserAvatarUrl(user)}
                />
              ) : (
                <Person />
              )}
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        sx={{
          '& .MuiDrawer-paper': {
            width: { xs: '80%', sm: 250 },
            maxWidth: 320
          }
        }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
          <img src={logo} alt="AYPA Logo" style={{ height: 30, marginRight: 10 }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>AYPA Menu</Typography>
        </Box>
        {drawer}
      </Drawer>

      {renderProfileMenu}

      <Box component="main" sx={{ flexGrow: 1, pt: { xs: 1, sm: 2 }, pb: { xs: 4, sm: 6 } }}>
        <Container maxWidth="xl" sx={{ px: { xs: 1.5, sm: 2, md: 3 } }}>
          {children}
        </Container>
      </Box>

      <Box
        component="footer"
        sx={{
          py: { xs: 2, sm: 3 },
          px: { xs: 1.5, sm: 2 },
          mt: 'auto',
          backgroundColor: (theme) =>
            theme.palette.mode === 'light'
              ? theme.palette.grey[200]
              : theme.palette.grey[800],
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="body1" align="center">
            © {new Date().getFullYear()} AYPA E-commerce. All rights reserved.
          </Typography>
        </Container>
      </Box>
      
      <Chatbot />
    </Box>
  );
};

export default CustomerLayout; 