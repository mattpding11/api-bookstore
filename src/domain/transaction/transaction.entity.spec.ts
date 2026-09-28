import { describe, expect, it } from 'vitest';
import {
  Transaction,
  type TransactionCreationProps,
} from './transaction.entity.js';

function buildValidProps(
  overrides: Partial<TransactionCreationProps> = {},
): TransactionCreationProps {
  return {
    id: 'txn-1',
    reference: 'ORD-1',
    productId: 'prod-1',
    customerId: 'cust-1',
    productPriceCents: 10_000,
    baseFeeCents: 500,
    deliveryFeeCents: 1_000,
    paymentMethodType: 'CARD',
    ...overrides,
  };
}

describe('Transaction', () => {
  it('creates a transaction successfully with PENDING status and exposes every getter', () => {
    const result = Transaction.create(buildValidProps());

    expect(result.isSuccess).toBe(true);
    if (!result.isSuccess) {
      return;
    }

    const transaction = result.getValue();
    expect(transaction.id).toBe('txn-1');
    expect(transaction.reference).toBe('ORD-1');
    expect(transaction.wompiTransactionId).toBeNull();
    expect(transaction.productId).toBe('prod-1');
    expect(transaction.customerId).toBe('cust-1');
    expect(transaction.status).toBe('PENDING');
    expect(transaction.productPriceCents).toBe(10_000);
    expect(transaction.baseFeeCents).toBe(500);
    expect(transaction.deliveryFeeCents).toBe(1_000);
    expect(transaction.totalAmountCents).toBe(11_500);
    expect(transaction.paymentMethodType).toBe('CARD');
    expect(transaction.createdAt).toBeInstanceOf(Date);
    expect(transaction.updatedAt).toBeInstanceOf(Date);
  });

  it('defaults createdAt/updatedAt to now when not provided, and honors them when provided', () => {
    const createdAt = new Date('2024-01-01T00:00:00.000Z');
    const updatedAt = new Date('2024-02-01T00:00:00.000Z');

    const result = Transaction.create(
      buildValidProps({ createdAt, updatedAt }),
    );

    expect(result.isSuccess).toBe(true);
    if (result.isSuccess) {
      expect(result.getValue().createdAt).toBe(createdAt);
      expect(result.getValue().updatedAt).toBe(updatedAt);
    }
  });

  it('restores a transaction from persisted state, preserving its status and wompiTransactionId', () => {
    const createdAt = new Date('2024-01-01T00:00:00.000Z');
    const updatedAt = new Date('2024-01-02T00:00:00.000Z');

    const transaction = Transaction.restore({
      id: 'txn-2',
      reference: 'ORD-2',
      wompiTransactionId: 'wompi-99',
      productId: 'prod-2',
      customerId: 'cust-2',
      status: 'APPROVED',
      productPriceCents: 20_000,
      baseFeeCents: 700,
      deliveryFeeCents: 1_500,
      totalAmountCents: 22_200,
      paymentMethodType: 'CARD',
      createdAt,
      updatedAt,
    });

    expect(transaction.id).toBe('txn-2');
    expect(transaction.reference).toBe('ORD-2');
    expect(transaction.wompiTransactionId).toBe('wompi-99');
    expect(transaction.productId).toBe('prod-2');
    expect(transaction.customerId).toBe('cust-2');
    expect(transaction.status).toBe('APPROVED');
    expect(transaction.productPriceCents).toBe(20_000);
    expect(transaction.baseFeeCents).toBe(700);
    expect(transaction.deliveryFeeCents).toBe(1_500);
    expect(transaction.totalAmountCents).toBe(22_200);
    expect(transaction.paymentMethodType).toBe('CARD');
    expect(transaction.createdAt).toBe(createdAt);
    expect(transaction.updatedAt).toBe(updatedAt);
  });

  it('rejects an empty reference', () => {
    const result = Transaction.create(buildValidProps({ reference: '   ' }));

    expect(result.isFailure).toBe(true);
    if (result.isFailure) {
      expect(result.getError().kind).toBe('INVALID_REFERENCE');
    }
  });

  it('rejects a negative product price', () => {
    const result = Transaction.create(
      buildValidProps({ productPriceCents: -100 }),
    );

    expect(result.isFailure).toBe(true);
    if (result.isFailure) {
      expect(result.getError().kind).toBe('INVALID_PRODUCT_PRICE');
    }
  });

  it('rejects a negative base fee', () => {
    const result = Transaction.create(buildValidProps({ baseFeeCents: -1 }));

    expect(result.isFailure).toBe(true);
    if (result.isFailure) {
      expect(result.getError().kind).toBe('INVALID_BASE_FEE');
    }
  });

  it('rejects a negative delivery fee', () => {
    const result = Transaction.create(
      buildValidProps({ deliveryFeeCents: -1 }),
    );

    expect(result.isFailure).toBe(true);
    if (result.isFailure) {
      expect(result.getError().kind).toBe('INVALID_DELIVERY_FEE');
    }
  });

  it('rejects an empty payment method type', () => {
    const result = Transaction.create(
      buildValidProps({ paymentMethodType: '' }),
    );

    expect(result.isFailure).toBe(true);
    if (result.isFailure) {
      expect(result.getError().kind).toBe('INVALID_PAYMENT_METHOD');
    }
  });
});
