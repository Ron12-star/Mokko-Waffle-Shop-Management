import { Injectable, Logger } from '@nestjs/common';

export interface CouponItem {
  code: string;
  type: 'percentage' | 'flat';
  value: number;
  minOrder: number;
  maxDiscount?: number;
  description: string;
  active: boolean;
}

@Injectable()
export class CouponsService {
  private readonly logger = new Logger(CouponsService.name);

  private coupons: CouponItem[] = [
    {
      code: 'WELCOME10',
      type: 'percentage',
      value: 10,
      minOrder: 100,
      maxDiscount: 100,
      description: '10% OFF on your order (Up to ₹100)',
      active: true,
    },
    {
      code: 'MOKKO50',
      type: 'flat',
      value: 50,
      minOrder: 250,
      description: 'Flat ₹50 OFF on orders above ₹250',
      active: true,
    },
    {
      code: 'WAFFLE20',
      type: 'percentage',
      value: 20,
      minOrder: 200,
      maxDiscount: 150,
      description: '20% OFF Waffle Fiesta',
      active: true,
    },
    {
      code: 'SWEETLOVE',
      type: 'percentage',
      value: 15,
      minOrder: 300,
      description: '15% OFF for Sweet Lovers',
      active: true,
    },
  ];

  getAllCoupons(): CouponItem[] {
    return this.coupons;
  }

  createCoupon(dto: Partial<CouponItem>): CouponItem {
    if (!dto.code || !dto.value) {
      throw new Error('Coupon code and value are required');
    }
    const cleanCode = dto.code.trim().toUpperCase();
    const existing = this.coupons.find(c => c.code === cleanCode);
    if (existing) {
      throw new Error(`Coupon code ${cleanCode} already exists`);
    }

    const newCoupon: CouponItem = {
      code: cleanCode,
      type: dto.type === 'flat' ? 'flat' : 'percentage',
      value: Number(dto.value),
      minOrder: Number(dto.minOrder) || 0,
      maxDiscount: dto.maxDiscount ? Number(dto.maxDiscount) : undefined,
      description: dto.description || `${dto.value}${dto.type === 'flat' ? ' Flat' : '%'} OFF`,
      active: dto.active ?? true,
    };

    this.coupons.push(newCoupon);
    this.logger.log(`Created new coupon: ${newCoupon.code}`);
    return newCoupon;
  }

  validateCoupon(code: string, subtotal: number): {
    valid: boolean;
    discountAmount: number;
    message: string;
    coupon?: CouponItem;
  } {
    if (!code) {
      return { valid: false, discountAmount: 0, message: 'Coupon code is required' };
    }

    const cleanCode = code.trim().toUpperCase();
    const coupon = this.coupons.find(c => c.code === cleanCode);

    if (!coupon || !coupon.active) {
      return { valid: false, discountAmount: 0, message: 'Invalid or inactive coupon code' };
    }

    if (subtotal < coupon.minOrder) {
      return {
        valid: false,
        discountAmount: 0,
        message: `Minimum order of ₹${coupon.minOrder} required for ${coupon.code}`,
      };
    }

    let discountAmount = 0;
    if (coupon.type === 'percentage') {
      discountAmount = Math.round((subtotal * coupon.value) / 100);
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else {
      discountAmount = Math.min(coupon.value, subtotal);
    }

    return {
      valid: true,
      discountAmount,
      message: `Coupon ${coupon.code} applied successfully! Saved ₹${discountAmount}`,
      coupon,
    };
  }

  deleteCoupon(code: string): { success: boolean; code: string } {
    const cleanCode = code.trim().toUpperCase();
    const index = this.coupons.findIndex(c => c.code === cleanCode);
    if (index === -1) {
      throw new Error(`Coupon ${cleanCode} not found`);
    }
    this.coupons.splice(index, 1);
    return { success: true, code: cleanCode };
  }
}
