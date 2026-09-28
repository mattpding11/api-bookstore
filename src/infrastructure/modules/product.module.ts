import { Module } from '@nestjs/common';
import { GetProductsUseCase } from '../../application/product/use-cases/get-products.use-case.js';
import {
  PRODUCT_REPOSITORY,
  ProductRepositoryOutputPort,
} from '../../application/product/ports/product-repository.output-port.js';
import { PrismaProductRepository } from '../adapters/database/repositories/prisma-product.repository.js';
import { ProductController } from '../http/controllers/product.controller.js';

@Module({
  controllers: [ProductController],
  providers: [
    {
      provide: PRODUCT_REPOSITORY,
      useClass: PrismaProductRepository,
    },
    {
      provide: GetProductsUseCase,
      useFactory: (productRepository: ProductRepositoryOutputPort) =>
        new GetProductsUseCase(productRepository),
      inject: [PRODUCT_REPOSITORY],
    },
  ],
})
export class ProductModule {}
