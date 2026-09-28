import { Customer } from '../../../domain/customer/customer.entity.js';
import { Result } from '../../../domain/shared/result.js';

export type CustomerRepositoryError = {
  readonly kind: 'REPOSITORY_ERROR';
  readonly message: string;
};

export const CUSTOMER_REPOSITORY = Symbol('CUSTOMER_REPOSITORY');

export interface CustomerRepositoryOutputPort {
  save(customer: Customer): Promise<Result<Customer, CustomerRepositoryError>>;
  findByEmail(
    email: string,
  ): Promise<Result<Customer | null, CustomerRepositoryError>>;
  findByDocumentNumber(
    documentNumber: string,
  ): Promise<Result<Customer | null, CustomerRepositoryError>>;
}
