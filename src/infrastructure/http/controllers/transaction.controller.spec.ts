import { describe, expect, it, vi } from 'vitest';
import {
  BadGatewayException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { TransactionController } from './transaction.controller.js';
import type { ProcessTransactionUseCase } from '../../../application/transaction/use-cases/process-transaction.use-case.js';
import { Transaction } from '../../../domain/transaction/transaction.entity.js';
import { success, failure } from '../../../domain/shared/result.js';
import {
  CreateTransactionDto,
  DocumentTypeDto,
} from '../dtos/create-transaction.dto.js';

function buildTransaction(): Transaction {
  const result = Transaction.create({
    id: 'txn-1',
    reference: 'ORD-1',
    productId: 'prod-1',
    customerId: 'cust-1',
    productPriceCents: 10_000,
    baseFeeCents: 500,
    deliveryFeeCents: 1_000,
    paymentMethodType: 'CARD',
  });
  if (result.isFailure) {
    throw new Error('failed to build test transaction');
  }
  return result.getValue();
}

function buildDto(): CreateTransactionDto {
  const dto = new CreateTransactionDto();
  return Object.assign(dto, {
    productId: 'b3f1c9d2-4e3a-4c8b-9a1a-2f6d8e5c7a10',
    customer: {
      email: 'jane.doe@example.com',
      fullName: 'Jane Doe',
      phoneNumber: '+573001234567',
      documentType: DocumentTypeDto.CC,
      documentNumber: '1020304050',
    },
    paymentToken: 'tok_stagtest_dummy_1234567890abcdef',
    deliveryFeeCents: 5_000,
    delivery: {
      addressLine: 'Cra. 59 # 27B-510',
      city: 'Bello',
      region: 'Antioquia',
    },
  });
}

function buildControllerWithUseCaseResult(
  executeMock: ProcessTransactionUseCase['execute'],
): TransactionController {
  const useCase = {
    execute: executeMock,
  } as unknown as ProcessTransactionUseCase;
  return new TransactionController(useCase);
}

describe('TransactionController', () => {
  it('returns the processed transaction when the use case succeeds', async () => {
    const transaction = buildTransaction();
    const controller = buildControllerWithUseCaseResult(
      vi.fn().mockResolvedValue(success(transaction)),
    );

    const response = await controller.create(buildDto());

    expect(response).toBe(transaction);
  });

  it('throws NotFoundException when the product does not exist', async () => {
    const controller = buildControllerWithUseCaseResult(
      vi
        .fn()
        .mockResolvedValue(
          failure({ kind: 'PRODUCT_NOT_FOUND', message: 'Product not found' }),
        ),
    );

    await expect(controller.create(buildDto())).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('throws ConflictException when the product is out of stock', async () => {
    const controller = buildControllerWithUseCaseResult(
      vi
        .fn()
        .mockResolvedValue(
          failure({ kind: 'OUT_OF_STOCK', message: 'No stock available' }),
        ),
    );

    await expect(controller.create(buildDto())).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('throws BadGatewayException when the payment gateway rejects the charge', async () => {
    const controller = buildControllerWithUseCaseResult(
      vi
        .fn()
        .mockResolvedValue(
          failure({ kind: 'WOMPI_PAYMENT_ERROR', message: 'Card declined' }),
        ),
    );

    await expect(controller.create(buildDto())).rejects.toBeInstanceOf(
      BadGatewayException,
    );
  });
});
