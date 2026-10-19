// ─────────────────────────────────────────────────────────────
// 🛡️ CENTRALIZED VALIDATION UTILITY — MOKKO SHOP MANAGEMENT
// Use this across all pages instead of duplicating validation code!
// ─────────────────────────────────────────────────────────────

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates Indian 10-digit mobile number
 * - Must be exactly 10 digits
 * - Must start with 6, 7, 8, or 9
 */
export function validatePhone(phone: string): ValidationResult {
  if (!phone || phone.trim() === '') {
    return { isValid: false, error: 'Phone number is required' };
  }

  const clean = phone.replace(/\D/g, '');

  if (clean.length < 10) {
    return {
      isValid: false,
      error: `Phone number is too short (${clean.length}/10 digits). Please enter a full 10-digit mobile number.`,
    };
  }

  if (clean.length > 10 && !clean.startsWith('91')) {
    return {
      isValid: false,
      error: 'Invalid phone number format. Please enter 10 digits without country code.',
    };
  }

  const tenDigits = clean.slice(-10);
  if (!/^[6-9]\d{9}$/.test(tenDigits)) {
    return {
      isValid: false,
      error: 'Invalid Indian mobile number. Must start with 6, 7, 8, or 9.',
    };
  }

  return { isValid: true };
}

/**
 * Validates customer name
 */
export function validateCustomerName(name: string): ValidationResult {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: 'Customer name is required' };
  }
  if (name.trim().length < 2) {
    return { isValid: false, error: 'Customer name must be at least 2 characters' };
  }
  if (name.trim().length > 50) {
    return { isValid: false, error: 'Customer name cannot exceed 50 characters' };
  }
  return { isValid: true };
}

/**
 * Validates cart items
 */
export function validateCart(items: { id: number; qty: number; price: number }[]): ValidationResult {
  if (!items || items.length === 0) {
    return { isValid: false, error: 'Your cart is empty. Please select at least one item.' };
  }

  for (const item of items) {
    if (!item.qty || item.qty <= 0) {
      return { isValid: false, error: 'Cart contains an invalid quantity. Must be at least 1.' };
    }
    if (typeof item.price !== 'number' || item.price < 0) {
      return { isValid: false, error: 'Cart contains an item with invalid pricing.' };
    }
  }

  return { isValid: true };
}

/**
 * Validates complete checkout payload
 */
export function validateCheckoutData(data: {
  customerName: string;
  phone: string;
  cart: { id: number; qty: number; price: number }[];
  paymentMethod: string | null;
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  const nameCheck = validateCustomerName(data.customerName);
  if (!nameCheck.isValid && nameCheck.error) errors.push(nameCheck.error);

  const phoneCheck = validatePhone(data.phone);
  if (!phoneCheck.isValid && phoneCheck.error) errors.push(phoneCheck.error);

  const cartCheck = validateCart(data.cart);
  if (!cartCheck.isValid && cartCheck.error) errors.push(cartCheck.error);

  if (!data.paymentMethod) {
    errors.push('Please select a payment method (Cash or UPI).');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
