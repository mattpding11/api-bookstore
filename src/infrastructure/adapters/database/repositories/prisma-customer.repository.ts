import { Injectable } from '@nestjs/common';
import { Customer } from '../../../../domain/customer/customer.entity.js';
import { Result, failure, success } from '../../../../domain/shared/result.js';
import {
  CustomerRepositoryError,
  CustomerRepositoryOutputPort,
} from '../../../../application/customer/ports/customer-repository.port.output.js';
import { CustomerMapper } from '../mappers/customer.mapper.js';
import { PrismaService } from '../prisma.service.js';

@Injectable()
export class PrismaCustomerRepository implements CustomerRepositoryOutputPort {
  constructor(private readonly prisma: PrismaService) {}

  async save(
    customer: Customer,
  ): Promise<Result<Customer, CustomerRepositoryError>> {
    try {
      const saved = await this.prisma.customer.upsert({
        where: { id: customer.id },
        create: CustomerMapper.toPersistence(customer),
        update: CustomerMapper.toPersistence(customer),
      });
      return success(CustomerMapper.toDomain(saved));
    } catch (error) {
      return failure({
        kind: 'REPOSITORY_ERROR',
        message:
          error instanceof Error
            ? error.message
            : 'Unknown database error while saving customer',
      });
    }
  }

  async findByEmail(
    email: string,
  ): Promise<Result<Customer | null, CustomerRepositoryError>> {
    try {
      const found = await this.prisma.customer.findUnique({ where: { email } });
      return success(found === null ? null : CustomerMapper.toDomain(found));
    } catch (error) {
      return failure({
        kind: 'REPOSITORY_ERROR',
        message:
          error instanceof Error
            ? error.message
            : 'Unknown database error while fetching customer by email',
      });
    }
  }

  async findByDocumentNumber(
    documentNumber: string,
  ): Promise<Result<Customer | null, CustomerRepositoryError>> {
    try {
      const found = await this.prisma.customer.findFirst({
        where: { documentNumber },
      });
      return success(found === null ? null : CustomerMapper.toDomain(found));
    } catch (error) {
      return failure({
        kind: 'REPOSITORY_ERROR',
        message:
          error instanceof Error
            ? error.message
            : 'Unknown database error while fetching customer by document',
      });
    }
  }
}
