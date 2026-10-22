// Centralized API client for MOKKO Shop Management
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

export interface MenuItemData {
  id: number;
  name: string;
  category: string;
  price: number;
  sizes?: { small?: number; big?: number } | null;
  description: string;
  emoji: string;
  available: boolean;
  cost?: number;
  soldCount?: number;
}

export interface CategoryData {
  id: string;
  name: string;
  emoji: string;
  order: number;
}

export interface ToppingData {
  id: number;
  name: string;
  price: number;
  emoji: string;
  available: boolean;
  isReserved: boolean;
  category: string;
}

export interface CouponData {
  code: string;
  type: 'percentage' | 'flat';
  value: number;
  minOrder: number;
  maxDiscount?: number;
  description: string;
  active: boolean;
}

// Generic fetcher with fallback handling
async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${BACKEND_URL}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || `Request failed with status ${res.status}`);
    }
    return data as T;
  } catch (error: any) {
    console.warn(`API request to ${url} failed:`, error.message);
    throw error;
  }
}

export const api = {
  // Menu APIs
  getMenu: async (category?: string) => {
    const query = category && category !== 'All' ? `?category=${encodeURIComponent(category)}` : '';
    return request<{ success: boolean; items: MenuItemData[] }>(`/api/menu${query}`);
  },

  createMenuItem: async (item: Partial<MenuItemData>) => {
    return request<{ success: boolean; item: MenuItemData; message: string }>('/api/menu', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  },

  updateMenuItem: async (id: number, item: Partial<MenuItemData>) => {
    return request<{ success: boolean; item: MenuItemData; message: string }>(`/api/menu/${id}`, {
      method: 'PUT',
      body: JSON.stringify(item),
    });
  },

  toggleMenuItem: async (id: number) => {
    return request<{ success: boolean; item: MenuItemData }>(`/api/menu/${id}/toggle`, {
      method: 'PATCH',
    });
  },

  deleteMenuItem: async (id: number) => {
    return request<{ success: boolean; id: number; message: string }>(`/api/menu/${id}`, {
      method: 'DELETE',
    });
  },

  // Categories APIs
  getCategories: async () => {
    return request<{ success: boolean; categories: CategoryData[] }>('/api/menu/categories');
  },

  createCategory: async (category: { name: string; emoji?: string }) => {
    return request<{ success: boolean; category: CategoryData; message: string }>('/api/menu/categories', {
      method: 'POST',
      body: JSON.stringify(category),
    });
  },

  updateCategory: async (id: string, category: { name: string; emoji?: string }) => {
    return request<{ success: boolean; category: CategoryData; message: string }>(`/api/menu/categories/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(category),
    });
  },

  deleteCategory: async (id: string) => {
    return request<{ success: boolean; deleted: string; message: string }>(`/api/menu/categories/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },

  // Toppings APIs (Reserved)
  getToppings: async () => {
    return request<{ success: boolean; toppings: ToppingData[]; note: string }>('/api/menu/toppings');
  },

  addTopping: async (topping: Partial<ToppingData>) => {
    return request<{ success: boolean; topping: ToppingData; message: string }>('/api/menu/toppings', {
      method: 'POST',
      body: JSON.stringify(topping),
    });
  },

  toggleTopping: async (id: number) => {
    return request<{ success: boolean; topping: ToppingData }>(`/api/menu/toppings/${id}/toggle`, {
      method: 'PATCH',
    });
  },

  // Coupon APIs
  getCoupons: async () => {
    return request<{ success: boolean; coupons: CouponData[] }>('/api/coupons');
  },

  validateCoupon: async (code: string, subtotal: number) => {
    return request<{ valid: boolean; discountAmount: number; message: string; coupon?: CouponData }>('/api/coupons/validate', {
      method: 'POST',
      body: JSON.stringify({ code, subtotal }),
    });
  },

  createCoupon: async (coupon: Partial<CouponData>) => {
    return request<{ success: boolean; coupon: CouponData; message: string }>('/api/coupons', {
      method: 'POST',
      body: JSON.stringify(coupon),
    });
  },

  deleteCoupon: async (code: string) => {
    return request<{ success: boolean; code: string; message: string }>(`/api/coupons/${encodeURIComponent(code)}`, {
      method: 'DELETE',
    });
  },

  // Dashboard APIs
  getDashboardStats: async () => {
    return request<{ success: boolean; stats: any }>('/api/dashboard/stats');
  },

  getDailyWaffleAnalytics: async () => {
    return request<{ success: boolean; waffleAnalytics: any }>('/api/dashboard/waffles');
  },

  // Auth APIs (Password / PIN based)
  loginWithPassword: async (station: string, password: string, name?: string) => {
    return request<{
      success: boolean;
      token: string;
      user: { phone: string; role: string; name: string };
    }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ station, password, name }),
    });
  },

  sendOtp: async (phone: string, role = 'counter') => {
    return request<{ success: boolean; message: string; adminPhoneMasked?: string }>('/api/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, role }),
    });
  },

  verifyOtp: async (phone: string, otp: string, role = 'counter') => {
    return request<{
      success: boolean;
      token: string;
      user: { phone: string; role: string; name: string };
    }>('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, otp, role }),
    });
  },

  // Orders APIs
  getOrders: async () => {
    return request<{ success: boolean; orders: any[] }>('/api/orders');
  },

  createOrder: async (orderData: any) => {
    return request<{
      success: boolean;
      order: any;
      whatsappSent?: boolean;
      pdfPath?: string;
      downloadUrl?: string;
    }>('/api/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  updateOrderStatus: async (id: string, status: string) => {
    return request<{ success: boolean; order: any }>(`/api/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  // Customers APIs
  getCustomers: async (search?: string) => {
    const q = search ? `?search=${encodeURIComponent(search)}` : '';
    return request<{ success: boolean; customers: any[] }>(`/api/customers${q}`);
  },

  addCustomer: async (customer: { name: string; phone: string }) => {
    return request<{ success: boolean; customer: any; message: string }>('/api/customers', {
      method: 'POST',
      body: JSON.stringify(customer),
    });
  },

  // Inventory APIs
  getInventory: async () => {
    return request<{ success: boolean; inventory: any[] }>('/api/inventory');
  },

  updateStock: async (id: number, stock: number) => {
    return request<{ success: boolean; item: any; message: string }>(`/api/inventory/${id}/stock`, {
      method: 'PATCH',
      body: JSON.stringify({ stock }),
    });
  },

  addIngredient: async (ingredient: any) => {
    return request<{ success: boolean; item: any; message: string }>('/api/inventory', {
      method: 'POST',
      body: JSON.stringify(ingredient),
    });
  },

  // Staff APIs
  getStaff: async () => {
    return request<{ success: boolean; staff: any[] }>('/api/staff');
  },

  toggleShift: async (id: string) => {
    return request<{ success: boolean; staff: any; message: string }>(`/api/staff/${id}/shift`, {
      method: 'PATCH',
    });
  },

  addStaff: async (staffMember: any) => {
    return request<{ success: boolean; staff: any; message: string }>('/api/staff', {
      method: 'POST',
      body: JSON.stringify(staffMember),
    });
  },

  // Settings APIs
  getSettings: async () => {
    return request<{ success: boolean; settings: any }>('/api/settings');
  },

  updateSettings: async (settings: any) => {
    return request<{ success: boolean; settings: any; message: string }>('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  },
};

