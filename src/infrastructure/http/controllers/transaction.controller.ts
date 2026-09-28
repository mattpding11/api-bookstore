import {
  BadGatewayException,
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  ProcessTransactionError,
  ProcessTransactionUseCase,
} from '../../../application/transaction/use-cases/process-transaction.use-case.js';
import { Transaction } from '../../../domain/transaction/transaction.entity.js';
import { CreateTransactionDto } from '../dtos/create-transaction.dto.js';

// Fixed base fee required by the technical test spec; delivery fee comes from the frontend.
const BASE_FEE_CENTS = Number(process.env.BASE_FEE_CENTS) || 500;

@ApiTags('transactions')
@Controller('transactions')
export class TransactionController {
  constructor(
    private readonly processTransactionUseCase: ProcessTransactionUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Process a product purchase transaction' })
  @ApiResponse({
    status: 201,
    description: 'Created - the transaction was processed',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - invalid payload or unhandled business error',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - the product does not exist',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - the product is out of stock',
  })
  @ApiResponse({
    status: 502,
    description: 'Bad Gateway - the Wompi payment gateway failed',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error - a repository operation failed',
  })
  async create(@Body() dto: CreateTransactionDto): Promise<Transaction> {
    const result = await this.processTransactionUseCase.execute({
      productId: dto.productId,
      customer: {
        email: dto.customer.email,
        fullName: dto.customer.fullName,
        phoneNumber: dto.customer.phoneNumber,
        documentType: dto.customer.documentType,
        documentNumber: dto.customer.documentNumber,
      },
      delivery: {
        addressLine: dto.delivery.addressLine,
        city: dto.delivery.city,
        region: dto.delivery.region,
      },
      baseFeeCents: BASE_FEE_CENTS,
      deliveryFeeCents: dto.deliveryFeeCents,
      paymentMethodType: 'CARD',
      paymentMethodToken: dto.paymentToken,
    });

    if (result.isFailure) {
      throw this.mapErrorToHttpException(result.getError());
    }

    return result.getValue();
  }

  private mapErrorToHttpException(
    error: ProcessTransactionError,
  ): HttpException {
    switch (error.kind) {
      case 'PRODUCT_NOT_FOUND':
        return new NotFoundException(error.message);
      case 'OUT_OF_STOCK':
        return new ConflictException(error.message);
      case 'WOMPI_PAYMENT_ERROR':
        return new BadGatewayException(error.message);
      case 'REPOSITORY_ERROR':
        return new InternalServerErrorException(error.message);
      default:
        return new BadRequestException(error.message);
    }
  }
}
