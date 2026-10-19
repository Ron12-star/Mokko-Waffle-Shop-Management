import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { OrdersService } from './orders.service';
import { ShopOrder } from '../../types/order.types';

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})
export class OrdersGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(OrdersGateway.name);

  constructor(private readonly ordersService: OrdersService) {}

  afterInit(server: Server) {
    this.logger.log('🔌 Socket.io Orders Gateway initialized on port 4000');
  }

  handleConnection(client: Socket) {
    this.logger.log(`📱 Client connected: ${client.id}`);
    // Immediately send current active orders to freshly connected screen
    client.emit('initial-orders', this.ordersService.getAllOrders());
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join-room')
  handleJoinRoom(
    @MessageBody() data: { role: 'kitchen' | 'counter' },
    @ConnectedSocket() client: Socket,
  ) {
    if (data?.role) {
      client.join(data.role);
      this.logger.log(`Client ${client.id} joined room: ${data.role}`);
      return { status: 'joined', room: data.role };
    }
  }

  @SubscribeMessage('create-order')
  async handleCreateOrder(@MessageBody() payload: Partial<ShopOrder>) {
    try {
      const result = await this.ordersService.createOrder(payload);

      // Broadcast new order to both Kitchen & Counter screens immediately
      this.server.emit('order-created', result.order);
      this.logger.log(`📢 Broadcasted order-created: ${result.order.id}`);

      return { success: true, order: result.order, whatsappSent: result.whatsappSent };
    } catch (err: any) {
      this.logger.error(`Failed to handle create-order: ${err.message}`);
      return { success: false, error: err.message };
    }
  }

  @SubscribeMessage('update-status')
  handleUpdateStatus(
    @MessageBody() payload: { orderId: string; status: ShopOrder['status'] },
  ) {
    try {
      const updated = this.ordersService.updateOrderStatus(
        payload.orderId,
        payload.status,
      );

      // Broadcast update to all screens
      this.server.emit('order-updated', updated);

      // If status is ready, emit alert specifically for counter staff
      if (payload.status === 'ready') {
        this.server.emit('order-ready-alert', {
          orderId: updated.id,
          billNo: updated.billNo,
          customer: updated.customer.name,
          message: `Order #${updated.id} for ${updated.customer.name} is READY! 🔔`,
        });
      }

      return { success: true, order: updated };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  @SubscribeMessage('kitchen-announcement')
  handleAnnouncement(
    @MessageBody() payload: { message: string; urgent?: boolean },
  ) {
    this.logger.log(`📢 Kitchen Announcement: ${payload.message}`);
    this.server.emit('kitchen-announcement', {
      message: payload.message,
      urgent: Boolean(payload.urgent),
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    });
    return { success: true };
  }

  /**
   * Helper to broadcast from HTTP controller as well
   */
  broadcastOrderCreated(order: ShopOrder) {
    if (this.server) {
      this.server.emit('order-created', order);
    }
  }

  broadcastOrderUpdated(order: ShopOrder) {
    if (this.server) {
      this.server.emit('order-updated', order);
    }
  }
}
