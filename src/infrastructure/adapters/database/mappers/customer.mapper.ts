import { Customer as PrismaCustomer, Prisma } from '@prisma/client';
import { Customer } from '../../../../domain/customer/customer.entity.js';

export class CustomerMapper {
  static toDomain(prismaCustomer: PrismaCustomer): Customer {
    const result = Customer.create({
      id: prismaCustomer.id,
      email: prismaCustomer.email,
      fullName: prismaCustomer.fullName,
      phoneNumber: prismaCustomer.phoneNumber,
      documentType: prismaCustomer.documentType,
      documentNumber: prismaCustomer.documentNumber,
      createdAt: prismaCustomer.createdAt,
      updatedAt: prismaCustomer.updatedAt,
    });

    // A persisted row is expected to already satisfy domain invariants.
    if (result.isFailure) {
      throw new Error(
        `Corrupted customer record "${prismaCustomer.id}": ${result.error.message}`,
      );
    }

    return result.value;
  }

  static toPersistence(
    domainCustomer: Customer,
  ): Prisma.CustomerUncheckedCreateInput {
    return {
      id: domainCustomer.id,
      email: domainCustomer.email,
      fullName: domainCustomer.fullName,
      phoneNumber: domainCustomer.phoneNumber,
      documentType: domainCustomer.documentType,
      documentNumber: domainCustomer.documentNumber,
      createdAt: domainCustomer.createdAt,
      updatedAt: domainCustomer.updatedAt,
    };
  }
}
