import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AttributesService } from '../attributes/attributes.service';
import { CreateProductDto } from './dto/create-product.dto';
import { SetAttributeValueDto } from './dto/set-attribute-value.dto';
import { ProductStatus, AttrDataType } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private attributesService: AttributesService
  ) {}

  async create(createProductDto: CreateProductDto) {
    // Validate category exists
    const category = await this.prisma.category.findUnique({
      where: { id: createProductDto.categoryId }
    });
    if (!category) {
      throw new BadRequestException('Category not found');
    }

    return this.prisma.product.create({
      data: createProductDto,
      include: {
        category: true,
        values: {
          include: {
            attribute: { include: { options: true } },
            option: true
          }
        }
      }
    });
  }

  async findAll(page = 1, limit = 20, categoryId?: string, status?: ProductStatus) {
    const skip = (page - 1) * limit;
    const where: any = {};
    
    if (categoryId) where.categoryId = categoryId;
    if (status) where.status = status;

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: {
          category: true,
          _count: { select: { values: true } }
        },
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.product.count({ where })
    ]);

    return {
      data: products,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: {
          include: {
            attributes: {
              include: { options: true },
              orderBy: { displayOrder: 'asc' }
            }
          }
        },
        values: {
          include: {
            attribute: { include: { options: true } },
            option: true
          }
        }
      }
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async setAttributeValue(setValueDto: SetAttributeValueDto) {
    const { productId, categoryAttributeId, optionId, ...values } = setValueDto;
    
    // Validate product exists and get its category
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: { category: true }
    });
    if (!product) {
      throw new BadRequestException('Product not found');
    }

    // Validate attribute exists and belongs to product's category
    const attribute = await this.prisma.categoryAttribute.findUnique({
      where: { id: categoryAttributeId }
    });
    if (!attribute || attribute.categoryId !== product.categoryId) {
      throw new BadRequestException('Attribute not found or does not belong to product category');
    }

    // Determine the value based on data type
    let value: any;
    switch (attribute.dataType) {
      case AttrDataType.TEXT:
        value = values.valueText;
        break;
      case AttrDataType.NUMBER:
        value = values.valueNumber;
        break;
      case AttrDataType.BOOLEAN:
        value = values.valueBool;
        break;
      case AttrDataType.DATE:
        value = values.valueDate;
        break;
      case AttrDataType.ENUM:
        value = null; // ENUM uses optionId
        break;
    }

    // Validate the value
    await this.attributesService.validateAttributeValue(categoryAttributeId, value, optionId);

    // Prepare data for upsert
    const data: any = {
      valueText: attribute.dataType === AttrDataType.TEXT ? values.valueText : null,
      valueNumber: attribute.dataType === AttrDataType.NUMBER ? values.valueNumber : null,
      valueBool: attribute.dataType === AttrDataType.BOOLEAN ? values.valueBool : null,
      valueDate: attribute.dataType === AttrDataType.DATE ? new Date(values.valueDate!) : null,
      optionId: attribute.dataType === AttrDataType.ENUM ? optionId : null,
    };

    // Upsert the value
    return this.prisma.productAttributeValue.upsert({
      where: {
        productId_categoryAttributeId: {
          productId,
          categoryAttributeId
        }
      },
      update: data,
      create: {
        productId,
        categoryAttributeId,
        ...data
      },
      include: {
        attribute: { include: { options: true } },
        option: true
      }
    });
  }

  async activate(id: string) {
    const product = await this.findOne(id);
    
    // Check required attributes
    const requiredAttributes = await this.prisma.categoryAttribute.findMany({
      where: {
        categoryId: product.categoryId,
        isRequired: true
      }
    });

    const existingValues = await this.prisma.productAttributeValue.findMany({
      where: { productId: id }
    });

    const missingRequired = requiredAttributes.filter(attr => 
      !existingValues.some(value => value.categoryAttributeId === attr.id)
    );

    if (missingRequired.length > 0) {
      throw new BadRequestException(
        `Missing required attributes: ${missingRequired.map(a => a.name).join(', ')}`
      );
    }

    return this.prisma.product.update({
      where: { id },
      data: { status: ProductStatus.ACTIVE },
      include: {
        category: true,
        values: {
          include: {
            attribute: { include: { options: true } },
            option: true
          }
        }
      }
    });
  }

  async update(id: string, updateData: Partial<CreateProductDto>) {
    await this.findOne(id);
    
    return this.prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        values: {
          include: {
            attribute: { include: { options: true } },
            option: true
          }
        }
      }
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    
    return this.prisma.product.delete({
      where: { id }
    });
  }
}
