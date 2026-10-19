// ╔══════════════════════════════════════════════════════════════════════╗
// ║  📱 WHATSAPP SERVICE — Sends receipts via Twilio WhatsApp API     ║
// ╚══════════════════════════════════════════════════════════════════════╝

import { Injectable, Logger } from '@nestjs/common';
import twilio from 'twilio';
import { WHATSAPP_CONFIG, getWhatsAppMessage } from '../../config/whatsapp.config';
import { SHOP_CONFIG } from '../../config/shop.config';

@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);
  private client: twilio.Twilio | null = null;
  private isConfigured = false;

  constructor() {
    this.initTwilioClient();
  }

  private initTwilioClient() {
    const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } = WHATSAPP_CONFIG;
    if (
      TWILIO_ACCOUNT_SID &&
      TWILIO_ACCOUNT_SID !== 'YOUR_TWILIO_ACCOUNT_SID_HERE' &&
      TWILIO_AUTH_TOKEN &&
      TWILIO_AUTH_TOKEN !== 'YOUR_TWILIO_AUTH_TOKEN_HERE'
    ) {
      try {
        this.client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
        this.isConfigured = true;
        this.logger.log('✅ Twilio WhatsApp client initialized successfully');
      } catch (err: any) {
        this.logger.error(`❌ Failed to initialize Twilio client: ${err?.message || err}`);
        this.client = null;
        this.isConfigured = false;
      }
    } else {
      this.logger.warn(
        '⚠️ Twilio credentials are not set (placeholder detected). Running in simulation/mock mode for development.',
      );
      this.isConfigured = false;
    }
  }

  /**
   * Send a WhatsApp message with PDF receipt to customer
   *
   * @param customerPhone - Customer's phone number (e.g. "9876543210")
   * @param customerName  - Customer's name for the heartwarming message
   * @param totalAmount   - Order total for the message
   * @param pdfPath       - Absolute path or public URL of the generated PDF
   */
  async sendReceipt(
    customerPhone: string,
    customerName: string,
    totalAmount: number,
    pdfPath?: string,
  ): Promise<{ success: boolean; messageId?: string; error?: string; simulated?: boolean }> {
    try {
      const formattedPhone = this.formatPhoneNumber(customerPhone);
      const whatsappTo = `whatsapp:${formattedPhone}`;

      this.logger.log(`📱 Sending WhatsApp receipt to ${whatsappTo}`);

      // Get random heartwarming message
      const messageBody = getWhatsAppMessage(
        customerName,
        totalAmount,
        SHOP_CONFIG.fullName,
      );

      // If running without real Twilio credentials, simulate success
      if (!this.isConfigured || !this.client) {
        const mockSid = `mock_msg_${Date.now()}`;
        this.logger.log(`[SIMULATED] WhatsApp sent to ${whatsappTo}: ${messageBody.slice(0, 50)}...`);
        return {
          success: true,
          messageId: mockSid,
          simulated: true,
        };
      }

      // Prepare message payload
      const messagePayload: any = {
        from: WHATSAPP_CONFIG.TWILIO_WHATSAPP_NUMBER,
        to: whatsappTo,
        body: messageBody,
      };

      // Only add mediaUrl if it's a valid public HTTP(S) URL
      if (pdfPath && (pdfPath.startsWith('http://') || pdfPath.startsWith('https://'))) {
        messagePayload.mediaUrl = [pdfPath];
      }

      const message = await this.client.messages.create(messagePayload);
      this.logger.log(`✅ WhatsApp sent! Message SID: ${message.sid}`);

      return {
        success: true,
        messageId: message.sid,
      };
    } catch (error: any) {
      this.logger.error(`❌ WhatsApp send failed: ${error?.message || error}`);
      return {
        success: false,
        error: error?.message || 'Failed to send WhatsApp message',
      };
    }
  }

  /**
   * Send a WhatsApp message with a hosted PDF URL
   */
  async sendReceiptWithUrl(
    customerPhone: string,
    customerName: string,
    totalAmount: number,
    pdfUrl: string,
  ): Promise<{ success: boolean; messageId?: string; error?: string; simulated?: boolean }> {
    return this.sendReceipt(customerPhone, customerName, totalAmount, pdfUrl);
  }

  /**
   * Send a simple text-only WhatsApp message
   */
  async sendTextMessage(
    phone: string,
    message: string,
  ): Promise<{ success: boolean; messageId?: string; error?: string; simulated?: boolean }> {
    try {
      const formattedPhone = this.formatPhoneNumber(phone);
      const whatsappTo = `whatsapp:${formattedPhone}`;

      if (!this.isConfigured || !this.client) {
        const mockSid = `mock_text_${Date.now()}`;
        this.logger.log(`[SIMULATED] WhatsApp text sent to ${whatsappTo}: ${message}`);
        return { success: true, messageId: mockSid, simulated: true };
      }

      const msg = await this.client.messages.create({
        from: WHATSAPP_CONFIG.TWILIO_WHATSAPP_NUMBER,
        to: whatsappTo,
        body: message,
      });

      return { success: true, messageId: msg.sid };
    } catch (error: any) {
      this.logger.error(`❌ Text message failed: ${error?.message || error}`);
      return { success: false, error: error?.message || 'Failed to send text' };
    }
  }

  /**
   * Format phone number with Indian country code
   */
  private formatPhoneNumber(phone: string): string {
    const digits = phone.replace(/\D/g, '');

    if (digits.startsWith('91') && digits.length === 12) {
      return `+${digits}`;
    }

    if (digits.length === 10) {
      return `+91${digits}`;
    }

    if (phone.startsWith('+')) {
      return phone;
    }

    return `+91${digits}`;
  }
}
