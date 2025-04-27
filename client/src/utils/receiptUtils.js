/**
 * Utility functions for receipt generation and printing
 */
import { formatCurrency, formatDate } from './formatters';

/**
 * Generate a printable receipt HTML from receipt data
 * @param {Object} receipt - The receipt data from the API
 * @returns {string} HTML string for printing
 */
export const generateReceiptHTML = (receipt) => {
  if (!receipt) return '';

  const receiptDate = formatDate(receipt.date);
  const paymentDate = receipt.paymentDate ? formatDate(receipt.paymentDate) : 'N/A';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Receipt #${receipt.receiptId}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          color: #333;
        }
        .receipt {
          max-width: 800px;
          margin: 0 auto;
          border: 1px solid #ddd;
          padding: 20px;
        }
        .receipt-header {
          text-align: center;
          margin-bottom: 20px;
          border-bottom: 1px solid #ddd;
          padding-bottom: 10px;
        }
        .receipt-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        .receipt-info-block {
          width: 48%;
        }
        .receipt-items {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        .receipt-items th, .receipt-items td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        .receipt-items th {
          background-color: #f2f2f2;
        }
        .receipt-total {
          text-align: right;
          margin-top: 20px;
          border-top: 1px solid #ddd;
          padding-top: 10px;
        }
        .receipt-footer {
          text-align: center;
          margin-top: 30px;
          font-size: 12px;
          color: #777;
        }
        @media print {
          body {
            padding: 0;
          }
          .receipt {
            border: none;
          }
          .no-print {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="receipt">
        <div class="receipt-header">
          <h1>AYPA E-commerce</h1>
          <h2>Official Receipt</h2>
          <p>Receipt: #${receipt.receiptId}</p>
          <p>Order: #${receipt.orderNumber}</p>
          <p>Date: ${receiptDate}</p>
        </div>
        
        <div class="receipt-info">
          <div class="receipt-info-block">
            <h3>Customer Details</h3>
            <p><strong>Name:</strong> ${receipt.customer.name}</p>
            <p><strong>Email:</strong> ${receipt.customer.email}</p>
          </div>
          <div class="receipt-info-block">
            <h3>Payment Details</h3>
            <p><strong>Method:</strong> ${receipt.paymentMethod.replace('_', ' ').toUpperCase()}</p>
            <p><strong>Date:</strong> ${paymentDate}</p>
            ${receipt.paymentReference ? `<p><strong>Reference:</strong> ${receipt.paymentReference}</p>` : ''}
            ${receipt.verifiedBy ? `<p><strong>Verified by:</strong> ${receipt.verifiedBy.name}</p>` : ''}
          </div>
        </div>
        
        <div class="receipt-info">
          <div class="receipt-info-block">
            <h3>Shipping Address</h3>
            <p>${receipt.shippingAddress.street}</p>
            <p>${receipt.shippingAddress.city}, ${receipt.shippingAddress.state} ${receipt.shippingAddress.zipCode}</p>
            <p>${receipt.shippingAddress.country}</p>
          </div>
        </div>
        
        <table class="receipt-items">
          <thead>
            <tr>
              <th>Item</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${receipt.items.map(item => `
              <tr>
                <td>${item.product.name}</td>
                <td>${item.quantity}</td>
                <td>${formatCurrency(item.price)}</td>
                <td>${formatCurrency(item.price * item.quantity)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="receipt-total">
          <p><strong>Subtotal:</strong> ${formatCurrency(receipt.subtotal)}</p>
          <p><strong>Delivery Fee:</strong> ${formatCurrency(receipt.deliveryFee)}</p>
          <h3>Total: ${formatCurrency(receipt.totalAmount)}</h3>
        </div>
        
        <div class="receipt-footer">
          <p>Thank you for shopping with AYPA E-commerce!</p>
          <p>For any questions or concerns, please contact customer support.</p>
        </div>
      </div>
      
      <div class="no-print" style="text-align: center; margin-top: 20px;">
        <button onClick="window.print()">Print Receipt</button>
        <button onClick="window.close()">Close</button>
      </div>
    </body>
    </html>
  `;
};

/**
 * Generate and print a receipt in a new window
 * @param {Object} receiptData - The receipt data from the API
 */
export const printReceipt = (receiptData) => {
  const receiptHTML = generateReceiptHTML(receiptData);
  
  // Open a new window for the receipt
  const printWindow = window.open('', '_blank', 'width=800,height=600');
  printWindow.document.write(receiptHTML);
  printWindow.document.close();
}; 