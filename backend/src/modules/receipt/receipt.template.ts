// ╔══════════════════════════════════════════════════════════════════════╗
// ║  🧾 RECEIPT HTML TEMPLATE                                          ║
// ║  This generates the beautiful PDF receipt matching the design.     ║
// ║  Puppeteer renders this HTML into a PDF file.                      ║
// ╚══════════════════════════════════════════════════════════════════════╝

import { SendReceiptRequest } from '../../types/order.types';
import { SHOP_CONFIG } from '../../config/shop.config';

export function generateReceiptHTML(order: SendReceiptRequest): string {
  const shop = SHOP_CONFIG;

  // Build items rows
  const itemsHTML = order.items
    .map(
      (item, index) => `
      <tr>
        <td style="padding:10px 0;color:#555;vertical-align:top;">${index + 1}</td>
        <td style="padding:10px 0;vertical-align:top;">
          <div style="font-weight:600;color:#2d2d2d;">${item.name}</div>
          ${item.description ? `<div style="font-size:11px;color:#999;margin-top:2px;">${item.description}</div>` : ''}
        </td>
        <td style="padding:10px 0;text-align:center;color:#555;vertical-align:top;">${item.qty}</td>
        <td style="padding:10px 0;text-align:right;color:#555;vertical-align:top;">₹${item.price}</td>
        <td style="padding:10px 0;text-align:right;font-weight:600;color:#2d2d2d;vertical-align:top;">₹${item.price * item.qty}</td>
      </tr>
    `,
    )
    .join('');

  // Payment method display
  const paymentLabel =
    order.paymentMethod === 'upi'
      ? 'UPI'
      : order.paymentMethod === 'cash'
        ? 'Cash'
        : 'Split (Cash + UPI)';

  // Format current time
  const timeStr = new Date().toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Dancing+Script:wght@700&display=swap');
    
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: 'Inter', -apple-system, sans-serif;
      background: white;
      color: #2d2d2d;
      width: 380px;
      margin: 0 auto;
      padding: 30px 24px;
    }

    .header {
      text-align: center;
      margin-bottom: 20px;
    }

    .logo-emoji {
      font-size: 42px;
      margin-bottom: 4px;
    }

    .shop-name {
      font-size: 28px;
      font-weight: 800;
      color: #2d2d2d;
      letter-spacing: -0.5px;
    }

    .shop-tagline {
      font-size: 10px;
      color: #999;
      letter-spacing: 3px;
      text-transform: uppercase;
      margin: 4px 0 12px;
    }

    .shop-address {
      font-size: 12px;
      color: #666;
      line-height: 1.5;
    }

    .shop-phone {
      font-size: 12px;
      color: #444;
      margin-top: 6px;
      font-weight: 500;
    }

    .dashed-line {
      border: none;
      border-top: 1.5px dashed #ddd;
      margin: 16px 0;
    }

    .bill-info {
      margin: 14px 0;
    }

    .bill-info-row {
      display: flex;
      margin-bottom: 6px;
      font-size: 12.5px;
    }

    .bill-info-label {
      font-weight: 700;
      color: #2d2d2d;
      width: 130px;
    }

    .bill-info-sep {
      color: #999;
      margin: 0 8px;
    }

    .bill-info-value {
      color: #444;
    }

    .items-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12.5px;
      margin: 10px 0;
    }

    .items-table thead th {
      text-align: left;
      font-weight: 700;
      color: #2d2d2d;
      padding: 8px 0;
      border-bottom: 1.5px solid #eee;
      font-size: 11.5px;
    }

    .items-table thead th:nth-child(3),
    .items-table thead th:nth-child(4),
    .items-table thead th:nth-child(5) {
      text-align: right;
    }
    
    .items-table thead th:nth-child(3) {
      text-align: center;
    }

    .summary-section {
      margin: 10px 0;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      margin-bottom: 6px;
    }

    .summary-label {
      font-weight: 600;
      color: #444;
    }

    .summary-value {
      color: #444;
    }

    .discount-row .summary-label,
    .discount-row .summary-value {
      color: #e8783a;
    }

    .total-row {
      display: flex;
      justify-content: space-between;
      font-size: 20px;
      font-weight: 800;
      margin: 14px 0 6px;
      padding-top: 10px;
      border-top: 2px solid #2d2d2d;
    }

    .total-value {
      color: #2d2d2d;
      font-size: 22px;
    }

    .payment-info {
      margin: 16px 0;
      font-size: 12px;
      color: #666;
    }

    .payment-method {
      font-weight: 600;
      color: #444;
      margin-bottom: 6px;
    }

    .upi-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 4px;
    }

    .upi-badge {
      background: linear-gradient(135deg, #5f259f, #e8783a);
      color: white;
      padding: 2px 10px;
      border-radius: 4px;
      font-weight: 700;
      font-size: 11px;
      letter-spacing: 1px;
    }

    .txn-id {
      font-size: 11.5px;
      color: #666;
    }

    .footer {
      text-align: center;
      margin-top: 20px;
      padding: 16px;
      background: linear-gradient(135deg, #fff8f3, #fff3eb);
      border-radius: 12px;
    }

    .footer-thanks {
      font-family: 'Dancing Script', cursive;
      font-size: 22px;
      color: #e8783a;
      font-weight: 700;
    }

    .footer-heart {
      color: #e8783a;
      font-size: 18px;
    }

    .footer-tagline {
      font-size: 11px;
      color: #e8783a;
      margin-top: 6px;
      letter-spacing: 0.5px;
    }

    .computer-generated {
      text-align: center;
      font-size: 10px;
      color: #bbb;
      margin-top: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .computer-generated::before,
    .computer-generated::after {
      content: '';
      flex: 1;
      height: 1px;
      background: #ddd;
      max-width: 60px;
    }
  </style>
</head>
<body>

  <!-- Header -->
  <div class="header">
    <div class="logo-emoji">🧇</div>
    <div class="shop-name">${shop.name}</div>
    <div class="shop-tagline">${shop.tagline}</div>
    <div class="shop-phone">📞 ${shop.phone}</div>
  </div>

  <hr class="dashed-line">

  <!-- Bill Info -->
  <div class="bill-info">
    <div class="bill-info-row">
      <span class="bill-info-label">Bill No</span>
      <span class="bill-info-sep">:</span>
      <span class="bill-info-value">${order.billNo}</span>
    </div>
    <div class="bill-info-row">
      <span class="bill-info-label">Customer Name</span>
      <span class="bill-info-sep">:</span>
      <span class="bill-info-value">${order.customer?.name || 'Walk-in Customer'}</span>
    </div>
    <div class="bill-info-row">
      <span class="bill-info-label">Date & Time</span>
      <span class="bill-info-sep">:</span>
      <span class="bill-info-value">${order.dateTime}</span>
    </div>
    <div class="bill-info-row">
      <span class="bill-info-label">Cashier</span>
      <span class="bill-info-sep">:</span>
      <span class="bill-info-value">${order.cashier}</span>
    </div>
    <div class="bill-info-row">
      <span class="bill-info-label">Payment Method</span>
      <span class="bill-info-sep">:</span>
      <span class="bill-info-value">${paymentLabel}</span>
    </div>
  </div>

  <hr class="dashed-line">

  <!-- Items Table -->
  <table class="items-table">
    <thead>
      <tr>
        <th style="width:30px;">No.</th>
        <th>Item</th>
        <th style="width:40px;text-align:center;">Qty</th>
        <th style="width:65px;text-align:right;">Rate (₹)</th>
        <th style="width:75px;text-align:right;">Amount (₹)</th>
      </tr>
    </thead>
    <tbody>
      ${itemsHTML}
    </tbody>
  </table>

  <hr class="dashed-line">

  <!-- Summary -->
  <div class="summary-section">
    <div class="summary-row">
      <span class="summary-label">Subtotal</span>
      <span class="summary-value">₹${order.summary.subtotal}</span>
    </div>
    ${
      order.summary.discountAmount > 0
        ? `
    <div class="summary-row discount-row">
      <span class="summary-label">Discount${order.summary.discountCode ? ` (${order.summary.discountCode})` : ''}</span>
      <span class="summary-value">- ₹${order.summary.discountAmount}</span>
    </div>`
        : ''
    }
  </div>

  <!-- Total -->
  <div class="total-row">
    <span>Total</span>
    <span class="total-value">₹${order.summary.discountAmount > 0 ? (order.summary.subtotal - order.summary.discountAmount) : (order.summary.total != null && (!order.summary.gstAmount || order.summary.gstAmount === 0) ? order.summary.total : order.summary.subtotal)}</span>
  </div>

  <!-- Payment Info -->
  <div class="payment-info">
    <div class="payment-method">Paid via ${paymentLabel}</div>
    ${
      order.paymentMethod === 'upi' && order.transactionId
        ? `
    <div class="upi-row">
      <span class="upi-badge">UPI▶</span>
      <span class="txn-id">Txn ID: ${order.transactionId}</span>
      <span>${timeStr}</span>
    </div>`
        : `<div style="font-size:11px;color:#999;">${timeStr}</div>`
    }
  </div>

  <!-- Footer -->
  <div class="footer">
    <div class="footer-thanks">${shop.footerMessage}</div>
    <div class="footer-tagline">${shop.footerTagline}</div>
  </div>

  <!-- Computer Generated -->
  <div class="computer-generated">${shop.footerNote}</div>

</body>
</html>
  `;
}
