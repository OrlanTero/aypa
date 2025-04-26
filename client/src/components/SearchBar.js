import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import defaultProductImage from '../assets/default-product.jpg';
import { 
  InputBase, 
  IconButton, 
  Paper, 
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  CircularProgress,
  Divider
} from '@mui/material';
import { 
  Search as SearchIcon,
  Close as CloseIcon 
} from '@mui/icons-material';

// In a real app, you would fetch products from an API
const searchProducts = async (query) => {
  // Simulating API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Mock data for demonstration
  const allProducts = [
    { id: 1, name: 'Smartphone X', image: '/images/products/smartphone.jpg', price: 999 },
    { id: 2, name: 'Laptop Pro', image: '/images/products/laptop.jpg', price: 1299 },
    { id: 3, name: 'Wireless Headphones', image: '/images/products/headphones.jpg', price: 199 },
    { id: 4, name: 'Smart Watch', image: '/images/products/smartwatch.jpg', price: 249 },
    { id: 5, name: 'Bluetooth Speaker', image: '/images/products/speaker.jpg', price: 99 },
  ];
  
  if (!query) return [];
  
  return allProducts.filter(product => 
    product.name.toLowerCase().includes(query.toLowerCase())
  );
};

const SearchBar = ({ onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSearchChange = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    
    setIsLoading(true);
    try {
      const results = await searchProducts(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      onClose();
    }
  };

  const handleProductClick = (productId) => {
    navigate(`/products/${productId}`);
    onClose();
  };

  return (
    <Box sx={{ width: '100%', position: 'relative' }}>
      <Paper 
        component="form" 
        onSubmit={handleSubmit}
        sx={{ 
          p: '2px 4px', 
          display: 'flex', 
          alignItems: 'center',
          width: '100%',
          boxShadow: 'none',
          border: '1px solid #e0e0e0',
          borderRadius: 2
        }}
      >
        <IconButton type="submit" sx={{ p: '10px' }} aria-label="search">
          <SearchIcon />
        </IconButton>
        <InputBase
          sx={{ ml: 1, flex: 1 }}
          placeholder="Search for products..."
          value={searchQuery}
          onChange={handleSearchChange}
          autoFocus
        />
        <IconButton sx={{ p: '10px' }} aria-label="close" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Paper>

      {/* Search Results Dropdown */}
      {searchQuery.length >= 2 && (
        <Paper 
          sx={{ 
            position: 'absolute', 
            width: '100%', 
            maxHeight: 350, 
            overflow: 'auto',
            mt: 1,
            zIndex: 10,
            borderRadius: 2,
            boxShadow: 3
          }}
        >
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : searchResults.length > 0 ? (
            <List>
              {searchResults.map((product, index) => (
                <React.Fragment key={product.id}>
                  <ListItem 
                    button 
                    onClick={() => handleProductClick(product.id)}
                    sx={{ py: 1 }}
                  >
                    <ListItemAvatar>
                      <Avatar 
                        src={product.image || defaultProductImage} 
                        alt={product.name}
                        variant="rounded"
                        sx={{ width: 50, height: 50 }}
                      />
                    </ListItemAvatar>
                    <ListItemText 
                      primary={product.name}
                      secondary={`$${product.price}`}
                      primaryTypographyProps={{ fontWeight: 'medium' }}
                    />
                  </ListItem>
                  {index < searchResults.length - 1 && <Divider />}
                </React.Fragment>
              ))}
              <Divider />
              <ListItem 
                button 
                onClick={handleSubmit}
                sx={{ justifyContent: 'center', color: 'primary.main' }}
              >
                <Typography>
                  See all results for "{searchQuery}"
                </Typography>
              </ListItem>
            </List>
          ) : (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography color="text.secondary">
                No products found for "{searchQuery}"
              </Typography>
            </Box>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default SearchBar; 