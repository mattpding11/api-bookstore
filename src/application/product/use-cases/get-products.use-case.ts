import { Product } from '../../../domain/product/product.entity.js';
import { Result, failure, success } from '../../../domain/shared/result.js';
import { ProductRepositoryOutputPort } from '../ports/product-repository.output-port.js';

export class GetProductsUseCase {
  constructor(
    private readonly productRepository: ProductRepositoryOutputPort,
  ) {}

  async execute(): Promise<Result<Product[], Error>> {
    const result = await this.productRepository.findAll();

    // Repository errors are already descriptive; surface them as a plain Error per this use case's contract.
    if (result.isFailure) {
      return failure(new Error(result.error.message));
    }

    return success(result.value);
  }
}
