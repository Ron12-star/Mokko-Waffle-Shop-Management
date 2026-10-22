import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { station: string; password: string; name?: string }) {
    if (!body?.password) {
      throw new HttpException('Password or PIN is required', HttpStatus.BAD_REQUEST);
    }
    try {
      return await this.authService.loginWithPassword(body);
    } catch (err: any) {
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('send-otp')
  async sendOtp(@Body() body: { phone: string; role?: string }) {
    try {
      return await this.authService.sendOtp(body?.phone || 'staff', body?.role || 'counter');
    } catch (err: any) {
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('verify-otp')
  async verifyOtp(@Body() body: { phone: string; otp: string; role?: string }) {
    if (!body?.otp) {
      throw new HttpException('Password or PIN code is required', HttpStatus.BAD_REQUEST);
    }
    try {
      return await this.authService.verifyOtp(body.phone, body.otp, body.role || 'counter');
    } catch (err: any) {
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
    }
  }
}
