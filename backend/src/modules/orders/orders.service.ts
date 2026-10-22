import { Injectable, Logger, BadRequestException, Optional } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ShopOrder } from '../../types/order.types';
import { ReceiptService } from '../receipt/receipt.service';
import { WhatsAppService } from '../whatsapp/whatsapp.service';
import { Order, OrderDocument } from './schemas/order.schema';
import * as path from 'path';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  // In-memory active order store (used as fallback or when MongoDB is not connected)
  private orders: ShopOrder[] = [];

  constructor(
    private readonly receiptService: ReceiptService,
    private readonly whatsAppService: WhatsAppService,
    @Optional() @InjectModel(Order.name) private readonly orderModel?: Model<OrderDocument>,
  ) {
    if (this.orderModel) {
      this.logger.log('🍃 MongoDB connected! Orders will persist to MongoDB collection.');
    } else {
      this.logger.log('📦 In-memory orders store active (MongoDB not configured).');
    }
  }

  async getAllOrders(): Promise<ShopOrder[]> {
    if (this.orderModel) {
      try {
        const dbOrders = await this.orderModel.find().sort({ createdAt: -1 }).lean().exec();
        if (dbOrders && dbOrders.length > 0) {
          return dbOrders as any;
        }
      } catch (err: any) {
        this.logger.warn(`MongoDB read failed: ${err.message}, falling back to memory store`);
      }
    }
    return this.orders;
  }

  getOrderById(id: string): ShopOrder | undefined {
    return this.orders.find((o) => o.id === id || o.billNo === id);
  }

  async createOrder(payload: Partial<ShopOrder>): Promise<{
    order: ShopOrder;
    whatsappSent: boolean;
    pdfPath?: string;
    waLink?: string;
    downloadUrl?: string;
  }> {
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
        gstAmount: 0,
        gstRate: 0,
        discountAmount: 0,
        discountCode: null,
        total: payload.items.reduce((acc, i) => acc + i.price * i.qty, 0),
      },
      createdAt: new Date().toISOString(),
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
      timer: 0,
    };

    // Prepend to active memory orders
    this.orders.unshift(newOrder);

    // Save to MongoDB if connected
    if (this.orderModel) {
      try {
        await new this.orderModel(newOrder).save();
        this.logger.log(`🍃 Order persisted to MongoDB: ${newOrder.id}`);
      } catch (dbErr: any) {
        this.logger.warn(`Failed to save order to MongoDB: ${dbErr.message}`);
      }
    }

    this.logger.log(`🍳 New order placed: ${newOrder.id} (${newOrder.billNo}) for ${newOrder.customer.name}`);

    // Generate PDF receipt locally for offline records & printing
    let pdfPath = '';
    let downloadUrl = '';
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

      const filename = path.basename(pdfPath);
      downloadUrl = `/api/receipt/file/${filename}`;
      this.logger.log(`💾 Receipt archived locally at: ${pdfPath}`);
    } catch (e: any) {
      this.logger.warn(`Local PDF generation note: ${e.message}`);
    }

    return {
      order: newOrder,
      whatsappSent: false,
      pdfPath,
      downloadUrl,
    };
  }

  updateOrderStatus(orderId: string, status: ShopOrder['status']): ShopOrder {
    const order = this.orders.find((o) => o.id === orderId || o.billNo === orderId);
    if (!order) {
      throw new BadRequestException(`Order ${orderId} not found`);
    }

    order.status = status;

    // Update in MongoDB if connected
    if (this.orderModel) {
      this.orderModel.updateOne({ id: orderId }, { $set: { status } }).catch((err) => {
        this.logger.warn(`MongoDB status update failed: ${err.message}`);
      });
    }

    this.logger.log(`🔄 Order ${orderId} status changed to ${status}`);
    return order;
  }
}
