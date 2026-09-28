import {
  Delivery,
  DeliveryStatus,
} from '../../../domain/delivery/delivery.entity.js';
import { Result } from '../../../domain/shared/result.js';

export type DeliveryRepositoryError = {
  readonly kind: 'REPOSITORY_ERROR';
  readonly message: string;
};

export const DELIVERY_REPOSITORY = Symbol('DELIVERY_REPOSITORY');

export interface DeliveryRepositoryOutputPort {
  save(delivery: Delivery): Promise<Result<Delivery, DeliveryRepositoryError>>;
  updateStatus(
    id: string,
    status: DeliveryStatus,
  ): Promise<Result<Delivery, DeliveryRepositoryError>>;
}
