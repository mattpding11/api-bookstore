import { Controller, Get, InternalServerErrorException } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetProductsUseCase } from '../../../application/product/use-cases/get-products.use-case.js';
import { Product } from '../../../domain/product/product.entity.js';

@ApiTags('products')
@Controller('products')
export class ProductController {
  constructor(private readonly getProductsUseCase: GetProductsUseCase) {}

  @Get()
  @ApiOperation({ summary: 'List all available products' })
  @ApiResponse({ status: 200, description: 'Products retrieved successfully' })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error - failed to read products',
  })
  async findAll(): Promise<Product[]> {
    const result = await this.getProductsUseCase.execute();

    if (result.isFailure) {
      throw new InternalServerErrorException(result.getError().message);
    }

    return result.getValue();
  }
}
