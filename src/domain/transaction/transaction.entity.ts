import { Result, success, failure } from '../shared/result.js';

export type TransactionStatus = 'PENDING' | 'APPROVED' | 'DECLINED' | 'ERROR';

export type TransactionCreationError =
  | { readonly kind: 'INVALID_REFERENCE'; readonly message: string }
  | { readonly kind: 'INVALID_PRODUCT_ID'; readonly message: string }
  | { readonly kind: 'INVALID_CUSTOMER_ID'; readonly message: string }
  | { readonly kind: 'INVALID_PRODUCT_PRICE'; readonly message: string }
  | { readonly kind: 'INVALID_BASE_FEE'; readonly message: string }
  | { readonly kind: 'INVALID_DELIVERY_FEE'; readonly message: string }
  | { readonly kind: 'INVALID_TOTAL_AMOUNT'; readonly message: string }
  | { readonly kind: 'INVALID_PAYMENT_METHOD'; readonly message: string };

export type TransactionProps = {
  readonly id: string;
  readonly reference: string;
  readonly wompiTransactionId: string | null;
  readonly productId: string;
  readonly customerId: string;
  readonly status: TransactionStatus;
  readonly productPriceCents: number;
  readonly baseFeeCents: number;
  readonly deliveryFeeCents: number;
  readonly totalAmountCents: number;
  readonly paymentMethodType: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
};

export type TransactionCreationProps = {
  readonly id: string;
  readonly reference: string;
  readonly productId: string;
  readonly customerId: string;
  readonly productPriceCents: number;
  readonly baseFeeCents: number;
  readonly deliveryFeeCents: number;
  readonly paymentMethodType: string;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
};

export class Transaction {
  private constructor(private readonly props: TransactionProps) {}

  // Rehydrates a transaction from already-validated persisted state, preserving its actual status.
  static restore(props: TransactionProps): Transaction {
    return new Transaction(props);
  }

  static create(
    props: TransactionCreationProps,
  ): Result<Transaction, TransactionCreationError> {
    if (props.reference.trim().length === 0) {
      return failure({
        kind: 'INVALID_REFERENCE',
        message: 'Transaction reference must not be empty',
      });
    }

    if (props.productId.trim().length === 0) {
      return failure({
        kind: 'INVALID_PRODUCT_ID',
        message: 'Transaction product id must not be empty',
      });
    }

    if (props.customerId.trim().length === 0) {
      return failure({
        kind: 'INVALID_CUSTOMER_ID',
        message: 'Transaction customer id must not be empty',
      });
    }

    if (
      !Number.isInteger(props.productPriceCents) ||
      props.productPriceCents < 0
    ) {
      return failure({
        kind: 'INVALID_PRODUCT_PRICE',
        message: 'Product price in cents must be a non-negative integer',
      });
    }

    if (!Number.isInteger(props.baseFeeCents) || props.baseFeeCents < 0) {
      return failure({
        kind: 'INVALID_BASE_FEE',
        message: 'Base fee in cents must be a non-negative integer',
      });
    }

    if (
      !Number.isInteger(props.deliveryFeeCents) ||
      props.deliveryFeeCents < 0
    ) {
      return failure({
        kind: 'INVALID_DELIVERY_FEE',
        message: 'Delivery fee in cents must be a non-negative integer',
      });
    }

    if (props.paymentMethodType.trim().length === 0) {
      return failure({
        kind: 'INVALID_PAYMENT_METHOD',
        message: 'Payment method type must not be empty',
      });
    }

    const totalAmountCents =
      props.productPriceCents + props.baseFeeCents + props.deliveryFeeCents;

    if (!Number.isSafeInteger(totalAmountCents)) {
      return failure({
        kind: 'INVALID_TOTAL_AMOUNT',
        message: 'Total amount in cents must be a safe integer',
      });
    }

    const now = new Date();

    return success(
      new Transaction({
        id: props.id,
        reference: props.reference,
        wompiTransactionId: null,
        productId: props.productId,
        customerId: props.customerId,
        status: 'PENDING',
        productPriceCents: props.productPriceCents,
        baseFeeCents: props.baseFeeCents,
        deliveryFeeCents: props.deliveryFeeCents,
        totalAmountCents,
        paymentMethodType: props.paymentMethodType,
        createdAt: props.createdAt ?? now,
        updatedAt: props.updatedAt ?? now,
      }),
    );
  }

  get id(): string {
    return this.props.id;
  }

  get reference(): string {
    return this.props.reference;
  }

  get wompiTransactionId(): string | null {
    return this.props.wompiTransactionId;
  }

  get productId(): string {
    return this.props.productId;
  }

  get customerId(): string {
    return this.props.customerId;
  }

  get status(): TransactionStatus {
    return this.props.status;
  }

  get productPriceCents(): number {
    return this.props.productPriceCents;
  }

  get baseFeeCents(): number {
    return this.props.baseFeeCents;
  }

  get deliveryFeeCents(): number {
    return this.props.deliveryFeeCents;
  }

  get totalAmountCents(): number {
    return this.props.totalAmountCents;
  }

  get paymentMethodType(): string {
    return this.props.paymentMethodType;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }
}
