import { Result, success, failure } from '../shared/result.js';

export type DeliveryStatus = 'PENDING' | 'DISPATCHED' | 'DELIVERED';

export type DeliveryCreationError =
  | { readonly kind: 'INVALID_TRANSACTION_ID'; readonly message: string }
  | { readonly kind: 'INVALID_ADDRESS_LINE'; readonly message: string }
  | { readonly kind: 'INVALID_CITY'; readonly message: string }
  | { readonly kind: 'INVALID_REGION'; readonly message: string };

export type DeliveryProps = {
  readonly id: string;
  readonly transactionId: string;
  readonly addressLine: string;
  readonly city: string;
  readonly region: string;
  readonly status: DeliveryStatus;
  readonly createdAt: Date;
  readonly updatedAt: Date;
};

export type DeliveryCreationProps = {
  readonly id: string;
  readonly transactionId: string;
  readonly addressLine: string;
  readonly city: string;
  readonly region: string;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
};

export class Delivery {
  private constructor(private readonly props: DeliveryProps) {}

  // Rehydrates a delivery from already-validated persisted state, preserving its actual status.
  static restore(props: DeliveryProps): Delivery {
    return new Delivery(props);
  }

  static create(
    props: DeliveryCreationProps,
  ): Result<Delivery, DeliveryCreationError> {
    if (props.transactionId.trim().length === 0) {
      return failure({
        kind: 'INVALID_TRANSACTION_ID',
        message: 'Delivery transaction id must not be empty',
      });
    }

    if (props.addressLine.trim().length === 0) {
      return failure({
        kind: 'INVALID_ADDRESS_LINE',
        message: 'Delivery address line must not be empty',
      });
    }

    if (props.city.trim().length === 0) {
      return failure({
        kind: 'INVALID_CITY',
        message: 'Delivery city must not be empty',
      });
    }

    if (props.region.trim().length === 0) {
      return failure({
        kind: 'INVALID_REGION',
        message: 'Delivery region must not be empty',
      });
    }

    const now = new Date();

    return success(
      new Delivery({
        id: props.id,
        transactionId: props.transactionId,
        addressLine: props.addressLine,
        city: props.city,
        region: props.region,
        status: 'PENDING',
        createdAt: props.createdAt ?? now,
        updatedAt: props.updatedAt ?? now,
      }),
    );
  }

  get id(): string {
    return this.props.id;
  }

  get transactionId(): string {
    return this.props.transactionId;
  }

  get addressLine(): string {
    return this.props.addressLine;
  }

  get city(): string {
    return this.props.city;
  }

  get region(): string {
    return this.props.region;
  }

  get status(): DeliveryStatus {
    return this.props.status;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }
}
