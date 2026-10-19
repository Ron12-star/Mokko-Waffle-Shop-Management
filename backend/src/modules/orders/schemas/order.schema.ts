import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OrderDocument = Order & Document;

@Schema({ timestamps: true })
export class Order {
  @Prop({ required: true, unique: true })
  id: string;

  @Prop({ required: true })
  billNo: string;

  @Prop({ type: Object, required: true })
  customer: {
    name: string;
    phone: string;
  };

  @Prop({ type: Array, required: true })
  items: {
    id: number;
    name: string;
    description?: string;
    price: number;
    qty: number;
    emoji?: string;
  }[];

  @Prop({ required: true, default: 'cash' })
  paymentMethod: string;

  @Prop()
  transactionId?: string;

  @Prop({ required: true, default: 'incoming' })
  status: string;

  @Prop({ default: false })
  urgent: boolean;

  @Prop({ default: '' })
  kitchenNote: string;

  @Prop({ type: Object, required: true })
  summary: {
    subtotal: number;
    gstAmount: number;
    gstRate: number;
    discountAmount: number;
    discountCode: string | null;
    total: number;
  };

  @Prop({ default: () => new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) })
  time: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
