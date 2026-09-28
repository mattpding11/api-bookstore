import { Product } from '../../../domain/product/product.entity.js';
import { Result, failure, success } from '../../../domain/shared/result.js';
import {
  CreateProductError,
  CreateProductInput,
  CreateProductInputPort,
} from '../ports/create-product.input-port.js';
import { IdGeneratorOutputPort } from '../ports/id-generator.output-port.js';
import { ProductRepositoryOutputPort } from '../ports/product-repository.output-port.js';

export class CreateProductUseCase implements CreateProductInputPort {
  constructor(
    private readonly productRepository: ProductRepositoryOutputPort,
    private readonly idGenerator: IdGeneratorOutputPort,
  ) {}

  async execute(
    input: CreateProductInput,
  ): Promise<Result<Product, CreateProductError>> {
    const productResult = Product.create({
      id: this.idGenerator.generate(),
      title: input.title,
      description: input.description,
      priceCents: input.priceCents,
      currency: input.currency,
      stock: input.stock,
      imageUrl: input.imageUrl,
    });

    if (productResult.isFailure) {
      return failure(productResult.error);
    }

    const saveResult = await this.productRepository.save(productResult.value);

    if (saveResult.isFailure) {
      return failure(saveResult.error);
    }

    return success(saveResult.value);
  }
}
