import { Prisma, Transaction as PrismaTransaction } from '@prisma/client';
import { Transaction } from '../../../../domain/transaction/transaction.entity.js';

export class TransactionMapper {
  static toDomain(prismaTransaction: PrismaTransaction): Transaction {
    return Transaction.restore({
      id: prismaTransaction.id,
      reference: prismaTransaction.reference,
      wompiTransactionId: prismaTransaction.wompiTransactionId,
      productId: prismaTransaction.productId,
      customerId: prismaTransaction.customerId,
      status: prismaTransaction.status,
      productPriceCents: prismaTransaction.productPriceCents,
      baseFeeCents: prismaTransaction.baseFeeCents,
      deliveryFeeCents: prismaTransaction.deliveryFeeCents,
      totalAmountCents: prismaTransaction.totalAmountCents,
      paymentMethodType: prismaTransaction.paymentMethodType,
      createdAt: prismaTransaction.createdAt,
      updatedAt: prismaTransaction.updatedAt,
    });
  }

  static toPersistence(
    domainTransaction: Transaction,
  ): Prisma.TransactionUncheckedCreateInput {
    return {
      id: domainTransaction.id,
      reference: domainTransaction.reference,
      wompiTransactionId: domainTransaction.wompiTransactionId,
      productId: domainTransaction.productId,
      customerId: domainTransaction.customerId,
      status: domainTransaction.status,
      productPriceCents: domainTransaction.productPriceCents,
      baseFeeCents: domainTransaction.baseFeeCents,
      deliveryFeeCents: domainTransaction.deliveryFeeCents,
      totalAmountCents: domainTransaction.totalAmountCents,
      paymentMethodType: domainTransaction.paymentMethodType,
      createdAt: domainTransaction.createdAt,
      updatedAt: domainTransaction.updatedAt,
    };
  }
}
