import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersGateway } from './orders.gateway';
import { OrdersController } from './orders.controller';
import { ReceiptModule } from '../receipt/receipt.module';
import { WhatsAppModule } from '../whatsapp/whatsapp.module';

@Module({
  imports: [ReceiptModule, WhatsAppModule],
  controllers: [OrdersController],
  providers: [OrdersService, OrdersGateway],
  exports: [OrdersService, OrdersGateway],
})
export class OrdersModule {}
