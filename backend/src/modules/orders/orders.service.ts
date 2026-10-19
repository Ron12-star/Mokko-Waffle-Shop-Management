import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ShopOrder } from '../../types/order.types';
import { ReceiptService } from '../receipt/receipt.service';
import { WhatsAppService } from '../whatsapp/whatsapp.service';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  // In-memory active order store (can easily be connected to MongoDB)
  private orders: ShopOrder[] = [
    {
      id: 'ORD-101',
      billNo: 'MK-000101',
      customer: { name: 'Aarav Mehta', phone: '9876543210' },
      items: [
        { id: 1, name: 'Belgian Dark Chocolate Waffle', price: 180, qty: 2, emoji: '🧇' },
        { id: 4, name: 'Strawberry Cream Waffle', price: 210, qty: 1, emoji: '🍓' },
      ],
      paymentMethod: 'upi',
      transactionId: 'UPI-98321044',
      status: 'incoming',
      urgent: true,
      kitchenNote: 'Extra crispy waffle, no powdered sugar on chocolate',
      summary: {
        subtotal: 570,
        gstAmount: 29,
        gstRate: 0.05,
        discountAmount: 0,
        discountCode: null,
        total: 599,
      },
      createdAt: new Date(Date.now() - 4 * 60000).toISOString(),
      time: '04:15 PM',
      timer: 4,
    },
    {
      id: 'ORD-102',
      billNo: 'MK-000102',
      customer: { name: 'Pooja Verma', phone: '9823456789' },
      items: [
        { id: 2, name: 'Nutella Brownie Blast', price: 240, qty: 1, emoji: '🍫' },
        { id: 8, name: 'Classic Iced Mocha', price: 150, qty: 2, emoji: '☕' },
      ],
      paymentMethod: 'cash',
      status: 'preparing',
      urgent: false,
      kitchenNote: 'Less ice in mocha please',
      summary: {
        subtotal: 540,
        gstAmount: 27,
        gstRate: 0.05,
        discountAmount: 54,
        discountCode: 'WELCOME10',
        total: 513,
      },
      createdAt: new Date(Date.now() - 8 * 60000).toISOString(),
      time: '04:10 PM',
      timer: 8,
    },
    {
      id: 'ORD-103',
      billNo: 'MK-000103',
      customer: { name: 'Karan Patel', phone: '9765432100' },
      items: [
        { id: 5, name: 'Triple Chocolate Overload', price: 260, qty: 1, emoji: '🍫' },
      ],
      paymentMethod: 'upi',
      status: 'ready',
      urgent: false,
      kitchenNote: 'Parcel / Takeaway pack',
      summary: {
        subtotal: 260,
        gstAmount: 13,
        gstRate: 0.05,
        discountAmount: 0,
        discountCode: null,
        total: 273,
      },
      createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
      time: '04:02 PM',
      timer: 15,
    },
  ];

  constructor(
    private readonly receiptService: ReceiptService,
    private readonly whatsAppService: WhatsAppService,
  ) {}

  getAllOrders(): ShopOrder[] {
    return this.orders;
  }

  getOrderById(id: string): ShopOrder | undefined {
    return this.orders.find((o) => o.id === id || o.billNo === id);
  }

  async createOrder(payload: Partial<ShopOrder>): Promise<{ order: ShopOrder; whatsappSent: boolean; pdfPath?: string }> {
    // Validate Phone Number: Must be exactly 10 Indian digits
    if (!payload.customer?.phone) {
      throw new BadRequestException('Customer phone number is required');
    }

    const cleanPhone = payload.customer.phone.replace(/\D/g, '');
    const phoneValid = /^[6-9]\d{9}$/.test(cleanPhone.slice(-10));
    if (!phoneValid) {
      throw new BadRequestException('Invalid phone number. Must be a 10-digit Indian mobile number (starts with 6, 7, 8, or 9)');
    }

    if (!payload.customer?.name || payload.customer.name.trim().length < 2) {
      throw new BadRequestException('Customer name must be at least 2 characters');
    }

    if (!payload.items || payload.items.length === 0) {
      throw new BadRequestException('Order items cannot be empty');
    }

    const billNo = payload.billNo || this.receiptService.generateBillNo();
    const orderId = `ORD-${Date.now().toString().slice(-4)}`;

    const newOrder: ShopOrder = {
      id: orderId,
      billNo,
      customer: {
        name: payload.customer.name.trim(),
        phone: cleanPhone.slice(-10),
      },
      items: payload.items,
      paymentMethod: payload.paymentMethod || 'cash',
      transactionId: payload.transactionId,
      status: 'incoming',
      urgent: Boolean(payload.urgent),
      kitchenNote: payload.kitchenNote || '',
      summary: payload.summary || {
        subtotal: payload.items.reduce((acc, i) => acc + i.price * i.qty, 0),
        gstAmount: Math.round(payload.items.reduce((acc, i) => acc + i.price * i.qty, 0) * 0.05),
        gstRate: 0.05,
        discountAmount: 0,
        discountCode: null,
        total: Math.round(payload.items.reduce((acc, i) => acc + i.price * i.qty, 0) * 1.05),
      },
      createdAt: new Date().toISOString(),
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
      timer: 0,
    };

    // Prepend to active orders
    this.orders.unshift(newOrder);
    this.logger.log(`🍳 New order placed: ${newOrder.id} (${newOrder.billNo}) for ${newOrder.customer.name}`);

    // Generate PDF & Send WhatsApp in background
    let pdfPath = '';
    let whatsappSent = false;
    try {
      pdfPath = await this.receiptService.generatePDF({
        billNo: newOrder.billNo,
        dateTime: newOrder.time,
        cashier: 'Counter Staff',
        customer: newOrder.customer,
        items: newOrder.items.map((it) => ({
          id: it.id,
          name: it.name,
          description: it.description || '',
          price: it.price,
          qty: it.qty,
          emoji: it.emoji || '🧇',
        })),
        paymentMethod: newOrder.paymentMethod,
        transactionId: newOrder.transactionId,
        summary: newOrder.summary,
        kitchenNote: newOrder.kitchenNote,
      });

      const waRes = await this.whatsAppService.sendReceipt(
        newOrder.customer.phone,
        newOrder.customer.name,
        newOrder.summary.total,
        pdfPath,
      );
      whatsappSent = waRes.success;
    } catch (e: any) {
      this.logger.error(`Receipt / WhatsApp background process failed: ${e.message}`);
    }

    return { order: newOrder, whatsappSent, pdfPath };
  }

  updateOrderStatus(orderId: string, status: ShopOrder['status']): ShopOrder {
    const order = this.orders.find((o) => o.id === orderId || o.billNo === orderId);
    if (!order) {
      throw new BadRequestException(`Order ${orderId} not found`);
    }

    order.status = status;
    this.logger.log(`🔄 Order ${orderId} status changed to ${status}`);
    return order;
  }
}
