// ╔══════════════════════════════════════════════════════════════════════╗
// ║  🧾 RECEIPT SERVICE — Generates PDF receipts using Puppeteer      ║
// ╚══════════════════════════════════════════════════════════════════════╝

import { Injectable, Logger } from '@nestjs/common';
import puppeteer, { Browser } from 'puppeteer';
import * as path from 'path';
import * as fs from 'fs';
import { SendReceiptRequest } from '../../types/order.types';
import { generateReceiptHTML } from './receipt.template';
import { SHOP_CONFIG } from '../../config/shop.config';

@Injectable()
export class ReceiptService {
  private readonly logger = new Logger(ReceiptService.name);

  // Counter for bill numbers
  private billCounter = 124;

  /**
   * Generate the next bill number
   */
  generateBillNo(): string {
    this.billCounter++;
    const padded = String(this.billCounter).padStart(6, '0');
    return `${SHOP_CONFIG.receiptPrefix}-${padded}`;
  }

  /**
   * Generate a PDF receipt and return the file path
   */
  async generatePDF(order: SendReceiptRequest): Promise<string> {
    if (!order.billNo) {
      order.billNo = this.generateBillNo();
    }
    if (!order.dateTime) {
      order.dateTime = this.formatDateTime();
    }
    if (!order.cashier) {
      order.cashier = 'Billing Counter';
    }

    this.logger.log(`📄 Generating PDF receipt for Bill: ${order.billNo}`);

    // Ensure receipts directory exists
    const receiptsDir = path.join(process.cwd(), 'receipts');
    if (!fs.existsSync(receiptsDir)) {
      fs.mkdirSync(receiptsDir, { recursive: true });
    }

    // Generate HTML from template
    const html = generateReceiptHTML(order);

    let browser: Browser | null = null;

    try {
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
        ],
      });

      const page = await browser.newPage();

      // Set content and wait for network/fonts
      await page.setContent(html, { waitUntil: 'domcontentloaded' });

      // Generate PDF with receipt-like dimensions
      const sanitizedBillNo = order.billNo.replace(/[^a-zA-Z0-9-]/g, '_');
      const pdfFileName = `receipt_${sanitizedBillNo}_${Date.now()}.pdf`;
      const pdfPath = path.join(receiptsDir, pdfFileName);

      await page.pdf({
        path: pdfPath,
        width: '380px',
        printBackground: true,
        margin: { top: '0', right: '0', bottom: '0', left: '0' },
      });

      this.logger.log(`✅ PDF generated: ${pdfPath}`);
      return pdfPath;
    } catch (error: any) {
      this.logger.error(`❌ PDF generation failed: ${error?.message || error}`);
      throw error;
    } finally {
      if (browser) {
        try {
          await browser.close();
        } catch (closeErr: any) {
          this.logger.warn(`Failed to close browser: ${closeErr?.message || closeErr}`);
        }
      }
    }
  }

  /**
   * Format current date-time for receipt
   */
  formatDateTime(): string {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    };
    return now.toLocaleString('en-IN', options);
  }
}
