import { PrismaClient, AttrDataType, ProductStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create Categories
  const dressesCategory = await prisma.category.create({
    data: {
      name: 'Dresses',
      slug: 'dresses',
      description: 'Women\'s dresses and formal wear',
      isActive: true,
    },
  });

  const shoesCategory = await prisma.category.create({
    data: {
      name: 'Shoes',
      slug: 'shoes',
      description: 'Footwear for all occasions',
      isActive: true,
    },
  });

  // Create Attributes for Dresses
  const dressSize = await prisma.categoryAttribute.create({
    data: {
      categoryId: dressesCategory.id,
      name: 'Size',
      slug: 'size',
      dataType: AttrDataType.ENUM,
      isRequired: true,
      displayOrder: 1,
    },
  });

  const dressColor = await prisma.categoryAttribute.create({
    data: {
      categoryId: dressesCategory.id,
      name: 'Color',
      slug: 'color',
      dataType: AttrDataType.TEXT,
      isRequired: true,
      displayOrder: 2,
      maxLength: 50,
    },
  });

  const dressLength = await prisma.categoryAttribute.create({
    data: {
      categoryId: dressesCategory.id,
      name: 'Length (inches)',
      slug: 'length',
      dataType: AttrDataType.NUMBER,
      isRequired: false,
      displayOrder: 3,
      minNumber: 20,
      maxNumber: 60,
    },
  });

  // Create Options for Dress Size
  await prisma.attributeOption.createMany({
    data: [
      { categoryAttributeId: dressSize.id, value: 'XS', code: 'xs', sortOrder: 1 },
      { categoryAttributeId: dressSize.id, value: 'S', code: 's', sortOrder: 2 },
      { categoryAttributeId: dressSize.id, value: 'M', code: 'm', sortOrder: 3, isDefault: true },
      { categoryAttributeId: dressSize.id, value: 'L', code: 'l', sortOrder: 4 },
      { categoryAttributeId: dressSize.id, value: 'XL', code: 'xl', sortOrder: 5 },
    ],
  });

  // Create Attributes for Shoes
  const shoeSize = await prisma.categoryAttribute.create({
    data: {
      categoryId: shoesCategory.id,
      name: 'Size',
      slug: 'size',
      dataType: AttrDataType.ENUM,
      isRequired: true,
      displayOrder: 1,
    },
  });

  const shoeBrand = await prisma.categoryAttribute.create({
    data: {
      categoryId: shoesCategory.id,
      name: 'Brand',
      slug: 'brand',
      dataType: AttrDataType.TEXT,
      isRequired: true,
      displayOrder: 2,
      maxLength: 100,
    },
  });

  const isWaterproof = await prisma.categoryAttribute.create({
    data: {
      categoryId: shoesCategory.id,
      name: 'Waterproof',
      slug: 'waterproof',
      dataType: AttrDataType.BOOLEAN,
      isRequired: false,
      displayOrder: 3,
    },
  });

  // Create Options for Shoe Size
  await prisma.attributeOption.createMany({
    data: [
      { categoryAttributeId: shoeSize.id, value: '6', code: '6', sortOrder: 1 },
      { categoryAttributeId: shoeSize.id, value: '7', code: '7', sortOrder: 2 },
      { categoryAttributeId: shoeSize.id, value: '8', code: '8', sortOrder: 3 },
      { categoryAttributeId: shoeSize.id, value: '9', code: '9', sortOrder: 4, isDefault: true },
      { categoryAttributeId: shoeSize.id, value: '10', code: '10', sortOrder: 5 },
      { categoryAttributeId: shoeSize.id, value: '11', code: '11', sortOrder: 6 },
    ],
  });

  // Create Sample Products
  const blackDress = await prisma.product.create({
    data: {
      name: 'Elegant Black Dress',
      sku: 'DRESS-BLK-001',
      description: 'Classic black cocktail dress perfect for evening events',
      price: 129.99,
      stockQuantity: 15,
      status: ProductStatus.DRAFT,
      categoryId: dressesCategory.id,
    },
  });

  const runningShoes = await prisma.product.create({
    data: {
      name: 'Athletic Running Shoes',
      sku: 'SHOE-RUN-001',
      description: 'Comfortable running shoes with excellent support',
      price: 89.99,
      stockQuantity: 25,
      status: ProductStatus.DRAFT,
      categoryId: shoesCategory.id,
    },
  });

  // Get options for setting values
  const sizeMOption = await prisma.attributeOption.findFirst({
    where: { categoryAttributeId: dressSize.id, value: 'M' }
  });

  const size9Option = await prisma.attributeOption.findFirst({
    where: { categoryAttributeId: shoeSize.id, value: '9' }
  });

  // Set attribute values for products
  await prisma.productAttributeValue.createMany({
    data: [
      // Black Dress values
      {
        productId: blackDress.id,
        categoryAttributeId: dressSize.id,
        optionId: sizeMOption?.id,
      },
      {
        productId: blackDress.id,
        categoryAttributeId: dressColor.id,
        valueText: 'Black',
      },
      {
        productId: blackDress.id,
        categoryAttributeId: dressLength.id,
        valueNumber: 42,
      },
      // Running Shoes values
      {
        productId: runningShoes.id,
        categoryAttributeId: shoeSize.id,
        optionId: size9Option?.id,
      },
      {
        productId: runningShoes.id,
        categoryAttributeId: shoeBrand.id,
        valueText: 'Nike',
      },
      {
        productId: runningShoes.id,
        categoryAttributeId: isWaterproof.id,
        valueBool: false,
      },
    ],
  });

  console.log('✅ Database seeded successfully!');
  console.log('📦 Created categories: Dresses, Shoes');
  console.log('🏷️  Created attributes with options');
  console.log('🛍️  Created sample products with attribute values');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
