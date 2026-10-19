// ──────────────────────────────────────────────
// 📦 ORDER TYPES — Shared types for orders
// ──────────────────────────────────────────────

export interface OrderItem {
  id: number;
  name: string;
  description: string;
  price: number;
  qty: number;
  emoji: string;
}

export interface OrderCustomer {
  name: string;
  phone: string;   // e.g. "9876543210" (10 digits, no country code)
}

export interface OrderSummary {
  subtotal: number;
  gstAmount: number;
  gstRate: number;
  discountAmount: number;
  discountCode: string | null;
  total: number;
}

export interface SendReceiptRequest {
  // 🧾 Order details
  billNo: string;
  dateTime: string;              // e.g. "19 Oct 2026, 04:32 PM"
  cashier: string;

  // 👤 Customer
  customer: OrderCustomer;

  // 🛒 Items
  items: OrderItem[];

  // 💰 Payment
  paymentMethod: 'cash' | 'upi' | 'split';
  transactionId?: string;        // UPI transaction ID

  // 📊 Summary
  summary: OrderSummary;

  // 📝 Notes
  kitchenNote?: string;
}

export interface SendReceiptResponse {
  success: boolean;
  message: string;
  billNo: string;
  whatsappSent: boolean;
  pdfPath?: string;
}

export interface ShopOrder {
  id: string;
  billNo: string;
  customer: {
    name: string;
    phone: string;
  };
  items: {
    id: number;
    name: string;
    description?: string;
    price: number;
    qty: number;
    emoji?: string;
  }[];
  paymentMethod: 'cash' | 'upi' | 'split';
  transactionId?: string;
  status: 'incoming' | 'preparing' | 'ready' | 'completed';
  urgent: boolean;
  kitchenNote?: string;
  summary: OrderSummary;
  createdAt: string;
  time: string;
  timer?: number;
}

