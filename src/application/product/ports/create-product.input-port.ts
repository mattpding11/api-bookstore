import {
  Product,
  ProductCreationError,
} from '../../../domain/product/product.entity.js';
import { Result } from '../../../domain/shared/result.js';
import { ProductRepositoryError } from './product-repository.output-port.js';

export type CreateProductInput = {
  readonly title: string;
  readonly description?: string | null;
  readonly priceCents: number;
  readonly currency?: string;
  readonly stock: number;
  readonly imageUrl?: string | null;
};

export type CreateProductError = ProductCreationError | ProductRepositoryError;

export interface CreateProductInputPort {
  execute(
    input: CreateProductInput,
  ): Promise<Result<Product, CreateProductError>>;
}
