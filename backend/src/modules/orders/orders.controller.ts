import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersGateway } from './orders.gateway';
import { ShopOrder } from '../../types/order.types';

@Controller('api/orders')
export class OrdersController {
  private readonly logger = new Logger(OrdersController.name);

  constructor(
    private readonly ordersService: OrdersService,
    private readonly ordersGateway: OrdersGateway,
  ) {}

  @Get()
  async getAllOrders() {
    return {
      success: true,
      orders: await this.ordersService.getAllOrders(),
    };
  }

  @Get(':id')
  getOrder(@Param('id') id: string) {
    const order = this.ordersService.getOrderById(id);
    if (!order) {
      throw new HttpException('Order not found', HttpStatus.NOT_FOUND);
    }
    return { success: true, order };
  }

  @Post()
  async createOrder(@Body() payload: Partial<ShopOrder>) {
    try {
      const result = await this.ordersService.createOrder(payload);

      // Broadcast realtime event
      this.ordersGateway.broadcastOrderCreated(result.order);

      return {
        success: true,
        order: result.order,
        whatsappSent: false,
        pdfPath: result.pdfPath,
        downloadUrl: (result as any).downloadUrl,
      };
    } catch (err: any) {
      this.logger.error(`Create order failed: ${err.message}`);
      throw new HttpException(
        err.message || 'Failed to create order',
        err.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: ShopOrder['status'],
  ) {
    if (!status || !['incoming', 'preparing', 'ready', 'completed'].includes(status)) {
      throw new HttpException(
        'Invalid status. Allowed: incoming, preparing, ready, completed',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const updated = this.ordersService.updateOrderStatus(id, status);
      this.ordersGateway.broadcastOrderUpdated(updated);
      return { success: true, order: updated };
    } catch (err: any) {
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('announcement')
  sendAnnouncement(@Body() body: { message: string; urgent?: boolean }) {
    if (!body?.message) {
      throw new HttpException('Announcement message is required', HttpStatus.BAD_REQUEST);
    }
    return this.ordersGateway.handleAnnouncement(body);
  }
}
