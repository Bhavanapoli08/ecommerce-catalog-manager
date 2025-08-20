import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { CategoriesModule } from './categories/categories.module';
import { AttributesModule } from './attributes/attributes.module';
import { ProductsModule } from './products/products.module';

@Module({
  imports: [PrismaModule, CategoriesModule, AttributesModule, ProductsModule],
})
export class AppModule {}
