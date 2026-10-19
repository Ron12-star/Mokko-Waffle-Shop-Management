import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Res,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { ReceiptService } from './receipt.service';
import { WhatsAppService } from '../whatsapp/whatsapp.service';
import { SendReceiptRequest, SendReceiptResponse } from '../../types/order.types';
import { SHOP_CONFIG } from '../../config/shop.config';

@Controller('api')
export class ReceiptController {
  private readonly logger = new Logger(ReceiptController.name);

  constructor(
    private readonly receiptService: ReceiptService,
    private readonly whatsAppService: WhatsAppService,
  ) {}

  @Get('health')
  healthCheck() {
    return {
      status: 'ok',
      shop: SHOP_CONFIG.fullName,
      time: new Date().toISOString(),
    };
  }

  @Post('receipt/generate')
  async generateReceipt(@Body() order: SendReceiptRequest) {
    try {
      if (!order.billNo) {
        order.billNo = this.receiptService.generateBillNo();
      }
      const pdfPath = await this.receiptService.generatePDF(order);
      const filename = path.basename(pdfPath);
      return {
        success: true,
        billNo: order.billNo,
        pdfPath,
        downloadUrl: `/api/receipt/file/${filename}`,
      };
    } catch (error: any) {
      this.logger.error(`Failed to generate receipt: ${error.message}`);
      throw new HttpException(
        error.message || 'Error generating receipt',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('receipt/send')
  async sendReceipt(@Body() order: SendReceiptRequest): Promise<SendReceiptResponse> {
    try {
      if (!order.customer || !order.customer.phone) {
        throw new HttpException('Customer phone number is required', HttpStatus.BAD_REQUEST);
      }

      if (!order.billNo) {
        order.billNo = this.receiptService.generateBillNo();
      }

      // 1. Generate PDF receipt
      const pdfPath = await this.receiptService.generatePDF(order);

      // 2. Send via WhatsApp
      const whatsappResult = await this.whatsAppService.sendReceipt(
        order.customer.phone,
        order.customer.name || 'Valued Customer',
        order.summary?.total || 0,
        pdfPath,
      );

      return {
        success: true,
        message: whatsappResult.simulated
          ? 'Receipt generated and WhatsApp simulated (dev mode)'
          : 'Receipt generated and sent via WhatsApp',
        billNo: order.billNo,
        whatsappSent: whatsappResult.success,
        pdfPath,
      };
    } catch (error: any) {
      this.logger.error(`Failed to process order receipt: ${error.message}`);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Internal server error processing receipt',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('whatsapp/text')
  async sendWhatsAppText(@Body() payload: { phone: string; message: string }) {
    if (!payload.phone || !payload.message) {
      throw new HttpException('Phone and message are required', HttpStatus.BAD_REQUEST);
    }
    return this.whatsAppService.sendTextMessage(payload.phone, payload.message);
  }

  @Get('receipt/file/:filename')
  downloadReceipt(@Param('filename') filename: string, @Res() res: Response) {
    const receiptsDir = path.join(process.cwd(), 'receipts');
    const safeFilename = path.basename(filename);
    const filePath = path.join(receiptsDir, safeFilename);

    if (!fs.existsSync(filePath)) {
      throw new HttpException('Receipt not found', HttpStatus.NOT_FOUND);
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${safeFilename}"`);
    return res.sendFile(filePath);
  }
}
