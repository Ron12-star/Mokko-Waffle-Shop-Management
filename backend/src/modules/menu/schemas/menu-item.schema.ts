import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MenuItemDocument = MenuItem & Document;

@Schema({ timestamps: true })
export class MenuItem {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  category: string;

  @Prop({ required: true, default: 0 })
  price: number; // Base or default price

  @Prop({
    type: {
      small: { type: Number, required: false },
      big: { type: Number, required: false },
    },
    default: null,
  })
  sizes?: {
    small?: number;
    big?: number;
  };

  @Prop({ default: '' })
  description: string;

  @Prop({ default: '🧇' })
  emoji: string;

  @Prop({ default: true })
  available: boolean;

  @Prop({ default: 0 })
  cost: number;

  @Prop({ default: 0 })
  soldCount: number;

  @Prop({ type: [String], default: [] })
  allowedToppings: string[];
}

export const MenuItemSchema = SchemaFactory.createForClass(MenuItem);
