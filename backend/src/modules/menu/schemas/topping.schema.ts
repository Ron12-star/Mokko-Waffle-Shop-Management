import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ToppingDocument = Topping & Document;

@Schema({ timestamps: true })
export class Topping {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  price: number;

  @Prop({ default: '🍫' })
  emoji: string;

  @Prop({ default: true })
  available: boolean;

  @Prop({ default: true })
  isReserved: boolean; // Flagged as reserved for future use

  @Prop({ default: 'General' })
  category: string;
}

export const ToppingSchema = SchemaFactory.createForClass(Topping);
