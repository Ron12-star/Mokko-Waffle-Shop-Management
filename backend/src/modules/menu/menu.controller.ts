import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { MenuService, MenuItemDto } from './menu.service';

@Controller('api/menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  // Get all items or filter by category
  @Get()
  getMenuItems(@Query('category') category?: string) {
    return {
      success: true,
      items: this.menuService.getMenuItems(category),
    };
  }

  // Get item by ID
  @Get('item/:id')
  getMenuItemById(@Param('id') id: string) {
    const item = this.menuService.getMenuItemById(Number(id));
    if (!item) {
      throw new HttpException('Menu item not found', HttpStatus.NOT_FOUND);
    }
    return { success: true, item };
  }

  // Create new menu item
  @Post()
  createMenuItem(@Body() body: Partial<MenuItemDto>) {
    try {
      const item = this.menuService.createMenuItem(body);
      return { success: true, item, message: 'Item created successfully' };
    } catch (err: any) {
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
    }
  }

  // Update existing menu item
  @Put(':id')
  updateMenuItem(@Param('id') id: string, @Body() body: Partial<MenuItemDto>) {
    try {
      const item = this.menuService.updateMenuItem(Number(id), body);
      return { success: true, item, message: 'Item updated successfully' };
    } catch (err: any) {
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
    }
  }

  // Toggle availability (Live stock toggle)
  @Patch(':id/toggle')
  toggleAvailability(@Param('id') id: string) {
    try {
      const item = this.menuService.toggleAvailability(Number(id));
      return { success: true, item };
    } catch (err: any) {
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
    }
  }

  // Delete menu item
  @Delete(':id')
  deleteMenuItem(@Param('id') id: string) {
    try {
      const result = this.menuService.deleteMenuItem(Number(id));
      return { ...result, message: 'Item deleted successfully' };
    } catch (err: any) {
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
    }
  }

  // --- Category / Types Endpoints ---
  @Get('categories')
  getCategories() {
    return {
      success: true,
      categories: this.menuService.getCategories(),
    };
  }

  @Post('categories')
  addCategory(@Body() body: { name: string; emoji?: string }) {
    if (!body?.name) {
      throw new HttpException('Category name is required', HttpStatus.BAD_REQUEST);
    }
    const cat = this.menuService.addCategory(body.name, body.emoji);
    return { success: true, category: cat, message: 'Category added successfully' };
  }

  @Put('categories/:id')
  updateCategory(
    @Param('id') id: string,
    @Body() body: { name: string; emoji?: string },
  ) {
    if (!body?.name) {
      throw new HttpException('Category name is required', HttpStatus.BAD_REQUEST);
    }
    try {
      const cat = this.menuService.updateCategory(id, body.name, body.emoji);
      return { success: true, category: cat, message: 'Category updated successfully' };
    } catch (err: any) {
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete('categories/:id')
  deleteCategory(@Param('id') id: string) {
    try {
      const result = this.menuService.deleteCategory(id);
      return { ...result, message: 'Category deleted successfully' };
    } catch (err: any) {
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
    }
  }

  // --- Extra Toppings Endpoints (Reserved for future use) ---
  @Get('toppings')
  getToppings() {
    return {
      success: true,
      toppings: this.menuService.getToppings(),
      note: 'Extra toppings are configured and reserved for future customization use',
    };
  }

  @Post('toppings')
  addTopping(@Body() body: any) {
    const topping = this.menuService.addTopping(body);
    return { success: true, topping, message: 'Topping added to reserved pool' };
  }

  @Patch('toppings/:id/toggle')
  toggleTopping(@Param('id') id: string) {
    try {
      const topping = this.menuService.toggleTopping(Number(id));
      return { success: true, topping };
    } catch (err: any) {
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
    }
  }
}
