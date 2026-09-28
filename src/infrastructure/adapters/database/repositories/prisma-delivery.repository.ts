import { Injectable } from '@nestjs/common';
import { Delivery } from '../../../../domain/delivery/delivery.entity.js';
import type { DeliveryStatus } from '../../../../domain/delivery/delivery.entity.js';
import { Result, failure, success } from '../../../../domain/shared/result.js';
import {
  DeliveryRepositoryError,
  DeliveryRepositoryOutputPort,
} from '../../../../application/delivery/ports/delivery-repository.output-port.js';
import { DeliveryMapper } from '../mappers/delivery.mapper.js';
import { PrismaService } from '../prisma.service.js';

@Injectable()
export class PrismaDeliveryRepository implements DeliveryRepositoryOutputPort {
  constructor(private readonly prisma: PrismaService) {}

  async save(
    delivery: Delivery,
  ): Promise<Result<Delivery, DeliveryRepositoryError>> {
    try {
      const saved = await this.prisma.delivery.upsert({
        where: { id: delivery.id },
        create: DeliveryMapper.toPersistence(delivery),
        update: DeliveryMapper.toPersistence(delivery),
      });
      return success(DeliveryMapper.toDomain(saved));
    } catch (error) {
      return failure({
        kind: 'REPOSITORY_ERROR',
        message:
          error instanceof Error
            ? error.message
            : 'Unknown database error while saving delivery',
      });
    }
  }

  async updateStatus(
    id: string,
    status: DeliveryStatus,
  ): Promise<Result<Delivery, DeliveryRepositoryError>> {
    try {
      const updated = await this.prisma.delivery.update({
        where: { id },
        data: { status },
      });
      return success(DeliveryMapper.toDomain(updated));
    } catch (error) {
      return failure({
        kind: 'REPOSITORY_ERROR',
        message:
          error instanceof Error
            ? error.message
            : 'Unknown database error while updating delivery status',
      });
    }
  }
}
