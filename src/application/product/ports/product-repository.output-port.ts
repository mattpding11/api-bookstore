import { Product } from '../../../domain/product/product.entity.js';
import { Result } from '../../../domain/shared/result.js';

export type ProductRepositoryError = {
  readonly kind: 'REPOSITORY_ERROR';
  readonly message: string;
};

export const PRODUCT_REPOSITORY = Symbol('PRODUCT_REPOSITORY');

export interface ProductRepositoryOutputPort {
  save(product: Product): Promise<Result<Product, ProductRepositoryError>>;
  findById(id: string): Promise<Result<Product | null, ProductRepositoryError>>;
}
