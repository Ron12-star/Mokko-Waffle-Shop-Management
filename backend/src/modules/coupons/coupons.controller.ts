import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { CouponsService, CouponItem } from './coupons.service';

@Controller('api/coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Get()
  getAllCoupons() {
    return {
      success: true,
      coupons: this.couponsService.getAllCoupons(),
    };
  }

  @Post()
  createCoupon(@Body() body: Partial<CouponItem>) {
    try {
      const coupon = this.couponsService.createCoupon(body);
      return { success: true, coupon, message: 'Coupon created successfully' };
    } catch (err: any) {
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('validate')
  validateCoupon(@Body() body: { code: string; subtotal: number }) {
    if (!body?.code) {
      throw new HttpException('Coupon code is required', HttpStatus.BAD_REQUEST);
    }
    const result = this.couponsService.validateCoupon(body.code, Number(body.subtotal) || 0);
    if (!result.valid) {
      throw new HttpException(result.message, HttpStatus.BAD_REQUEST);
    }
    return { success: true, ...result };
  }

  @Delete(':code')
  deleteCoupon(@Param('code') code: string) {
    try {
      const result = this.couponsService.deleteCoupon(code);
      return { ...result, message: 'Coupon deleted successfully' };
    } catch (err: any) {
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
    }
  }
}
