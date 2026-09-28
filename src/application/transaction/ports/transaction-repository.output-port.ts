import {
  Transaction,
  TransactionStatus,
} from '../../../domain/transaction/transaction.entity.js';
import { Result } from '../../../domain/shared/result.js';

export type TransactionRepositoryError = {
  readonly kind: 'REPOSITORY_ERROR';
  readonly message: string;
};

export const TRANSACTION_REPOSITORY = Symbol('TRANSACTION_REPOSITORY');

export interface TransactionRepositoryOutputPort {
  save(
    transaction: Transaction,
  ): Promise<Result<Transaction, TransactionRepositoryError>>;
  updateStatus(
    id: string,
    status: TransactionStatus,
  ): Promise<Result<Transaction, TransactionRepositoryError>>;
}
