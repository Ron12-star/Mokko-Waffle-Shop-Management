import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersGateway } from './orders.gateway';
import { OrdersController } from './orders.controller';
import { ReceiptModule } from '../receipt/receipt.module';
import { WhatsAppModule } from '../whatsapp/whatsapp.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from './schemas/order.schema';

const isMongoConfigured = Boolean(process.env.MONGODB_URI && process.env.MONGODB_URI.trim());

@Module({
  imports: [
    ReceiptModule,
    WhatsAppModule,
    ...(isMongoConfigured
      ? [MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }])]
      : []),
  ],
  controllers: [OrdersController],
  providers: [OrdersService, OrdersGateway],
  exports: [OrdersService, OrdersGateway],
})
export class OrdersModule {}
