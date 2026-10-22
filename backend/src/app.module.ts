import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReceiptModule } from './modules/receipt/receipt.module';
import { WhatsAppModule } from './modules/whatsapp/whatsapp.module';
import { OrdersModule } from './modules/orders/orders.module';
import { MenuModule } from './modules/menu/menu.module';
import { CouponsModule } from './modules/coupons/coupons.module';
import { AuthModule } from './modules/auth/auth.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { ManagementModule } from './modules/management/management.module';

const isMongoConfigured = Boolean(process.env.MONGODB_URI && process.env.MONGODB_URI.trim());

@Module({
  imports: [
    ...(isMongoConfigured ? [MongooseModule.forRoot(process.env.MONGODB_URI!)] : []),
    ReceiptModule,
    WhatsAppModule,
    OrdersModule,
    MenuModule,
    CouponsModule,
    AuthModule,
    DashboardModule,
    ManagementModule,
  ],
})
export class AppModule {}
