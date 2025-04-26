import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Divider,
  Avatar,
  IconButton,
  Alert,
  Snackbar,
  CircularProgress,
  Tab,
  Tabs
} from '@mui/material';
import { PhotoCamera, Save } from '@mui/icons-material';
import { AuthContext } from '../../context/AuthContext';
import { userAPI } from '../../utils/api';
import { getUserAvatarUrl } from '../../utils/imageUtils';
import defaultUserAvatar from '../../assets/default-avatar.png';
import { setDocumentTitle, PAGE_TITLES } from '../../utils/titleUtils';

const Profile = () => {
  const { user, updateUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    }
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  useEffect(() => {
    setDocumentTitle(PAGE_TITLES.ADMIN_PROFILE);
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: {
          street: user.address?.street || '',
          city: user.address?.city || '',
          state: user.address?.state || '',
          zipCode: user.address?.zipCode || '',
          country: user.address?.country || ''
        }
      });
    }
  }, [user]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      // Handle nested address fields
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Create FormData object for file upload
      const data = new FormData();
      data.append('name', formData.name);
      data.append('email', formData.email);
      data.append('phone', formData.phone);
      
      // Add address fields
      Object.entries(formData.address).forEach(([key, value]) => {
        data.append(`address[${key}]`, value);
      });
      
      // Add avatar if selected
      if (avatar) {
        data.append('avatar', avatar);
      }

      // Send update request
      const response = await userAPI.updateProfile(data);
      
      // Update user context
      updateUser(response.data);
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await userAPI.updatePassword(
        passwordData.currentPassword, 
        passwordData.newPassword
      );
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      
      // Reset password fields
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          My Profile
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Manage your account information and settings
        </Typography>
      </Box>

      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        indicatorColor="primary"
        textColor="primary"
        sx={{ mb: 3 }}
      >
        <Tab label="Personal Information" />
        <Tab label="Change Password" />
      </Tabs>

      {activeTab === 0 && (
        <Paper sx={{ p: 4 }}>
          <Box component="form" onSubmit={handleProfileSubmit}>
            <Grid container spacing={4}>
              <Grid item xs={12} md={4} sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center'
              }}>
                <Avatar
                  src={avatarPreview || (user && getUserAvatarUrl(user))}
                  sx={{ 
                    width: 150, 
                    height: 150,
                    mb: 2,
                    boxShadow: 2
                  }}
                >
                </Avatar>
                <input
                  accept="image/*"
                  id="avatar-upload"
                  type="file"
                  onChange={handleAvatarChange}
                  style={{ display: 'none' }}
                />
                <label htmlFor="avatar-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<PhotoCamera />}
                  >
                    Upload Photo
                  </Button>
                </label>
              </Grid>

              <Grid item xs={12} md={8}>
                <Typography variant="h6" gutterBottom>
                  Basic Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </Grid>
                </Grid>

                <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
                  Address Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Street Address"
                      name="address.street"
                      value={formData.address.street}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="City"
                      name="address.city"
                      value={formData.address.city}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="State/Province"
                      name="address.state"
                      value={formData.address.state}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Postal Code"
                      name="address.zipCode"
                      value={formData.address.zipCode}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Country"
                      name="address.country"
                      value={formData.address.country}
                      onChange={handleChange}
                    />
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                  >
                    Save Changes
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      )}

      {activeTab === 1 && (
        <Paper sx={{ p: 4 }}>
          <Box component="form" onSubmit={handlePasswordSubmit}>
            <Typography variant="h6" gutterBottom>
              Change Password
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Current Password"
                  name="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="New Password"
                  name="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Confirm New Password"
                  name="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                  >
                    Update Password
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      )}

      <Snackbar open={success} autoHideDuration={6000} onClose={() => setSuccess(false)}>
        <Alert severity="success" onClose={() => setSuccess(false)}>
          Profile updated successfully!
        </Alert>
      </Snackbar>

      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Profile; 