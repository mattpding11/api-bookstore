import { describe, expect, it } from 'vitest';
import { Delivery, type DeliveryCreationProps } from './delivery.entity.js';

function buildValidProps(
  overrides: Partial<DeliveryCreationProps> = {},
): DeliveryCreationProps {
  return {
    id: 'delivery-1',
    transactionId: 'txn-1',
    addressLine: 'Cra. 59 # 27B-510',
    city: 'Bello',
    region: 'Antioquia',
    ...overrides,
  };
}

describe('Delivery', () => {
  it('creates a delivery successfully with PENDING status and exposes every getter', () => {
    const result = Delivery.create(buildValidProps());

    expect(result.isSuccess).toBe(true);
    if (!result.isSuccess) {
      return;
    }

    const delivery = result.getValue();
    expect(delivery.id).toBe('delivery-1');
    expect(delivery.transactionId).toBe('txn-1');
    expect(delivery.addressLine).toBe('Cra. 59 # 27B-510');
    expect(delivery.city).toBe('Bello');
    expect(delivery.region).toBe('Antioquia');
    expect(delivery.status).toBe('PENDING');
    expect(delivery.createdAt).toBeInstanceOf(Date);
    expect(delivery.updatedAt).toBeInstanceOf(Date);
  });

  it('defaults createdAt/updatedAt to now when not provided, and honors them when provided', () => {
    const createdAt = new Date('2024-01-01T00:00:00.000Z');
    const updatedAt = new Date('2024-02-01T00:00:00.000Z');

    const result = Delivery.create(buildValidProps({ createdAt, updatedAt }));

    expect(result.isSuccess).toBe(true);
    if (result.isSuccess) {
      expect(result.getValue().createdAt).toBe(createdAt);
      expect(result.getValue().updatedAt).toBe(updatedAt);
    }
  });

  it('rejects an empty transaction id', () => {
    const result = Delivery.create(buildValidProps({ transactionId: '   ' }));

    expect(result.isFailure).toBe(true);
    if (result.isFailure) {
      expect(result.getError().kind).toBe('INVALID_TRANSACTION_ID');
    }
  });

  it('rejects an empty address line', () => {
    const result = Delivery.create(buildValidProps({ addressLine: '   ' }));

    expect(result.isFailure).toBe(true);
    if (result.isFailure) {
      expect(result.getError().kind).toBe('INVALID_ADDRESS_LINE');
    }
  });

  it('rejects an empty city', () => {
    const result = Delivery.create(buildValidProps({ city: '   ' }));

    expect(result.isFailure).toBe(true);
    if (result.isFailure) {
      expect(result.getError().kind).toBe('INVALID_CITY');
    }
  });

  it('rejects an empty region', () => {
    const result = Delivery.create(buildValidProps({ region: '   ' }));

    expect(result.isFailure).toBe(true);
    if (result.isFailure) {
      expect(result.getError().kind).toBe('INVALID_REGION');
    }
  });

  it('restores a delivery from persisted state, preserving its actual status', () => {
    const createdAt = new Date('2024-01-01T00:00:00.000Z');
    const updatedAt = new Date('2024-01-02T00:00:00.000Z');

    const delivery = Delivery.restore({
      id: 'delivery-2',
      transactionId: 'txn-2',
      addressLine: 'Calle 10 # 20-30',
      city: 'Medellín',
      region: 'Antioquia',
      status: 'DISPATCHED',
      createdAt,
      updatedAt,
    });

    expect(delivery.id).toBe('delivery-2');
    expect(delivery.transactionId).toBe('txn-2');
    expect(delivery.addressLine).toBe('Calle 10 # 20-30');
    expect(delivery.city).toBe('Medellín');
    expect(delivery.region).toBe('Antioquia');
    expect(delivery.status).toBe('DISPATCHED');
    expect(delivery.createdAt).toBe(createdAt);
    expect(delivery.updatedAt).toBe(updatedAt);
  });
});
