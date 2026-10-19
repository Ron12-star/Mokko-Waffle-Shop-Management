import { Module } from '@nestjs/common';
import { ReceiptModule } from './modules/receipt/receipt.module';
import { WhatsAppModule } from './modules/whatsapp/whatsapp.module';
import { OrdersModule } from './modules/orders/orders.module';

@Module({
  imports: [ReceiptModule, WhatsAppModule, OrdersModule],
})
export class AppModule {}
