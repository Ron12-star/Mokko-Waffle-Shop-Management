// ╔══════════════════════════════════════════════════════════════════════╗
// ║  🏪 SHOP CONFIGURATION — Your shop details for receipts           ║
// ║                                                                    ║
// ║  Update shop name, address, logo, etc. here.                       ║
// ║  This info appears on every PDF receipt.                            ║
// ╚══════════════════════════════════════════════════════════════════════╝

export const SHOP_CONFIG = {
  // ──────────────────────────────────────────────
  // 🏪 SHOP DETAILS (shown on receipt header)
  // ──────────────────────────────────────────────
  name: 'MOKKO',
  tagline: 'Desserts & Coffee',
  fullName: 'MOKKO Desserts & Coffee',

  // ──────────────────────────────────────────────
  // 📍 ADDRESS (shown on receipt)
  // ──────────────────────────────────────────────
  addressLine1: '',
  addressLine2: '',
  phone: '+91 9316707935',

  // ──────────────────────────────────────────────
  // 💰 TAX CONFIGURATION
  // ──────────────────────────────────────────────
  gstRate: 0,          // GST removed
  gstLabel: 'GST',
  gstin: '',

  // ──────────────────────────────────────────────
  // 🧾 RECEIPT SETTINGS
  // ──────────────────────────────────────────────
  receiptPrefix: 'MK',  // Bill numbers: MK-000124
  footerMessage: 'Thank you for visiting MOKKO! ♡',
  footerTagline: 'Desserts & Coffee  •  Good Vibes  •  See You Soon!',
  footerNote: 'This is a computer generated receipt',

  // ──────────────────────────────────────────────
  // 🎨 RECEIPT BRANDING COLORS (MOKKO Logo Palette)
  // ──────────────────────────────────────────────
  primaryColor: '#4a2311',
  accentColor: '#d47a2a',
};

// ╔══════════════════════════════════════════════════════════════════════╗
// ║  🧇 MENU ITEMS — Add/Remove items here!                           ║
// ║                                                                    ║
// ║  Each item has: id, name, category, price, description, emoji      ║
// ║  To add a new item: just add a new object to the array below       ║
// ║  To remove an item: delete its object from the array               ║
// ╚══════════════════════════════════════════════════════════════════════╝

export interface MenuItem {
  id: number;
  name: string;
  category: 'Waffles' | 'Desserts' | 'Beverages' | 'Combos' | 'Toppings';
  price: number;
  description: string;   // Shown below item name on receipt (e.g. "With Chocolate Sauce")
  emoji: string;
  available: boolean;
  cost: number;          // Cost price for profit calculation
}

export const MENU_ITEMS: MenuItem[] = [
  // ──────────────────────────────────────────────
  // 🧇 WAFFLES
  // ──────────────────────────────────────────────
  { id: 1,  name: 'Classic Butter Waffle',     category: 'Waffles',    price: 149, description: 'With Butter & Maple Syrup',          emoji: '🧇', available: true,  cost: 60  },
  { id: 2,  name: 'Nutella Dream Waffle',      category: 'Waffles',    price: 199, description: 'With Rich Nutella Spread',            emoji: '🍫', available: true,  cost: 75  },
  { id: 3,  name: 'Strawberry Bliss Waffle',   category: 'Waffles',    price: 179, description: 'With Fresh Strawberries & Cream',     emoji: '🍓', available: true,  cost: 70  },
  { id: 4,  name: 'Choco Overload Waffle',     category: 'Waffles',    price: 219, description: 'With Triple Chocolate Drizzle',       emoji: '🍬', available: false, cost: 80  },
  { id: 5,  name: 'Caramel Crunch Waffle',     category: 'Waffles',    price: 189, description: 'With Caramel Sauce & Crunch Bits',    emoji: '🍮', available: true,  cost: 72  },
  { id: 6,  name: 'Red Velvet Waffle',         category: 'Waffles',    price: 229, description: 'With Cream Cheese Frosting',          emoji: '❤️', available: true,  cost: 85  },

  // ──────────────────────────────────────────────
  // 🍮 DESSERTS
  // ──────────────────────────────────────────────
  { id: 7,  name: 'Belgian Chocolate Mousse',  category: 'Desserts',   price: 159, description: 'Rich & Creamy Belgian Chocolate',     emoji: '🍮', available: true,  cost: 55  },
  { id: 8,  name: 'Mango Kulfi',               category: 'Desserts',   price: 99,  description: 'Traditional Indian Mango Ice Cream',  emoji: '🥭', available: true,  cost: 30  },
  { id: 9,  name: 'Tiramisu',                  category: 'Desserts',   price: 189, description: 'Classic Italian Coffee Dessert',       emoji: '☕', available: true,  cost: 65  },
  { id: 10, name: 'Cheesecake Slice',          category: 'Desserts',   price: 169, description: 'New York Style Cheesecake',            emoji: '🍰', available: false, cost: 60  },

  // ──────────────────────────────────────────────
  // 🥤 BEVERAGES
  // ──────────────────────────────────────────────
  { id: 11, name: 'Salted Caramel Shake',      category: 'Beverages',  price: 129, description: 'Blended with Salted Caramel',         emoji: '🥤', available: true,  cost: 40  },
  { id: 12, name: 'Oreo Milkshake',            category: 'Beverages',  price: 139, description: 'Crushed Oreo Cookie Shake',            emoji: '🍦', available: true,  cost: 45  },
  { id: 13, name: 'Cold Coffee',               category: 'Beverages',  price: 89,  description: 'Chilled Coffee with Ice',              emoji: '☕', available: true,  cost: 25  },

  // ──────────────────────────────────────────────
  // 🎉 COMBOS
  // ──────────────────────────────────────────────
  { id: 14, name: 'Waffle + Shake Combo',      category: 'Combos',     price: 249, description: 'Any Waffle + Any Shake',               emoji: '🎉', available: true,  cost: 95  },
  { id: 15, name: 'Date Night Special',        category: 'Combos',     price: 399, description: '2 Waffles + 2 Shakes + 1 Dessert',     emoji: '💑', available: true,  cost: 150 },

  // ──────────────────────────────────────────────
  // 🍫 TOPPINGS / ADD-ONS
  // ──────────────────────────────────────────────
  { id: 16, name: 'Extra Chocolate (Topping)',  category: 'Toppings',   price: 30,  description: 'Premium Belgian Chocolate Drizzle',    emoji: '🍫', available: true,  cost: 10  },
  { id: 17, name: 'Fresh Fruits (Topping)',     category: 'Toppings',   price: 40,  description: 'Seasonal Fresh Fruit Mix',             emoji: '🍓', available: true,  cost: 15  },
  { id: 18, name: 'Whipped Cream (Topping)',    category: 'Toppings',   price: 20,  description: 'Fresh Whipped Cream',                  emoji: '🍦', available: true,  cost: 5   },
  { id: 19, name: 'Ice Cream Scoop (Topping)',  category: 'Toppings',   price: 50,  description: 'Vanilla / Chocolate Ice Cream',        emoji: '🍨', available: true,  cost: 18  },

  // ──────────────────────────────────────────────────────────────────
  // 🆕 TO ADD A NEW ITEM: Copy any line above, change the values!
  //    Make sure the id is unique (use the next number).
  //
  //    Example:
  //    { id: 20, name: 'Peanut Butter Waffle', category: 'Waffles',
  //      price: 209, description: 'With Crunchy Peanut Butter',
  //      emoji: '🥜', available: true, cost: 78 },
  // ──────────────────────────────────────────────────────────────────
];

// ──────────────────────────────────────────────
// 🎟️ DISCOUNT CODES — Add your coupons here!
// ──────────────────────────────────────────────
export interface DiscountCode {
  code: string;
  type: 'percentage' | 'flat';
  value: number;        // e.g. 10 means 10% or ₹10
  description: string;
  active: boolean;
}

export const DISCOUNT_CODES: DiscountCode[] = [
  { code: 'WELCOME10',  type: 'percentage', value: 10,  description: '10% off for new customers',     active: true  },
  { code: 'MOKKO50',    type: 'flat',       value: 50,  description: '₹50 off on orders above ₹300',  active: true  },
  { code: 'SWEET20',    type: 'percentage', value: 20,  description: '20% off on desserts',            active: false },

  // 🆕 TO ADD A NEW COUPON: Copy any line above, change the values!
];

// ──────────────────────────────────────────────
// 💳 PAYMENT METHODS
// ──────────────────────────────────────────────
export const PAYMENT_METHODS = [
  { id: 'cash',  label: 'Cash',               icon: '💵' },
  { id: 'upi',   label: 'UPI / QR',           icon: '📱' },
  { id: 'split', label: 'Split (Cash + UPI)',  icon: '⚡' },
] as const;

export type PaymentMethod = typeof PAYMENT_METHODS[number]['id'];
