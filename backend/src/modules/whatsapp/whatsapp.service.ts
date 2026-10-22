// ╔══════════════════════════════════════════════════════════════════════╗
// ║  📱 WHATSAPP SERVICE — Powered by Meta WhatsApp Cloud API (Free)    ║
// ║  Direct Meta Graph API integration with automatic fallback link.    ║
// ╚══════════════════════════════════════════════════════════════════════╝

import { Injectable, Logger } from '@nestjs/common';
import { WHATSAPP_CONFIG, getWhatsAppMessage } from '../../config/whatsapp.config';
import { SHOP_CONFIG } from '../../config/shop.config';

@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);
  private isMetaConfigured = false;

  constructor() {
    this.checkConfig();
  }

  private checkConfig() {
    const { META_WA_PHONE_NUMBER_ID, META_WA_ACCESS_TOKEN } = WHATSAPP_CONFIG;
    if (
      META_WA_PHONE_NUMBER_ID &&
      META_WA_PHONE_NUMBER_ID.trim() !== '' &&
      META_WA_ACCESS_TOKEN &&
      META_WA_ACCESS_TOKEN.trim() !== ''
    ) {
      this.isMetaConfigured = true;
      this.logger.log('✅ Meta WhatsApp Cloud API is configured and ready! (1,000 Free msgs/mo)');
    } else {
      this.logger.warn(
        '⚠️ Meta WhatsApp Cloud API credentials are not set in .env. Messages will use direct WhatsApp Click-to-Chat & simulator mode.',
      );
      this.isMetaConfigured = false;
    }
  }

  /**
   * Format full itemized receipt for WhatsApp message body
   */
  formatReceiptText(order: any): string {
    const itemsText = (order.items || [])
      .map(
        (it: any) =>
          `• ${it.name} × ${it.qty} = ₹${it.price * it.qty}`,
      )
      .join('\n');

    const discountText =
      order.summary?.discountAmount > 0
        ? `\n🎟️ *Discount:* -₹${order.summary.discountAmount} ${
            order.summary.discountCode ? `(${order.summary.discountCode})` : ''
          }`
        : '';

    return (
      `🧇 *${SHOP_CONFIG.fullName}* ☕\n` +
      `_${SHOP_CONFIG.tagline}_\n` +
      `📞 ${SHOP_CONFIG.phone}\n` +
      `──────────────────────────\n` +
      `🧾 *Bill No:* ${order.billNo || 'MK-0001'}\n` +
      `📅 *Date & Time:* ${order.time || new Date().toLocaleTimeString('en-IN')}\n` +
      `👤 *Customer:* ${order.customer?.name || 'Valued Customer'}\n` +
      `📱 *Phone:* +91 ${order.customer?.phone || ''}\n` +
      `💳 *Payment Method:* ${(order.paymentMethod || 'CASH').toUpperCase()}\n` +
      `──────────────────────────\n` +
      `*ORDERED ITEMS:*\n` +
      `${itemsText}\n` +
      `──────────────────────────\n` +
      `Subtotal: ₹${order.summary?.subtotal || 0}` +
      `${discountText}\n` +
      `*💰 GRAND TOTAL: ₹${order.summary?.discountAmount ? ((order.summary?.subtotal || 0) - order.summary.discountAmount) : (order.summary?.total || order.summary?.subtotal || 0)}*\n` +
      `──────────────────────────\n` +
      `♡ ${SHOP_CONFIG.footerMessage}\n` +
      `_See you soon for more sweetness!_ ✨`
    );
  }

  /**
   * Send WhatsApp message using Meta WhatsApp Cloud API
   */
  private async sendMetaCloudMessage(
    recipientPhone: string,
    messageText: string,
    mediaUrl?: string,
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const cleanDigits = recipientPhone.replace(/\D/g, '');
    const to = cleanDigits.length === 10 ? `91${cleanDigits}` : cleanDigits;

    const endpoint = `https://graph.facebook.com/${WHATSAPP_CONFIG.META_WA_API_VERSION}/${WHATSAPP_CONFIG.META_WA_PHONE_NUMBER_ID}/messages`;

    // Prepare Meta Cloud API JSON payload
    let payload: any = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'text',
      text: {
        preview_url: false,
        body: messageText,
      },
    };

    // If mediaUrl is a public web link, send as document
    if (mediaUrl && (mediaUrl.startsWith('http://') || mediaUrl.startsWith('https://'))) {
      payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'document',
        document: {
          link: mediaUrl,
          caption: messageText.slice(0, 500),
          filename: 'MOKKO_Receipt.pdf',
        },
      };
    }

    try {
      this.logger.log(`📱 Calling Meta WhatsApp Cloud API for: +${to}`);
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${WHATSAPP_CONFIG.META_WA_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const errorMsg = data.error?.message || `Meta Cloud API failed with status ${response.status}`;
        this.logger.error(`❌ Meta WhatsApp Cloud API Error: ${errorMsg}`);
        return { success: false, error: errorMsg };
      }

      const messageId = data.messages?.[0]?.id || `meta_${Date.now()}`;
      this.logger.log(`✅ Meta WhatsApp message dispatched successfully! ID: ${messageId}`);
      return { success: true, messageId };
    } catch (err: any) {
      this.logger.error(`❌ Network error calling Meta Cloud API: ${err.message}`);
      return { success: false, error: err.message };
    }
  }

  /**
   * Send Order Receipt (Meta Cloud API + Direct WhatsApp Link)
   */
  async sendReceipt(
    customerPhone: string,
    customerName: string,
    totalAmount: number,
    pdfPath?: string,
    orderData?: any,
  ): Promise<{ success: boolean; messageId?: string; error?: string; waLink?: string; simulated?: boolean }> {
    const cleanDigits = customerPhone.replace(/\D/g, '').slice(-10);

    // Format full itemized message
    const messageBody = orderData
      ? this.formatReceiptText(orderData)
      : getWhatsAppMessage(customerName, totalAmount, SHOP_CONFIG.fullName);

    // Always generate instant direct WhatsApp Click-to-Chat link
    const waLink = `https://api.whatsapp.com/send?phone=91${cleanDigits}&text=${encodeURIComponent(messageBody)}`;

    // If Meta Cloud API is configured, send directly via Meta Graph API
    if (this.isMetaConfigured) {
      const metaResult = await this.sendMetaCloudMessage(cleanDigits, messageBody, pdfPath);
      return {
        success: metaResult.success,
        messageId: metaResult.messageId,
        error: metaResult.error,
        waLink,
      };
    }

    // Otherwise simulation mode with instant 1-click WhatsApp link
    this.logger.log(`[DEV/FALLBACK] WhatsApp receipt link prepared for +91 ${cleanDigits}`);
    return {
      success: true,
      messageId: `sim_${Date.now()}`,
      waLink,
      simulated: true,
    };
  }

  /**
   * Send OTP via WhatsApp directly to Store Admin / Owner
   */
  async sendOtpWhatsApp(
    adminPhone: string,
    otp: string,
    role: string,
    staffIdentifier?: string,
  ): Promise<{ success: boolean; messageId?: string; waLink: string; error?: string; simulated?: boolean }> {
    const cleanAdminDigits = adminPhone.replace(/\D/g, '').slice(-10);
    const cleanStaffDigits = staffIdentifier ? staffIdentifier.replace(/\D/g, '').slice(-10) : '';

    const roleTitle =
      role === 'counter'
        ? 'Billing Counter Station'
        : role === 'kitchen'
        ? 'Kitchen Display Station'
        : 'Store Administration';

    const messageBody =
      `🧇 *${SHOP_CONFIG.fullName}* ☕\n` +
      `🔐 *STAFF TERMINAL LOGIN AUTHORIZATION*\n` +
      `──────────────────────────\n` +
      `A login attempt was initiated on the store terminal:\n` +
      `• *Terminal Station:* ${roleTitle}\n` +
      `• *Staff ID / Phone:* ${cleanStaffDigits ? `+91 ${cleanStaffDigits}` : 'Counter Staff'}\n` +
      `• *Timestamp:* ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}\n\n` +
      `👉 *ONE-TIME APPROVAL OTP: ${otp}*\n` +
      `──────────────────────────\n` +
      `⚠️ Share this 6-digit code only with authorized staff currently on duty.\n` +
      `⏰ Valid for 5 minutes.`;

    const waLink = `https://api.whatsapp.com/send?phone=91${cleanAdminDigits}&text=${encodeURIComponent(messageBody)}`;

    if (this.isMetaConfigured) {
      this.logger.log(`📱 Sending Login Approval OTP to Admin Phone: +91 ${cleanAdminDigits}`);
      const metaResult = await this.sendMetaCloudMessage(cleanAdminDigits, messageBody);
      return {
        success: metaResult.success,
        messageId: metaResult.messageId,
        error: metaResult.error,
        waLink,
      };
    }

    this.logger.log(`[DEV/FALLBACK] WhatsApp OTP code ${otp} generated for Admin +91 ${cleanAdminDigits}`);
    return {
      success: true,
      messageId: `sim_otp_${Date.now()}`,
      waLink,
      simulated: true,
    };
  }

  /**
   * Send generic text message via WhatsApp
   */
  async sendTextMessage(
    phone: string,
    message: string,
  ): Promise<{ success: boolean; messageId?: string; error?: string; waLink?: string; simulated?: boolean }> {
    const cleanDigits = phone.replace(/\D/g, '').slice(-10);
    const waLink = `https://api.whatsapp.com/send?phone=91${cleanDigits}&text=${encodeURIComponent(message)}`;

    if (this.isMetaConfigured) {
      const metaResult = await this.sendMetaCloudMessage(cleanDigits, message);
      return { ...metaResult, waLink };
    }

    return { success: true, messageId: `sim_${Date.now()}`, waLink, simulated: true };
  }
}
