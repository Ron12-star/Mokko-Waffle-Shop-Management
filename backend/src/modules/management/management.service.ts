import { Injectable, Logger } from '@nestjs/common';
import { OrdersService } from '../orders/orders.service';
import { SHOP_CONFIG } from '../../config/shop.config';

export interface CustomerProfile {
  id: string;
  name: string;
  phone: string;
  visits: number;
  spent: number;
  points: number;
  segment: 'VIP' | 'Regular' | 'New';
  lastOrder: string;
}

export interface InventoryItem {
  id: number;
  name: string;
  unit: string;
  stock: number;
  minStock: number;
  costPerUnit: number;
  supplier: string;
}

export interface StaffMember {
  id: string;
  name: string;
  role: 'Counter' | 'Kitchen' | 'Manager';
  status: 'On Shift' | 'Off Shift';
  since: string;
  orders: number;
  sales: number;
  avatar: string;
  phone: string;
}

@Injectable()
export class ManagementService {
  private readonly logger = new Logger(ManagementService.name);

  // In-memory inventory list
  private inventoryList: InventoryItem[] = [
    { id: 1, name: 'Waffle Flour Mix', unit: 'kg', stock: 24, minStock: 10, costPerUnit: 85, supplier: 'BakeWell Mills' },
    { id: 2, name: 'Belgian Dark Chocolate (70%)', unit: 'kg', stock: 12, minStock: 5, costPerUnit: 480, supplier: 'Callebaut India' },
    { id: 3, name: 'Belgian Milk Chocolate', unit: 'kg', stock: 15, minStock: 6, costPerUnit: 440, supplier: 'Callebaut India' },
    { id: 4, name: 'White Chocolate Compound', unit: 'kg', stock: 8, minStock: 4, costPerUnit: 360, supplier: 'Callebaut India' },
    { id: 5, name: 'Authentic Nutella Spread', unit: 'kg', stock: 9, minStock: 5, costPerUnit: 620, supplier: 'Ferrero India' },
    { id: 6, name: 'Lotus Biscoff Spread', unit: 'kg', stock: 6, minStock: 4, costPerUnit: 690, supplier: 'Lotus Bakeries' },
    { id: 7, name: 'Dairy Butter (Amul)', unit: 'kg', stock: 14, minStock: 8, costPerUnit: 290, supplier: 'Amul Dairy' },
    { id: 8, name: 'Fresh Whole Milk', unit: 'Liters', stock: 30, minStock: 12, costPerUnit: 64, supplier: 'Local Dairy' },
    { id: 9, name: 'Arabica Roasted Coffee Beans', unit: 'kg', stock: 7, minStock: 3, costPerUnit: 780, supplier: 'Chikmagalur Roasters' },
    { id: 10, name: 'Vanilla Ice Cream Tubs', unit: 'Tubs', stock: 8, minStock: 4, costPerUnit: 220, supplier: 'Havmor Foods' },
    { id: 11, name: 'Takeaway Waffle Boxes', unit: 'pcs', stock: 180, minStock: 50, costPerUnit: 6, supplier: 'EcoPack Packaging' },
  ];

  // In-memory staff list
  private staffList: StaffMember[] = [
    { id: 'st-1', name: 'Ravi Kumar', role: 'Counter', status: 'Off Shift', since: '—', orders: 0, sales: 0, avatar: 'R', phone: '9876500001' },
    { id: 'st-2', name: 'Meena Joshi', role: 'Kitchen', status: 'Off Shift', since: '—', orders: 0, sales: 0, avatar: 'M', phone: '9876500002' },
    { id: 'st-3', name: 'Suresh Patil', role: 'Kitchen', status: 'Off Shift', since: '—', orders: 0, sales: 0, avatar: 'S', phone: '9876500003' },
    { id: 'st-4', name: 'Anita Das', role: 'Counter', status: 'Off Shift', since: '—', orders: 0, sales: 0, avatar: 'A', phone: '9876500004' },
  ];

  // Manual registered customers (merged with live orders)
  private registeredCustomers: CustomerProfile[] = [];

  // Live shop settings
  private shopSettings = {
    name: SHOP_CONFIG.name,
    tagline: SHOP_CONFIG.tagline,
    fullName: SHOP_CONFIG.fullName,
    addressLine1: SHOP_CONFIG.addressLine1,
    addressLine2: SHOP_CONFIG.addressLine2,
    phone: SHOP_CONFIG.phone,
    upi: 'mokko@upi',
    gstin: SHOP_CONFIG.gstin,
    gstRate: SHOP_CONFIG.gstRate,
    monthlyTarget: 150000,
    openTime: '09:00',
    closeTime: '23:00',
    receiptFooterMessage: SHOP_CONFIG.footerMessage,
  };

  constructor(private readonly ordersService: OrdersService) {}

  // --- Dynamic Customer CRM ---
  async getCustomers(search?: string): Promise<CustomerProfile[]> {
    const orders = await this.ordersService.getAllOrders();

    // Map by customer phone
    const customerMap = new Map<string, { name: string; phone: string; visits: number; spent: number; lastOrder: string }>();

    orders.forEach((order) => {
      const phone = order.customer?.phone?.trim();
      if (!phone) return;

      const existing = customerMap.get(phone);
      if (existing) {
        existing.visits += 1;
        existing.spent += order.summary?.total || 0;
        if (order.time) existing.lastOrder = `${order.createdAt?.slice(0, 10) || 'Today'} ${order.time}`;
      } else {
        customerMap.set(phone, {
          name: order.customer?.name || 'Customer',
          phone,
          visits: 1,
          spent: order.summary?.total || 0,
          lastOrder: `${order.createdAt?.slice(0, 10) || 'Today'} ${order.time || ''}`,
        });
      }
    });

    const list: CustomerProfile[] = [];

    // Add aggregated from orders
    customerMap.forEach((val, phone) => {
      const segment: 'VIP' | 'Regular' | 'New' =
        val.spent >= 1200 || val.visits >= 4 ? 'VIP' : val.visits >= 2 ? 'Regular' : 'New';

      list.push({
        id: `cust-${phone}`,
        name: val.name,
        phone: val.phone,
        visits: val.visits,
        spent: val.spent,
        points: Math.round(val.spent / 20),
        segment,
        lastOrder: val.lastOrder,
      });
    });

    // Merge manual registered customers if not already in list
    this.registeredCustomers.forEach((reg) => {
      if (!list.some((l) => l.phone === reg.phone)) {
        list.push(reg);
      }
    });

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      return list.filter((c) => c.name.toLowerCase().includes(q) || c.phone.includes(q));
    }

    return list;
  }

  addCustomer(dto: { name: string; phone: string }): CustomerProfile {
    const cleanPhone = dto.phone.replace(/\D/g, '').slice(-10);
    const newCust: CustomerProfile = {
      id: `cust-${cleanPhone}`,
      name: dto.name.trim(),
      phone: cleanPhone,
      visits: 0,
      spent: 0,
      points: 25, // Welcome bonus points!
      segment: 'New',
      lastOrder: 'Just registered',
    };
    this.registeredCustomers.push(newCust);
    return newCust;
  }

  // --- Inventory Management ---
  getInventory(): InventoryItem[] {
    return this.inventoryList;
  }

  updateStock(id: number, newStock: number): InventoryItem {
    const item = this.inventoryList.find((i) => i.id === id);
    if (!item) throw new Error('Ingredient not found');
    item.stock = Math.max(0, Number(newStock));
    return item;
  }

  addIngredient(dto: Partial<InventoryItem>): InventoryItem {
    const nextId = this.inventoryList.length > 0 ? Math.max(...this.inventoryList.map((i) => i.id)) + 1 : 1;
    const newItem: InventoryItem = {
      id: nextId,
      name: dto.name || 'New Ingredient',
      unit: dto.unit || 'kg',
      stock: Number(dto.stock) || 0,
      minStock: Number(dto.minStock) || 5,
      costPerUnit: Number(dto.costPerUnit) || 50,
      supplier: dto.supplier || 'Standard Vendor',
    };
    this.inventoryList.push(newItem);
    return newItem;
  }

  // --- Staff Management ---
  getStaff(): StaffMember[] {
    return this.staffList;
  }

  toggleShift(id: string): StaffMember {
    const staff = this.staffList.find((s) => s.id === id);
    if (!staff) throw new Error('Staff member not found');
    staff.status = staff.status === 'On Shift' ? 'Off Shift' : 'On Shift';
    if (staff.status === 'On Shift') {
      staff.since = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    }
    return staff;
  }

  addStaff(dto: Partial<StaffMember>): StaffMember {
    const newStaff: StaffMember = {
      id: `st-${Date.now()}`,
      name: dto.name || 'Staff Member',
      role: dto.role || 'Counter',
      status: 'On Shift',
      since: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
      orders: 0,
      sales: 0,
      avatar: (dto.name || 'S').charAt(0).toUpperCase(),
      phone: dto.phone || '',
    };
    this.staffList.push(newStaff);
    return newStaff;
  }

  // --- Shop Settings ---
  getSettings() {
    return this.shopSettings;
  }

  updateSettings(dto: Partial<typeof this.shopSettings>) {
    this.shopSettings = { ...this.shopSettings, ...dto };
    this.logger.log('🏪 Shop settings updated successfully');
    return this.shopSettings;
  }
}
