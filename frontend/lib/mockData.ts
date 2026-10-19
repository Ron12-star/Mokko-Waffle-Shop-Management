// Mock data for MOKKO Shop Management - Dummy Frontend

export const shopInfo = {
  name: "MOKKO",
  tagline: "Waffles & Desserts",
  address: "123 Sweet Street, Pune",
  phone: "+91 98765 43210",
  upi: "mokko@upi",
  gstin: "27AABCU9603R1ZX",
  monthlyTarget: 150000,
};

export const menuItems = [
  // Waffles
  { id: 1, name: "Classic Butter Waffle", category: "Waffles", price: 149, emoji: "🧇", available: true, sold: 342, cost: 60 },
  { id: 2, name: "Nutella Dream Waffle", category: "Waffles", price: 199, emoji: "🍫", available: true, sold: 289, cost: 75 },
  { id: 3, name: "Strawberry Bliss Waffle", category: "Waffles", price: 179, emoji: "🍓", available: true, sold: 215, cost: 70 },
  { id: 4, name: "Choco Overload Waffle", category: "Waffles", price: 219, emoji: "🍬", available: false, sold: 198, cost: 80 },
  { id: 5, name: "Caramel Crunch Waffle", category: "Waffles", price: 189, emoji: "🍮", available: true, sold: 176, cost: 72 },
  { id: 6, name: "Red Velvet Waffle", category: "Waffles", price: 229, emoji: "❤️", available: true, sold: 143, cost: 85 },
  // Desserts
  { id: 7, name: "Belgian Chocolate Mousse", category: "Desserts", price: 159, emoji: "🍮", available: true, sold: 187, cost: 55 },
  { id: 8, name: "Mango Kulfi", category: "Desserts", price: 99, emoji: "🥭", available: true, sold: 312, cost: 30 },
  { id: 9, name: "Tiramisu", category: "Desserts", price: 189, emoji: "☕", available: true, sold: 134, cost: 65 },
  { id: 10, name: "Cheesecake Slice", category: "Desserts", price: 169, emoji: "🍰", available: false, sold: 98, cost: 60 },
  // Beverages
  { id: 11, name: "Salted Caramel Shake", category: "Beverages", price: 129, emoji: "🥤", available: true, sold: 223, cost: 40 },
  { id: 12, name: "Oreo Milkshake", category: "Beverages", price: 139, emoji: "🍦", available: true, sold: 198, cost: 45 },
  { id: 13, name: "Cold Coffee", category: "Beverages", price: 89, emoji: "☕", available: true, sold: 267, cost: 25 },
  // Combos
  { id: 14, name: "Waffle + Shake Combo", category: "Combos", price: 249, emoji: "🎉", available: true, sold: 156, cost: 95 },
  { id: 15, name: "Date Night Special", category: "Combos", price: 399, emoji: "💑", available: true, sold: 87, cost: 150 },
];

export const todayStats = {
  totalSales: 18420,
  totalOrders: 67,
  wafflesSold: 89,
  dessertsSold: 43,
  beveragesSold: 54,
  aov: 275,
  cashSales: 10200,
  upiSales: 8220,
};

export const weeklySales = [
  { day: "Mon", sales: 12400, orders: 45, waffles: 56, desserts: 28 },
  { day: "Tue", sales: 15800, orders: 58, waffles: 72, desserts: 35 },
  { day: "Wed", sales: 11200, orders: 41, waffles: 48, desserts: 21 },
  { day: "Thu", sales: 16900, orders: 61, waffles: 78, desserts: 40 },
  { day: "Fri", sales: 22300, orders: 82, waffles: 102, desserts: 55 },
  { day: "Sat", sales: 28700, orders: 105, waffles: 134, desserts: 72 },
  { day: "Sun", sales: 18420, orders: 67, waffles: 89, desserts: 43 },
];

export const monthlySales = [
  { month: "Jan", sales: 285000 }, { month: "Feb", sales: 312000 },
  { month: "Mar", sales: 298000 }, { month: "Apr", sales: 340000 },
  { month: "May", sales: 325000 }, { month: "Jun", sales: 358000 },
  { month: "Jul", sales: 382000 }, { month: "Aug", sales: 371000 },
  { month: "Sep", sales: 395000 }, { month: "Oct", sales: 412000 },
  { month: "Nov", sales: 0 },     { month: "Dec", sales: 0 },
];

export const peakHourData = [
  { hour: "9AM", value: 2 },  { hour: "10AM", value: 4 },
  { hour: "11AM", value: 7 },  { hour: "12PM", value: 12 },
  { hour: "1PM", value: 15 },  { hour: "2PM", value: 9 },
  { hour: "3PM", value: 6 },   { hour: "4PM", value: 8 },
  { hour: "5PM", value: 14 },  { hour: "6PM", value: 22 },
  { hour: "7PM", value: 28 },  { hour: "8PM", value: 18 },
];

export const bestSellers = [
  { name: "Nutella Dream Waffle", count: 289, trend: "up", change: "+12%" },
  { name: "Mango Kulfi", count: 312, trend: "up", change: "+8%" },
  { name: "Classic Butter Waffle", count: 342, trend: "up", change: "+5%" },
  { name: "Cold Coffee", count: 267, trend: "down", change: "-3%" },
  { name: "Salted Caramel Shake", count: 223, trend: "up", change: "+18%" },
];

export const kanbanOrders = {
  incoming: [
    {
      id: "ORD-089", customer: "Rahul Sharma", phone: "9876543210",
      items: ["Nutella Dream Waffle x1", "Oreo Milkshake x1"],
      note: "Extra Nutella please!", time: "2 min ago",
      total: 338, payment: "UPI", urgent: false,
    },
    {
      id: "ORD-090", customer: "Priya Patel", phone: "9123456789",
      items: ["Waffle + Shake Combo x2"],
      note: "", time: "Just now",
      total: 498, payment: "Cash", urgent: true,
    },
  ],
  preparing: [
    {
      id: "ORD-087", customer: "Amit Kumar", phone: "9012345678",
      items: ["Red Velvet Waffle x1", "Belgian Chocolate Mousse x1", "Cold Coffee x2"],
      note: "No sugar in coffee", time: "8 min ago",
      total: 566, payment: "UPI", urgent: false, timer: 8,
    },
    {
      id: "ORD-088", customer: "Sneha Joshi", phone: "9345678901",
      items: ["Strawberry Bliss Waffle x2"],
      note: "", time: "5 min ago",
      total: 358, payment: "Cash", urgent: false, timer: 5,
    },
  ],
  ready: [
    {
      id: "ORD-085", customer: "Vikram Singh", phone: "9456789012",
      items: ["Classic Butter Waffle x1", "Mango Kulfi x2"],
      note: "", time: "12 min ago",
      total: 347, payment: "UPI", urgent: false,
    },
    {
      id: "ORD-086", customer: "Ananya Das", phone: "9567890123",
      items: ["Date Night Special x1"],
      note: "For table 4", time: "15 min ago",
      total: 399, payment: "Cash", urgent: false,
    },
  ],
};

export const customers = [
  { id: 1, name: "Rahul Sharma", phone: "9876543210", visits: 24, spent: 8420, points: 842, segment: "VIP", lastOrder: "Today" },
  { id: 2, name: "Priya Patel", phone: "9123456789", visits: 12, spent: 3890, points: 389, segment: "Regular", lastOrder: "Yesterday" },
  { id: 3, name: "Amit Kumar", phone: "9012345678", visits: 6, spent: 1890, points: 189, segment: "New", lastOrder: "2 days ago" },
  { id: 4, name: "Sneha Joshi", phone: "9345678901", visits: 31, spent: 11200, points: 1120, segment: "VIP", lastOrder: "Today" },
  { id: 5, name: "Vikram Singh", phone: "9456789012", visits: 8, spent: 2600, points: 260, segment: "Regular", lastOrder: "3 days ago" },
];

export const inventory = [
  { id: 1, name: "All-Purpose Flour", unit: "kg", stock: 12, minStock: 5, cost: 40 },
  { id: 2, name: "Nutella", unit: "kg", stock: 2, minStock: 3, cost: 450 },
  { id: 3, name: "Fresh Strawberries", unit: "kg", stock: 1.5, minStock: 2, cost: 180 },
  { id: 4, name: "Heavy Cream", unit: "litre", stock: 8, minStock: 4, cost: 120 },
  { id: 5, name: "Eggs", unit: "dozen", stock: 6, minStock: 3, cost: 90 },
  { id: 6, name: "Butter", unit: "kg", stock: 4, minStock: 2, cost: 280 },
  { id: 7, name: "Belgian Chocolate", unit: "kg", stock: 3, minStock: 2, cost: 650 },
  { id: 8, name: "Mango Pulp", unit: "litre", stock: 5, minStock: 3, cost: 150 },
];
