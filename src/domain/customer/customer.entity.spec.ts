import { describe, expect, it } from 'vitest';
import {
  Customer,
  type CustomerCreationProps,
  type DocumentType,
} from './customer.entity.js';

function buildValidProps(
  overrides: Partial<CustomerCreationProps> = {},
): CustomerCreationProps {
  return {
    id: 'cust-1',
    email: 'jane.doe@example.com',
    fullName: 'Jane Doe',
    phoneNumber: '+573001234567',
    documentType: 'CC',
    documentNumber: '1020304050',
    ...overrides,
  };
}

describe('Customer', () => {
  it('creates a customer successfully and exposes every getter', () => {
    const result = Customer.create(buildValidProps());

    expect(result.isSuccess).toBe(true);
    if (!result.isSuccess) {
      return;
    }

    const customer = result.getValue();
    expect(customer.id).toBe('cust-1');
    expect(customer.email).toBe('jane.doe@example.com');
    expect(customer.fullName).toBe('Jane Doe');
    expect(customer.phoneNumber).toBe('+573001234567');
    expect(customer.documentType).toBe('CC');
    expect(customer.documentNumber).toBe('1020304050');
    expect(customer.createdAt).toBeInstanceOf(Date);
    expect(customer.updatedAt).toBeInstanceOf(Date);
  });

  it('defaults createdAt/updatedAt to now when not provided, and honors them when provided', () => {
    const createdAt = new Date('2024-01-01T00:00:00.000Z');
    const updatedAt = new Date('2024-02-01T00:00:00.000Z');

    const result = Customer.create(buildValidProps({ createdAt, updatedAt }));

    expect(result.isSuccess).toBe(true);
    if (result.isSuccess) {
      expect(result.getValue().createdAt).toBe(createdAt);
      expect(result.getValue().updatedAt).toBe(updatedAt);
    }
  });

  it('rejects an invalid email', () => {
    const result = Customer.create(buildValidProps({ email: 'not-an-email' }));

    expect(result.isFailure).toBe(true);
    if (result.isFailure) {
      expect(result.getError().kind).toBe('INVALID_EMAIL');
    }
  });

  it('rejects an empty full name', () => {
    const result = Customer.create(buildValidProps({ fullName: '   ' }));

    expect(result.isFailure).toBe(true);
    if (result.isFailure) {
      expect(result.getError().kind).toBe('INVALID_FULL_NAME');
    }
  });

  it('rejects an empty phone number', () => {
    const result = Customer.create(buildValidProps({ phoneNumber: '   ' }));

    expect(result.isFailure).toBe(true);
    if (result.isFailure) {
      expect(result.getError().kind).toBe('INVALID_PHONE_NUMBER');
    }
  });

  it('rejects a document type outside the allowed list', () => {
    const result = Customer.create(
      buildValidProps({ documentType: 'INVALID' as unknown as DocumentType }),
    );

    expect(result.isFailure).toBe(true);
    if (result.isFailure) {
      expect(result.getError().kind).toBe('INVALID_DOCUMENT_TYPE');
    }
  });

  it('rejects an empty document number', () => {
    const result = Customer.create(buildValidProps({ documentNumber: '   ' }));

    expect(result.isFailure).toBe(true);
    if (result.isFailure) {
      expect(result.getError().kind).toBe('INVALID_DOCUMENT_NUMBER');
    }
  });
});
