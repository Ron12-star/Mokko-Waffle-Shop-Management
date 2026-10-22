import { Injectable, Logger, Optional } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MenuItem, MenuItemDocument } from './schemas/menu-item.schema';
import { Category, CategoryDocument } from './schemas/category.schema';
import { Topping, ToppingDocument } from './schemas/topping.schema';

export interface MenuItemDto {
  id: number;
  name: string;
  category: string;
  price: number;
  sizes?: { small?: number; big?: number } | null;
  description: string;
  emoji: string;
  available: boolean;
  cost?: number;
  soldCount?: number;
}

export interface CategoryDto {
  id: string;
  name: string;
  emoji: string;
  order: number;
}

export interface ToppingDto {
  id: number;
  name: string;
  price: number;
  emoji: string;
  available: boolean;
  isReserved: boolean;
  category: string;
}

@Injectable()
export class MenuService {
  private readonly logger = new Logger(MenuService.name);

  // In-memory Category Store
  private categories: CategoryDto[] = [
    { id: 'cat-1', name: 'Waffles', emoji: '🧇', order: 1 },
    { id: 'cat-2', name: 'Brownies', emoji: '🍫', order: 2 },
    { id: 'cat-3', name: 'Sizzling Brownies', emoji: '🔥', order: 3 },
    { id: 'cat-4', name: 'Mokko Shake', emoji: '🥤', order: 4 },
    { id: 'cat-5', name: 'Coffee', emoji: '☕', order: 5 },
  ];

  // In-memory Menu Items populated directly from user's Menu specification
  private menuItems: MenuItemDto[] = [
    // 🧇 Waffles (Small & Big sizes)
    { id: 1, name: 'Milk Choco Waffle', category: 'Waffles', price: 49, sizes: { small: 49, big: 100 }, description: 'Warm crispy waffle with rich Belgian milk chocolate', emoji: '🧇', available: true, cost: 22, soldCount: 142 },
    { id: 2, name: 'White Choco Waffle', category: 'Waffles', price: 60, sizes: { small: 60, big: 110 }, description: 'Drizzled with smooth creamy white chocolate', emoji: '🧇', available: true, cost: 25, soldCount: 98 },
    { id: 3, name: 'Dark Choco Waffle', category: 'Waffles', price: 60, sizes: { small: 60, big: 110 }, description: 'Intense 70% Belgian dark chocolate luxury', emoji: '🍫', available: true, cost: 26, soldCount: 125 },
    { id: 4, name: 'Triple Choco Waffle', category: 'Waffles', price: 80, sizes: { small: 80, big: 150 }, description: 'Trio of Milk, White & Dark chocolate indulgence', emoji: '🍫', available: true, cost: 35, soldCount: 210 },
    { id: 5, name: 'Black & White Waffle', category: 'Waffles', price: 49, sizes: { small: 49, big: 100 }, description: 'Half dark chocolate and half silky white chocolate', emoji: '🧇', available: true, cost: 23, soldCount: 89 },
    { id: 6, name: 'Milk & White Choco Waffle', category: 'Waffles', price: 100, sizes: null, description: 'Dual blend of velvety milk and white chocolate', emoji: '🧇', available: true, cost: 42, soldCount: 76 },
    { id: 7, name: 'Cookies Choco Waffle', category: 'Waffles', price: 70, sizes: { small: 70, big: 130 }, description: 'Topped with crushed cookie crumbles & chocolate', emoji: '🍪', available: true, cost: 30, soldCount: 115 },
    { id: 8, name: 'Biscoff Waffle', category: 'Waffles', price: 80, sizes: { small: 80, big: 150 }, description: 'Caramelized Lotus Biscoff spread and biscuit crunch', emoji: '✨', available: true, cost: 36, soldCount: 184 },
    { id: 9, name: 'Naked Nutella', category: 'Waffles', price: 100, sizes: { small: 100, big: 180 }, description: 'Loaded with authentic Hazelnut Nutella spread', emoji: '🍫', available: true, cost: 45, soldCount: 232 },
    { id: 10, name: 'Naked Nutella Biscoff', category: 'Waffles', price: 110, sizes: { small: 110, big: 210 }, description: 'Nutella combined with caramelized Lotus Biscoff', emoji: '✨', available: true, cost: 50, soldCount: 195 },
    { id: 11, name: 'Triple Choco Biscoff', category: 'Waffles', price: 110, sizes: { small: 110, big: 210 }, description: 'Triple chocolate loaded with crunchy Biscoff magic', emoji: '🍫', available: true, cost: 52, soldCount: 167 },
    { id: 12, name: 'KitKat Waffle', category: 'Waffles', price: 80, sizes: { small: 80, big: 150 }, description: 'Crunchy KitKat wafer chunks with melted chocolate', emoji: '🍫', available: true, cost: 35, soldCount: 140 },
    { id: 13, name: 'Blueberry Waffle', category: 'Waffles', price: 80, sizes: { small: 80, big: 150 }, description: 'Tangy sweet wild blueberry compote & cream', emoji: '🫐', available: true, cost: 32, soldCount: 94 },
    { id: 14, name: 'Strawberry Waffle', category: 'Waffles', price: 80, sizes: { small: 80, big: 150 }, description: 'Fresh strawberry sauce glaze over warm golden waffle', emoji: '🍓', available: true, cost: 32, soldCount: 118 },
    { id: 15, name: 'Oreo Waffle', category: 'Waffles', price: 80, sizes: { small: 80, big: 150 }, description: 'Crushed Oreo cookies smothered in vanilla white cream', emoji: '🍪', available: true, cost: 33, soldCount: 153 },
    { id: 16, name: 'KitKat Oreo Mix Waffle', category: 'Waffles', price: 90, sizes: { small: 90, big: 180 }, description: 'Ultimate fusion of crunchy KitKat & Oreo cookies', emoji: '🍬', available: true, cost: 40, soldCount: 178 },

    // 🍫 Brownies
    { id: 17, name: 'Classical Brownies', category: 'Brownies', price: 99, sizes: null, description: 'Traditional fudgy chocolate brownie with dense center', emoji: '🍫', available: true, cost: 35, soldCount: 112 },
    { id: 18, name: 'Oreo Brownies', category: 'Brownies', price: 149, sizes: null, description: 'Fudgy brownie baked with Oreo cookie chunks inside', emoji: '🍪', available: true, cost: 50, soldCount: 88 },
    { id: 19, name: 'Biscoff Brownies', category: 'Brownies', price: 149, sizes: null, description: 'Lotus Biscoff layer melted over warm brownie', emoji: '✨', available: true, cost: 52, soldCount: 96 },
    { id: 20, name: 'Brownies with Icecream', category: 'Brownies', price: 129, sizes: null, description: 'Warm chocolate brownie topped with cold vanilla scoop', emoji: '🍨', available: true, cost: 45, soldCount: 164 },
    { id: 21, name: 'Dark Chocolate Brownies', category: 'Brownies', price: 149, sizes: null, description: 'Intense cocoa rich dark chocolate brownie slice', emoji: '🍫', available: true, cost: 55, soldCount: 75 },
    { id: 22, name: 'Nutella Brownies', category: 'Brownies', price: 189, sizes: null, description: 'Thick slather of hazelnut Nutella over gooey brownie', emoji: '🍫', available: true, cost: 65, soldCount: 130 },
    { id: 23, name: 'Mokko Special Triple Crunch Brownies', category: 'Brownies', price: 199, sizes: null, description: 'Chef special triple chocolate crunchy brownie delight', emoji: '👑', available: true, cost: 70, soldCount: 145 },

    // 🔥 Sizzling Brownies
    { id: 24, name: 'Triple Choco Sizzling Brownies', category: 'Sizzling Brownies', price: 199, sizes: null, description: 'Served on a hot sizzler plate with smoking chocolate sauce', emoji: '🔥', available: true, cost: 70, soldCount: 182 },
    { id: 25, name: 'Mokko Special Sizzling Brownies', category: 'Sizzling Brownies', price: 229, sizes: null, description: 'Signature sizzler brownie with nuts, ice cream & fudge', emoji: '✨', available: true, cost: 80, soldCount: 204 },

    // 🥤 Mokko Shake
    { id: 26, name: 'Biscoff Shake', category: 'Mokko Shake', price: 179, sizes: null, description: 'Creamy milkshake blended with genuine Lotus Biscoff spread', emoji: '🥤', available: true, cost: 55, soldCount: 124 },
    { id: 27, name: 'Brownies Shake', category: 'Mokko Shake', price: 179, sizes: null, description: 'Thick chocolate shake infused with blended fudgy brownies', emoji: '🍫', available: true, cost: 55, soldCount: 142 },
    { id: 28, name: 'KitKat Shake', category: 'Mokko Shake', price: 179, sizes: null, description: 'Frothy chocolate wafer milkshake with KitKat crumble', emoji: '🥤', available: true, cost: 55, soldCount: 138 },
    { id: 29, name: 'Mokko Special Shake', category: 'Mokko Shake', price: 189, sizes: null, description: 'Our chef secret signature blend of chocolate & hazelnut', emoji: '👑', available: true, cost: 60, soldCount: 168 },

    // ☕ Coffee
    { id: 30, name: 'Espresso Shot', category: 'Coffee', price: 79, sizes: null, description: 'Single concentrated shot of freshly ground roasted beans', emoji: '☕', available: true, cost: 18, soldCount: 65 },
    { id: 31, name: 'Ice Latte', category: 'Coffee', price: 129, sizes: null, description: 'Chilled milk poured over smooth espresso shot with ice', emoji: '🧊', available: true, cost: 35, soldCount: 110 },
    { id: 32, name: 'Cold Coffee', category: 'Coffee', price: 119, sizes: null, description: 'Classic Indian style thick sweet blended cold coffee', emoji: '☕', available: true, cost: 30, soldCount: 195 },
    { id: 33, name: 'Hot Americano', category: 'Coffee', price: 99, sizes: null, description: 'Bold espresso diluted with hot water for clean rich aroma', emoji: '☕', available: true, cost: 20, soldCount: 82 },
  ];

  // Extra Toppings (Reserved for future use)
  private toppings: ToppingDto[] = [
    { id: 1, name: 'Extra Nutella Drizzle', price: 40, emoji: '🍫', available: true, isReserved: true, category: 'Sauces' },
    { id: 2, name: 'Vanilla Ice Cream Scoop', price: 35, emoji: '🍨', available: true, isReserved: true, category: 'Ice Cream' },
    { id: 3, name: 'Crushed Oreo Crumbs', price: 25, emoji: '🍪', available: true, isReserved: true, category: 'Crunch' },
    { id: 4, name: 'Lotus Biscoff Spread', price: 45, emoji: '✨', available: true, isReserved: true, category: 'Sauces' },
    { id: 5, name: 'Roasted Almond Flakes', price: 30, emoji: '🥜', available: true, isReserved: true, category: 'Nuts' },
    { id: 6, name: 'Whipped Cream Cloud', price: 25, emoji: '🍦', available: true, isReserved: true, category: 'Cream' },
    { id: 7, name: 'Dark Choco Chips', price: 20, emoji: '🍬', available: true, isReserved: true, category: 'Crunch' },
  ];

  constructor(
    @Optional() @InjectModel(MenuItem.name) private readonly menuItemModel?: Model<MenuItemDocument>,
    @Optional() @InjectModel(Category.name) private readonly categoryModel?: Model<CategoryDocument>,
    @Optional() @InjectModel(Topping.name) private readonly toppingModel?: Model<ToppingDocument>,
  ) {
    this.logger.log(`Initialized MenuService with ${this.menuItems.length} items & ${this.categories.length} categories`);
  }

  // --- Category Operations ---
  getCategories(): CategoryDto[] {
    return this.categories;
  }

  addCategory(name: string, emoji = '✨'): CategoryDto {
    const existing = this.categories.find(c => c.name.toLowerCase() === name.trim().toLowerCase());
    if (existing) return existing;

    const newCat: CategoryDto = {
      id: `cat-${Date.now()}`,
      name: name.trim(),
      emoji: emoji || '✨',
      order: this.categories.length + 1,
    };
    this.categories.push(newCat);
    this.logger.log(`Added new category: ${newCat.name}`);
    return newCat;
  }

  updateCategory(id: string, name: string, emoji?: string): CategoryDto {
    const index = this.categories.findIndex(c => c.id === id || c.name.toLowerCase() === id.toLowerCase());
    if (index === -1) throw new Error('Category not found');

    const oldName = this.categories[index].name;
    this.categories[index].name = name.trim();
    if (emoji) this.categories[index].emoji = emoji;

    // Update items belonging to this category
    this.menuItems.forEach(item => {
      if (item.category === oldName) {
        item.category = name.trim();
      }
    });

    return this.categories[index];
  }

  deleteCategory(id: string): { success: boolean; deleted: string } {
    const index = this.categories.findIndex(c => c.id === id || c.name.toLowerCase() === id.toLowerCase());
    if (index === -1) throw new Error('Category not found');
    const removed = this.categories.splice(index, 1)[0];
    return { success: true, deleted: removed.name };
  }

  // --- Menu Item Operations ---
  getMenuItems(category?: string): MenuItemDto[] {
    if (!category || category === 'All') {
      return this.menuItems;
    }
    return this.menuItems.filter(i => i.category.toLowerCase() === category.toLowerCase());
  }

  getMenuItemById(id: number): MenuItemDto | undefined {
    return this.menuItems.find(i => i.id === id);
  }

  createMenuItem(dto: Partial<MenuItemDto>): MenuItemDto {
    if (!dto.name || !dto.category) {
      throw new Error('Name and category are required');
    }

    const nextId = this.menuItems.length > 0 ? Math.max(...this.menuItems.map(i => i.id)) + 1 : 1;

    // Ensure category exists
    this.addCategory(dto.category);

    const newItem: MenuItemDto = {
      id: nextId,
      name: dto.name.trim(),
      category: dto.category.trim(),
      price: Number(dto.price) || (dto.sizes?.small ? Number(dto.sizes.small) : 100),
      sizes: dto.sizes ? {
        small: dto.sizes.small ? Number(dto.sizes.small) : undefined,
        big: dto.sizes.big ? Number(dto.sizes.big) : undefined,
      } : null,
      description: dto.description || '',
      emoji: dto.emoji || (dto.category === 'Waffles' ? '🧇' : dto.category === 'Coffee' ? '☕' : '🍫'),
      available: dto.available ?? true,
      cost: Number(dto.cost) || Math.round((Number(dto.price) || 100) * 0.35),
      soldCount: 0,
    };

    this.menuItems.push(newItem);
    this.logger.log(`Created new menu item: ${newItem.name} (ID: ${newItem.id})`);
    return newItem;
  }

  updateMenuItem(id: number, dto: Partial<MenuItemDto>): MenuItemDto {
    const index = this.menuItems.findIndex(i => i.id === id);
    if (index === -1) throw new Error(`Menu item with ID ${id} not found`);

    const existing = this.menuItems[index];

    this.menuItems[index] = {
      ...existing,
      ...dto,
      id: existing.id,
      price: dto.price !== undefined ? Number(dto.price) : existing.price,
      sizes: dto.sizes !== undefined ? dto.sizes : existing.sizes,
    };

    return this.menuItems[index];
  }

  toggleAvailability(id: number): MenuItemDto {
    const index = this.menuItems.findIndex(i => i.id === id);
    if (index === -1) throw new Error(`Menu item with ID ${id} not found`);

    this.menuItems[index].available = !this.menuItems[index].available;
    return this.menuItems[index];
  }

  deleteMenuItem(id: number): { success: boolean; id: number } {
    const index = this.menuItems.findIndex(i => i.id === id);
    if (index === -1) throw new Error(`Menu item with ID ${id} not found`);
    this.menuItems.splice(index, 1);
    return { success: true, id };
  }

  // --- Topping Operations (Reserved for future use) ---
  getToppings(): ToppingDto[] {
    return this.toppings;
  }

  addTopping(dto: Partial<ToppingDto>): ToppingDto {
    const nextId = this.toppings.length > 0 ? Math.max(...this.toppings.map(t => t.id)) + 1 : 1;
    const newTopping: ToppingDto = {
      id: nextId,
      name: dto.name || 'New Topping',
      price: Number(dto.price) || 20,
      emoji: dto.emoji || '🍫',
      available: dto.available ?? true,
      isReserved: true, // Reserved for future use
      category: dto.category || 'General',
    };
    this.toppings.push(newTopping);
    return newTopping;
  }

  toggleTopping(id: number): ToppingDto {
    const topping = this.toppings.find(t => t.id === id);
    if (!topping) throw new Error(`Topping with ID ${id} not found`);
    topping.available = !topping.available;
    return topping;
  }
}
