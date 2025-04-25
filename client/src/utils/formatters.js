/**
 * Utility functions for formatting values throughout the application
 */

/**
 * Format a number as Philippine Peso currency
 * @param {number} amount - The amount to format
 * @param {boolean} showSymbol - Whether to include the ₱ symbol
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, showSymbol = true) => {
  const formatter = new Intl.NumberFormat('en-PH', {
    style: showSymbol ? 'currency' : 'decimal',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  return formatter.format(amount);
};

/**
 * Format a price range for display
 * @param {Array} range - Array containing min and max values [min, max]
 * @returns {string} Formatted price range string
 */
export const formatPriceRange = (range) => {
  if (!range || range.length !== 2) return '';
  return `${formatCurrency(range[0])} - ${formatCurrency(range[1])}`;
};

/**
 * Format a date according to locale
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(dateObj);
}; 