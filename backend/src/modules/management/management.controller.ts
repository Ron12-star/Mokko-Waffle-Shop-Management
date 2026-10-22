import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Body,
  Param,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ManagementService } from './management.service';

@Controller('api')
export class ManagementController {
  constructor(private readonly managementService: ManagementService) {}

  // --- Customers Endpoints ---
  @Get('customers')
  async getCustomers(@Query('search') search?: string) {
    const list = await this.managementService.getCustomers(search);
    return { success: true, customers: list };
  }

  @Post('customers')
  addCustomer(@Body() body: { name: string; phone: string }) {
    if (!body?.name || !body?.phone) {
      throw new HttpException('Customer name and phone are required', HttpStatus.BAD_REQUEST);
    }
    const customer = this.managementService.addCustomer(body);
    return { success: true, customer, message: 'Customer registered successfully' };
  }

  // --- Inventory Endpoints ---
  @Get('inventory')
  getInventory() {
    return {
      success: true,
      inventory: this.managementService.getInventory(),
    };
  }

  @Patch('inventory/:id/stock')
  updateStock(@Param('id') id: string, @Body('stock') stock: number) {
    try {
      const item = this.managementService.updateStock(Number(id), stock);
      return { success: true, item, message: 'Stock updated successfully' };
    } catch (err: any) {
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('inventory')
  addIngredient(@Body() body: any) {
    if (!body?.name) {
      throw new HttpException('Ingredient name is required', HttpStatus.BAD_REQUEST);
    }
    const item = this.managementService.addIngredient(body);
    return { success: true, item, message: 'Ingredient added to inventory' };
  }

  // --- Staff Endpoints ---
  @Get('staff')
  getStaff() {
    return {
      success: true,
      staff: this.managementService.getStaff(),
    };
  }

  @Patch('staff/:id/shift')
  toggleShift(@Param('id') id: string) {
    try {
      const staff = this.managementService.toggleShift(id);
      return { success: true, staff, message: `Staff status changed to ${staff.status}` };
    } catch (err: any) {
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('staff')
  addStaff(@Body() body: any) {
    if (!body?.name) {
      throw new HttpException('Staff name is required', HttpStatus.BAD_REQUEST);
    }
    const staff = this.managementService.addStaff(body);
    return { success: true, staff, message: 'Staff member added' };
  }

  // --- Settings Endpoints ---
  @Get('settings')
  getSettings() {
    return {
      success: true,
      settings: this.managementService.getSettings(),
    };
  }

  @Put('settings')
  updateSettings(@Body() body: any) {
    const updated = this.managementService.updateSettings(body);
    return { success: true, settings: updated, message: 'Settings saved successfully' };
  }
}
