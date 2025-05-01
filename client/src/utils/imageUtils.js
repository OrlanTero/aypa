import defaultProductImage from '../assets/default-product.jpg';
import defaultUserAvatar from '../assets/default-avatar.png';
import { API_BASE_URL } from '../constants/apiConfig';

/**
 * Helper function to get the full image URL from a relative path
 * @param {string} imagePath - The image path returned from the server
 * @param {string} type - Type of image ('product' or 'avatar')
 * @returns {string} - The full image URL
 */
export const getImageUrl = (imagePath, type = 'product') => {
  if (!imagePath) return null;
  
  console.log('getImageUrl processing path:', imagePath, 'type:', type);
  
  // Check if it's already a full URL (e.g. from a CDN, S3, or external source)
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    console.log('Already a full URL, returning as is');
    return imagePath;
  }

  // For local uploads, we need to construct the full URL
  const baseUrl = API_BASE_URL.replace('/api', ''); // Remove /api from the base URL
  
  // Normalize path - replace Windows backslashes with forward slashes
  let normalizedPath = imagePath.replace(/\\/g, '/');
  
  // Get just the filename regardless of path format
  const filename = normalizedPath.split('/').pop();
  
  // Use the appropriate path structure based on image type
  const finalPath = type === 'avatar' 
    ? `uploads/avatars/${filename}` 
    : `uploads/products/${filename}`;
  
  const fullUrl = `${baseUrl}/${finalPath}`;
  console.log('Constructed URL:', fullUrl);
  return fullUrl;
};

/**
 * Get a product image URL with fallback to default image
 * @param {Object} product - The product object
 * @param {number} index - Optional index for multiple images
 * @returns {string} - The image URL
 */
export const getProductImageUrl = (product, index = 0) => {
  if (!product || !product.imageUrls || product.imageUrls.length === 0) {
    return defaultProductImage;
  }

  const imageUrl = product.imageUrls[index] 
    ? getImageUrl(product.imageUrls[index]) 
    : defaultProductImage;
  
  return imageUrl;
};

/**
 * Get a user avatar URL with fallback to default avatar
 * @param {Object} user - The user object
 * @returns {string} - The avatar URL
 */
export const getUserAvatarUrl = (user) => {
  if (!user || !user.avatar) {
    console.log('No user avatar found, using default');
    return defaultUserAvatar;
  }
  
  return getImageUrl(user.avatar, 'avatar');
};

/**
 * Creates an image error handler function
 * @param {function} onError - Optional callback when error occurs
 * @param {string} defaultSrc - Default image source to use on error
 * @returns {function} - Function to handle image error
 */
export const handleImageError = (defaultSrc = defaultProductImage, onError) => (event) => {
  console.warn(`Image failed to load: ${event.target.src}`, event);
  if (onError) onError(event);
  event.target.onerror = null; // Prevent infinite error loop
  event.target.src = defaultSrc;
}; 