import { Injectable } from '@nestjs/common';
import { Transaction } from '../../../../domain/transaction/transaction.entity.js';
import type { TransactionStatus } from '../../../../domain/transaction/transaction.entity.js';
import { Result, failure, success } from '../../../../domain/shared/result.js';
import {
  TransactionRepositoryError,
  TransactionRepositoryOutputPort,
} from '../../../../application/transaction/ports/transaction-repository.output-port.js';
import { TransactionMapper } from '../mappers/transaction.mapper.js';
import { PrismaService } from '../prisma.service.js';

@Injectable()
export class PrismaTransactionRepository implements TransactionRepositoryOutputPort {
  constructor(private readonly prisma: PrismaService) {}

  async save(
    transaction: Transaction,
  ): Promise<Result<Transaction, TransactionRepositoryError>> {
    try {
      const saved = await this.prisma.transaction.upsert({
        where: { id: transaction.id },
        create: TransactionMapper.toPersistence(transaction),
        update: TransactionMapper.toPersistence(transaction),
      });
      return success(TransactionMapper.toDomain(saved));
    } catch (error) {
      return failure({
        kind: 'REPOSITORY_ERROR',
        message:
          error instanceof Error
            ? error.message
            : 'Unknown database error while saving transaction',
      });
    }
  }

  async updateStatus(
    id: string,
    status: TransactionStatus,
  ): Promise<Result<Transaction, TransactionRepositoryError>> {
    try {
      const updated = await this.prisma.transaction.update({
        where: { id },
        data: { status },
      });
      return success(TransactionMapper.toDomain(updated));
    } catch (error) {
      return failure({
        kind: 'REPOSITORY_ERROR',
        message:
          error instanceof Error
            ? error.message
            : 'Unknown database error while updating transaction status',
      });
    }
  }
}
