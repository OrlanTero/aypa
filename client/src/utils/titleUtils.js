/**
 * Utility for managing document titles across the application
 */

/**
 * Sets the document title with optional prefix/suffix
 * @param {string} title - The page-specific title
 */
export const setDocumentTitle = (title) => {
  const baseTitle = 'AYPA';
  document.title = title ? `${title} | ${baseTitle}` : baseTitle;
};

/**
 * Page title constants
 */
export const PAGE_TITLES = {
  HOME: 'Home',
  PRODUCTS: 'Products',
  PRODUCT_DETAIL: 'Product Details',
  CART: 'Shopping Cart',
  CHECKOUT: 'Checkout',
  ORDERS: 'My Orders',
  ORDER_DETAIL: 'Order Details',
  PROFILE: 'My Profile',
  SUPPORT: 'Customer Support',
  LOGIN: 'Sign In',
  REGISTER: 'Create Account',
  FAVORITES: 'My Favorites',
  NOT_FOUND: 'Page Not Found',
  // Admin pages
  ADMIN_DASHBOARD: 'Admin Dashboard',
  ADMIN_INVENTORY: 'Inventory Management',
  ADMIN_ORDERS: 'Order Management',
  ADMIN_REPORTS: 'Reports',
  ADMIN_PROFILE: 'Admin Profile',
  ADMIN_MESSAGES: 'Customer Support Messages',
  ADMIN_LOGIN: 'Admin Login'
}; 