import { Controller, Get, Post, Body, Delete, Param } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { AttributesService } from './attributes.service';
import { CreateAttributeDto } from './dto/create-attribute.dto';
import { CreateOptionDto } from './dto/create-option.dto';

@ApiTags('attributes')
@Controller('attributes')
export class AttributesController {
  constructor(private readonly attributesService: AttributesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new attribute' })
  @ApiResponse({ status: 201, description: 'Attribute created successfully.' })
  createAttribute(@Body() createAttributeDto: CreateAttributeDto) {
    return this.attributesService.createAttribute(createAttributeDto);
  }

  @Post('options')
  @ApiOperation({ summary: 'Create a new option for an ENUM attribute' })
  @ApiResponse({ status: 201, description: 'Option created successfully.' })
  createOption(@Body() createOptionDto: CreateOptionDto) {
    return this.attributesService.createOption(createOptionDto);
  }

  @Get('category/:categoryId')
  @ApiOperation({ summary: 'Get all attributes for a category' })
  @ApiResponse({ status: 200, description: 'Return attributes for the category.' })
  findByCategory(@Param('categoryId') categoryId: string) {
    return this.attributesService.findAttributesByCategory(categoryId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get attribute by ID' })
  @ApiResponse({ status: 200, description: 'Return the attribute.' })
  findOne(@Param('id') id: string) {
    return this.attributesService.findAttribute(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an attribute' })
  @ApiResponse({ status: 200, description: 'Attribute deleted successfully.' })
  remove(@Param('id') id: string) {
    return this.attributesService.deleteAttribute(id);
  }
}
