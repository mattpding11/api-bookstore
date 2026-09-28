import { Prisma, Product as PrismaProduct } from '@prisma/client';
import { Product } from '../../../../domain/product/product.entity.js';

export class ProductMapper {
  static toDomain(prismaProduct: PrismaProduct): Product {
    const result = Product.create({
      id: prismaProduct.id,
      title: prismaProduct.title,
      description: prismaProduct.description,
      priceCents: prismaProduct.priceCents,
      currency: prismaProduct.currency,
      stock: prismaProduct.stock,
      imageUrl: prismaProduct.imageUrl,
      isActive: prismaProduct.isActive,
      version: prismaProduct.version,
      createdAt: prismaProduct.createdAt,
      updatedAt: prismaProduct.updatedAt,
    });

    // A persisted row is expected to already satisfy domain invariants.
    if (result.isFailure) {
      throw new Error(
        `Corrupted product record "${prismaProduct.id}": ${result.error.message}`,
      );
    }

    return result.value;
  }

  static toPersistence(
    domainProduct: Product,
  ): Prisma.ProductUncheckedCreateInput {
    return {
      id: domainProduct.id,
      title: domainProduct.title,
      description: domainProduct.description,
      priceCents: domainProduct.priceCents,
      currency: domainProduct.currency,
      stock: domainProduct.stock,
      imageUrl: domainProduct.imageUrl,
      isActive: domainProduct.isActive,
      version: domainProduct.version,
      createdAt: domainProduct.createdAt,
      updatedAt: domainProduct.updatedAt,
    };
  }
}
