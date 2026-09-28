import { Delivery as PrismaDelivery, Prisma } from '@prisma/client';
import { Delivery } from '../../../../domain/delivery/delivery.entity.js';

export class DeliveryMapper {
  static toDomain(prismaDelivery: PrismaDelivery): Delivery {
    return Delivery.restore({
      id: prismaDelivery.id,
      transactionId: prismaDelivery.transactionId,
      addressLine: prismaDelivery.addressLine,
      city: prismaDelivery.city,
      region: prismaDelivery.region,
      status: prismaDelivery.status,
      createdAt: prismaDelivery.createdAt,
      updatedAt: prismaDelivery.updatedAt,
    });
  }

  static toPersistence(
    domainDelivery: Delivery,
  ): Prisma.DeliveryUncheckedCreateInput {
    return {
      id: domainDelivery.id,
      transactionId: domainDelivery.transactionId,
      addressLine: domainDelivery.addressLine,
      city: domainDelivery.city,
      region: domainDelivery.region,
      status: domainDelivery.status,
      createdAt: domainDelivery.createdAt,
      updatedAt: domainDelivery.updatedAt,
    };
  }
}
