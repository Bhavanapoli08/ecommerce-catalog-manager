import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    // Validate parent exists if provided
    if (createCategoryDto.parentId) {
      const parent = await this.prisma.category.findUnique({
        where: { id: createCategoryDto.parentId }
      });
      if (!parent) {
        throw new BadRequestException('Parent category not found');
      }
    }

    return this.prisma.category.create({
      data: createCategoryDto,
      include: {
        parent: true,
        children: true,
        _count: {
          select: { attributes: true, products: true }
        }
      }
    });
  }

  async findAll() {
    return this.prisma.category.findMany({
      include: {
        parent: true,
        children: true,
        _count: {
          select: { attributes: true, products: true }
        }
      },
      orderBy: { name: 'asc' }
    });
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true,
        attributes: {
          include: {
            options: true,
            _count: { select: { values: true } }
          },
          orderBy: { displayOrder: 'asc' }
        },
        products: {
          take: 10,
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: { attributes: true, products: true }
        }
      }
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    // Check if category exists
    await this.findOne(id);

    // Validate parent if being updated
    if (updateCategoryDto.parentId) {
      const parent = await this.prisma.category.findUnique({
        where: { id: updateCategoryDto.parentId }
      });
      if (!parent) {
        throw new BadRequestException('Parent category not found');
      }
      
      // Prevent circular reference
      if (updateCategoryDto.parentId === id) {
        throw new BadRequestException('Category cannot be its own parent');
      }
    }

    return this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
      include: {
        parent: true,
        children: true,
        _count: {
          select: { attributes: true, products: true }
        }
      }
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    // Check if category has children
    const children = await this.prisma.category.count({
      where: { parentId: id }
    });
    
    if (children > 0) {
      throw new BadRequestException('Cannot delete category with child categories');
    }

    // Check if category has products
    const products = await this.prisma.product.count({
      where: { categoryId: id }
    });
    
    if (products > 0) {
      throw new BadRequestException('Cannot delete category with products');
    }

    return this.prisma.category.delete({
      where: { id }
    });
  }
}
