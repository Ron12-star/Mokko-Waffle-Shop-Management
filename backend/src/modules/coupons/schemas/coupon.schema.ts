import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CouponDocument = Coupon & Document;

@Schema({ timestamps: true })
export class Coupon {
  @Prop({ required: true, unique: true, uppercase: true })
  code: string;

  @Prop({ required: true, enum: ['percentage', 'flat'], default: 'percentage' })
  type: 'percentage' | 'flat';

  @Prop({ required: true })
  value: number; // e.g. 10 for 10% or 50 for ₹50

  @Prop({ default: 0 })
  minOrder: number;

  @Prop({ default: null })
  maxDiscount?: number;

  @Prop({ default: '' })
  description: string;

  @Prop({ default: true })
  active: boolean;
}

export const CouponSchema = SchemaFactory.createForClass(Coupon);
