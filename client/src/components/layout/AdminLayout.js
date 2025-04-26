import React, { useState, useContext } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  alpha
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  ShoppingCart as OrdersIcon,
  BarChart as ReportsIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  KeyboardArrowRight,
  AccountCircle
} from '@mui/icons-material';
import { styled, useTheme } from '@mui/material/styles';
import { getUserAvatarUrl } from '../../utils/imageUtils';
import logo from '../../assets/logo.png';

import { AuthContext } from '../../context/AuthContext';

const drawerWidth = 240;

const AdminLayout = ({ children }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleUserMenuOpen = (event) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin/dashboard' },
    { text: 'Inventory', icon: <InventoryIcon />, path: '/admin/inventory' },
    { text: 'Orders', icon: <OrdersIcon />, path: '/admin/orders' },
    { text: 'Reports', icon: <ReportsIcon />, path: '/admin/reports' },
    { text: 'Profile', icon: <PersonIcon />, path: '/admin/profile' }
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  const drawer = (
    <div>
      <Toolbar sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center',
        py: 2,
        backgroundColor: 'primary.dark'
      }}>
        <Box sx={{ mb: 1 }}>
          <img src={logo} alt="AYPA Logo" style={{ height: 40, marginBottom: 8 }} />
        </Box>
        <Typography variant="h6" noWrap component="div" color="white">
          AYPA Admin
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              component={RouterLink}
              to={item.path}
              selected={isActive(item.path)}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: 'rgba(25, 118, 210, 0.12)',
                },
                '&.Mui-selected:hover': {
                  backgroundColor: 'rgba(25, 118, 210, 0.2)',
                },
              }}
            >
              <ListItemIcon sx={{ 
                color: isActive(item.path) ? 'primary.main' : 'inherit' 
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                primaryTypographyProps={{
                  fontWeight: isActive(item.path) ? 'bold' : 'regular',
                  color: isActive(item.path) ? 'primary.main' : 'inherit',
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          boxShadow: 2
        }}
      >
        <Toolbar sx={{ px: { xs: 1, sm: 2 }, py: { xs: 0.5, sm: 0 } }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography 
            variant="h6" 
            noWrap 
            component="div" 
            sx={{ 
              flexGrow: 1,
              fontSize: { xs: '1rem', sm: '1.25rem' } 
            }}
          >
            {/* Get the current page title based on location */}
            {menuItems.find(item => isActive(item.path))?.text || 'Admin Panel'}
          </Typography>
          
          {/* Admin User Menu */}
          <Tooltip title="Account settings">
            <IconButton
              onClick={handleUserMenuOpen}
              size="small"
              edge="end"
              aria-haspopup="true"
              color="inherit"
              sx={{ 
                border: `2px solid ${alpha('#fff', 0.5)}`,
                padding: '3px'
              }}
            >
              <Avatar 
                sx={{ 
                  width: { xs: 28, sm: 32 }, 
                  height: { xs: 28, sm: 32 },
                  bgcolor: 'secondary.main' 
                }}
                src={getUserAvatarUrl(user)}
              >
                {user?.name?.charAt(0) || 'A'}
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
          >
            <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center' }}>
              <Avatar 
                sx={{ width: 40, height: 40, mr: 1.5, bgcolor: theme.palette.secondary.main }}
                src={getUserAvatarUrl(user)}
              >
                {user?.name?.charAt(0) || 'A'}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                  {user?.name || 'Admin'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                  Administrator
                </Typography>
              </Box>
            </Box>
            <Divider />
            <MenuItem onClick={() => { handleUserMenuClose(); navigate('/admin/profile'); }}>
              <ListItemIcon>
                <PersonIcon fontSize="small" color="primary" />
              </ListItemIcon>
              <ListItemText primary="My Profile" />
              <KeyboardArrowRight fontSize="small" color="action" sx={{ opacity: 0.5 }} />
            </MenuItem>
            <MenuItem onClick={() => { handleUserMenuClose(); navigate('/admin/settings'); }}>
              <ListItemIcon>
                <SettingsIcon fontSize="small" color="primary" />
              </ListItemIcon>
              <ListItemText primary="Settings" />
              <KeyboardArrowRight fontSize="small" color="action" sx={{ opacity: 0.5 }} />
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout} sx={{ color: theme.palette.error.main }}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" sx={{ color: theme.palette.error.main }} />
              </ListItemIcon>
              <ListItemText primary="Sign Out" />
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="admin menu"
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: { xs: '80%', sm: drawerWidth },
              maxWidth: 320
            },
          }}
        >
          {drawer}
        </Drawer>
        
        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      
      <Box
        component="main"
        sx={{ 
          flexGrow: 1,
          p: { xs: 2, sm: 3 }, 
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          backgroundColor: '#f5f8fa'
        }}
      >
        <Toolbar /> {/* This adds space below the AppBar */}
        {children}
      </Box>
    </Box>
  );
};

export default AdminLayout; 