import { Module } from '@nestjs/common';
import { ReceiptModule } from './modules/receipt/receipt.module';
import { WhatsAppModule } from './modules/whatsapp/whatsapp.module';
import { OrdersModule } from './modules/orders/orders.module';
import { MongooseModule } from '@nestjs/mongoose';

const isMongoConfigured = Boolean(process.env.MONGODB_URI && process.env.MONGODB_URI.trim());

@Module({
  imports: [
    ...(isMongoConfigured ? [MongooseModule.forRoot(process.env.MONGODB_URI!)] : []),
    ReceiptModule,
    WhatsAppModule,
    OrdersModule,
  ],
})
export class AppModule {}
