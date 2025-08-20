import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { SetAttributeValueDto } from './dto/set-attribute-value.dto';
import { ProductStatus } from '@prisma/client';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({ status: 201, description: 'Product created successfully.' })
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Post('values')
  @ApiOperation({ summary: 'Set attribute value for a product' })
  @ApiResponse({ status: 201, description: 'Attribute value set successfully.' })
  setAttributeValue(@Body() setValueDto: SetAttributeValueDto) {
    return this.productsService.setAttributeValue(setValueDto);
  }

  @Post(':id/activate')
  @ApiOperation({ summary: 'Activate a product (validates required attributes)' })
  @ApiResponse({ status: 200, description: 'Product activated successfully.' })
  activate(@Param('id') id: string) {
    return this.productsService.activate(id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all products with pagination' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiQuery({ name: 'status', enum: ProductStatus, required: false })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('categoryId') categoryId?: string,
    @Query('status') status?: ProductStatus,
  ) {
    return this.productsService.findAll(
      page ? Number(page) : 1,
      limit ? Number(limit) : 20,
      categoryId,
      status
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiResponse({ status: 200, description: 'Return the product.' })
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a product' })
  @ApiResponse({ status: 200, description: 'Product updated successfully.' })
  update(@Param('id') id: string, @Body() updateData: Partial<CreateProductDto>) {
    return this.productsService.update(id, updateData);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a product' })
  @ApiResponse({ status: 200, description: 'Product deleted successfully.' })
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
