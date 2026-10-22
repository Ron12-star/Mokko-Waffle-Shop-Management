import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MenuController } from './menu.controller';
import { MenuService } from './menu.service';
import { MenuItem, MenuItemSchema } from './schemas/menu-item.schema';
import { Category, CategorySchema } from './schemas/category.schema';
import { Topping, ToppingSchema } from './schemas/topping.schema';

const isMongoConfigured = Boolean(process.env.MONGODB_URI && process.env.MONGODB_URI.trim());

@Module({
  imports: [
    ...(isMongoConfigured
      ? [
          MongooseModule.forFeature([
            { name: MenuItem.name, schema: MenuItemSchema },
            { name: Category.name, schema: CategorySchema },
            { name: Topping.name, schema: ToppingSchema },
          ]),
        ]
      : []),
  ],
  controllers: [MenuController],
  providers: [MenuService],
  exports: [MenuService],
})
export class MenuModule {}
