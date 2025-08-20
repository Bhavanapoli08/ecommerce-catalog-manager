import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAttributeDto } from './dto/create-attribute.dto';
import { CreateOptionDto } from './dto/create-option.dto';
import { AttrDataType } from '@prisma/client';

@Injectable()
export class AttributesService {
  constructor(private prisma: PrismaService) {}

  async createAttribute(createAttributeDto: CreateAttributeDto) {
    // Validate category exists
    const category = await this.prisma.category.findUnique({
      where: { id: createAttributeDto.categoryId }
    });
    if (!category) {
      throw new BadRequestException('Category not found');
    }

    // Validate number constraints
    if (createAttributeDto.dataType === AttrDataType.NUMBER) {
      if (createAttributeDto.minNumber !== undefined && 
          createAttributeDto.maxNumber !== undefined &&
          createAttributeDto.minNumber > createAttributeDto.maxNumber) {
        throw new BadRequestException('minNumber cannot be greater than maxNumber');
      }
    }

    return this.prisma.categoryAttribute.create({
      data: createAttributeDto,
      include: {
        category: true,
        options: { orderBy: { sortOrder: 'asc' } },
        _count: { select: { values: true } }
      }
    });
  }

  async createOption(createOptionDto: CreateOptionDto) {
    // Validate attribute exists and is ENUM type
    const attribute = await this.prisma.categoryAttribute.findUnique({
      where: { id: createOptionDto.categoryAttributeId }
    });
    
    if (!attribute) {
      throw new BadRequestException('Attribute not found');
    }
    
    if (attribute.dataType !== AttrDataType.ENUM) {
      throw new BadRequestException('Options can only be added to ENUM attributes');
    }

    return this.prisma.attributeOption.create({
      data: createOptionDto,
      include: { attribute: true }
    });
  }

  async findAttributesByCategory(categoryId: string) {
    return this.prisma.categoryAttribute.findMany({
      where: { categoryId },
      include: {
        options: { orderBy: { sortOrder: 'asc' } },
        _count: { select: { values: true } }
      },
      orderBy: { displayOrder: 'asc' }
    });
  }

  async findAttribute(id: string) {
    const attribute = await this.prisma.categoryAttribute.findUnique({
      where: { id },
      include: {
        category: true,
        options: { orderBy: { sortOrder: 'asc' } },
        _count: { select: { values: true } }
      }
    });

    if (!attribute) {
      throw new NotFoundException('Attribute not found');
    }

    return attribute;
  }

  async validateAttributeValue(attributeId: string, value: any, optionId?: string) {
    const attribute = await this.findAttribute(attributeId);
    
    switch (attribute.dataType) {
      case AttrDataType.TEXT:
        if (typeof value !== 'string') {
          throw new BadRequestException('Value must be a string for TEXT attribute');
        }
        if (attribute.maxLength && value.length > attribute.maxLength) {
          throw new BadRequestException(`Value exceeds maximum length of ${attribute.maxLength}`);
        }
        if (attribute.regex && !new RegExp(attribute.regex).test(value)) {
          throw new BadRequestException('Value does not match required pattern');
        }
        break;
        
      case AttrDataType.NUMBER:
        const numValue = Number(value);
        if (isNaN(numValue)) {
          throw new BadRequestException('Value must be a number for NUMBER attribute');
        }
        if (attribute.minNumber !== null && numValue < Number(attribute.minNumber)) {
          throw new BadRequestException(`Value must be at least ${attribute.minNumber}`);
        }
        if (attribute.maxNumber !== null && numValue > Number(attribute.maxNumber)) {
          throw new BadRequestException(`Value must be at most ${attribute.maxNumber}`);
        }
        break;
        
      case AttrDataType.BOOLEAN:
        if (typeof value !== 'boolean') {
          throw new BadRequestException('Value must be a boolean for BOOLEAN attribute');
        }
        break;
        
      case AttrDataType.DATE:
        if (!(value instanceof Date) && !Date.parse(value)) {
          throw new BadRequestException('Value must be a valid date for DATE attribute');
        }
        break;
        
      case AttrDataType.ENUM:
        if (!optionId) {
          throw new BadRequestException('optionId is required for ENUM attribute');
        }
        const option = await this.prisma.attributeOption.findUnique({
          where: { id: optionId }
        });
        if (!option || option.categoryAttributeId !== attributeId) {
          throw new BadRequestException('Invalid option for this attribute');
        }
        break;
    }

    return true;
  }

  async deleteAttribute(id: string) {
    await this.findAttribute(id);

    // Check if attribute has values
    const valueCount = await this.prisma.productAttributeValue.count({
      where: { categoryAttributeId: id }
    });
    
    if (valueCount > 0) {
      throw new BadRequestException('Cannot delete attribute that has product values');
    }

    return this.prisma.categoryAttribute.delete({
      where: { id }
    });
  }
}
