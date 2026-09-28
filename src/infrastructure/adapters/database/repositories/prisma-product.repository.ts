import { Injectable } from '@nestjs/common';
import { Product } from '../../../../domain/product/product.entity.js';
import { Result, failure, success } from '../../../../domain/shared/result.js';
import {
  ProductRepositoryError,
  ProductRepositoryOutputPort,
} from '../../../../application/product/ports/product-repository.output-port.js';
import { ProductMapper } from '../mappers/product.mapper.js';
import { PrismaService } from '../prisma.service.js';

@Injectable()
export class PrismaProductRepository implements ProductRepositoryOutputPort {
  constructor(private readonly prisma: PrismaService) {}

  async save(
    product: Product,
  ): Promise<Result<Product, ProductRepositoryError>> {
    try {
      const existing = await this.prisma.product.findUnique({
        where: { id: product.id },
      });

      if (existing === null) {
        const created = await this.prisma.product.create({
          data: ProductMapper.toPersistence(product),
        });
        return success(ProductMapper.toDomain(created));
      }

      // Optimistic locking: only apply the update if `version` still matches what was read.
      const updateResult = await this.prisma.product.updateMany({
        where: { id: product.id, version: product.version },
        data: {
          title: product.title,
          description: product.description,
          priceCents: product.priceCents,
          currency: product.currency,
          stock: product.stock,
          imageUrl: product.imageUrl,
          isActive: product.isActive,
          updatedAt: product.updatedAt,
          version: { increment: 1 },
        },
      });

      if (updateResult.count === 0) {
        return failure({
          kind: 'REPOSITORY_ERROR',
          message: `Optimistic lock conflict: product "${product.id}" was modified by another process`,
        });
      }

      const updated = await this.prisma.product.findUniqueOrThrow({
        where: { id: product.id },
      });
      return success(ProductMapper.toDomain(updated));
    } catch (error) {
      return failure({
        kind: 'REPOSITORY_ERROR',
        message:
          error instanceof Error
            ? error.message
            : 'Unknown database error while saving product',
      });
    }
  }

  async findById(
    id: string,
  ): Promise<Result<Product | null, ProductRepositoryError>> {
    try {
      const found = await this.prisma.product.findUnique({ where: { id } });
      return success(found === null ? null : ProductMapper.toDomain(found));
    } catch (error) {
      return failure({
        kind: 'REPOSITORY_ERROR',
        message:
          error instanceof Error
            ? error.message
            : 'Unknown database error while fetching product',
      });
    }
  }

  async findAll(): Promise<Result<Product[], ProductRepositoryError>> {
    try {
      const found = await this.prisma.product.findMany();
      return success(found.map((product) => ProductMapper.toDomain(product)));
    } catch (error) {
      return failure({
        kind: 'REPOSITORY_ERROR',
        message:
          error instanceof Error
            ? error.message
            : 'Unknown database error while fetching products',
      });
    }
  }
}
