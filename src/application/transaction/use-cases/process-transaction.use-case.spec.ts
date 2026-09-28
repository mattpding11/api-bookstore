import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProcessTransactionUseCase } from './process-transaction.use-case.js';
import { Product } from '../../../domain/product/product.entity.js';
import { Customer } from '../../../domain/customer/customer.entity.js';
import { Delivery } from '../../../domain/delivery/delivery.entity.js';
import {
  Transaction,
  type TransactionStatus,
} from '../../../domain/transaction/transaction.entity.js';
import { Result, success, failure } from '../../../domain/shared/result.js';
import type {
  ProductRepositoryError,
  ProductRepositoryOutputPort,
} from '../../product/ports/product-repository.output-port.js';
import type {
  CustomerRepositoryError,
  CustomerRepositoryOutputPort,
} from '../../customer/ports/customer-repository.port.output.js';
import type {
  DeliveryRepositoryError,
  DeliveryRepositoryOutputPort,
} from '../../delivery/ports/delivery-repository.output-port.js';
import type {
  TransactionRepositoryError,
  TransactionRepositoryOutputPort,
} from '../ports/transaction-repository.output-port.js';
import type {
  WompiChargeRequest,
  WompiChargeResponse,
  WompiPaymentError,
  WompiPaymentOutputPort,
} from '../ports/wompi-payment.output-port.js';
import type { IdGeneratorOutputPort } from '../../product/ports/id-generator.output-port.js';

function buildProduct(): Product {
  const result = Product.create({
    id: 'prod-1',
    title: 'Clean Code',
    priceCents: 10_000,
    stock: 5,
  });
  if (result.isFailure) {
    throw new Error('failed to build test product');
  }
  return result.getValue();
}

function buildCustomer(): Customer {
  const result = Customer.create({
    id: 'cust-1',
    email: 'jane@example.com',
    fullName: 'Jane Doe',
    phoneNumber: '+573001234567',
    documentType: 'CC',
    documentNumber: '1020304050',
  });
  if (result.isFailure) {
    throw new Error('failed to build test customer');
  }
  return result.getValue();
}

function buildTransaction(
  product: Product,
  status: TransactionStatus,
): Transaction {
  return Transaction.restore({
    id: 'txn-1',
    reference: 'ORD-txn-1',
    wompiTransactionId: null,
    productId: product.id,
    customerId: 'cust-1',
    status,
    productPriceCents: product.priceCents,
    baseFeeCents: 500,
    deliveryFeeCents: 1_000,
    totalAmountCents: product.priceCents + 500 + 1_000,
    paymentMethodType: 'CARD',
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

const input = {
  productId: 'prod-1',
  customer: {
    email: 'jane@example.com',
    fullName: 'Jane Doe',
    phoneNumber: '+573001234567',
    documentType: 'CC' as const,
    documentNumber: '1020304050',
  },
  delivery: {
    addressLine: 'Cra. 59 # 27B-510',
    city: 'Bello',
    region: 'Antioquia',
  },
  baseFeeCents: 500,
  deliveryFeeCents: 1_000,
  paymentMethodType: 'CARD',
  paymentMethodToken: 'tok_test_123',
};

describe('ProcessTransactionUseCase', () => {
  let product: Product;
  let customer: Customer;
  let productRepository: ProductRepositoryOutputPort;
  let customerRepository: CustomerRepositoryOutputPort;
  let transactionRepository: TransactionRepositoryOutputPort;
  let deliveryRepository: DeliveryRepositoryOutputPort;
  let wompiGateway: WompiPaymentOutputPort;
  let idGenerator: IdGeneratorOutputPort;
  let useCase: ProcessTransactionUseCase;

  beforeEach(() => {
    product = buildProduct();
    customer = buildCustomer();

    productRepository = {
      save: vi.fn(
        (p: Product): Promise<Result<Product, ProductRepositoryError>> =>
          Promise.resolve(success(p)),
      ),
      findById: vi.fn(
        (): Promise<Result<Product | null, ProductRepositoryError>> =>
          Promise.resolve(success(product)),
      ),
      findAll: vi.fn((): Promise<Result<Product[], ProductRepositoryError>> =>
        Promise.resolve(success([product])),
      ),
    };

    customerRepository = {
      save: vi.fn(
        (c: Customer): Promise<Result<Customer, CustomerRepositoryError>> =>
          Promise.resolve(success(c)),
      ),
      findByEmail: vi.fn(
        (): Promise<Result<Customer | null, CustomerRepositoryError>> =>
          Promise.resolve(success(customer)),
      ),
      findByDocumentNumber: vi.fn(
        (): Promise<Result<Customer | null, CustomerRepositoryError>> =>
          Promise.resolve(success(null)),
      ),
    };

    transactionRepository = {
      save: vi.fn(
        (
          transaction: Transaction,
        ): Promise<Result<Transaction, TransactionRepositoryError>> =>
          Promise.resolve(success(transaction)),
      ),
      updateStatus: vi.fn(
        (
          _id: string,
          status: TransactionStatus,
        ): Promise<Result<Transaction, TransactionRepositoryError>> =>
          Promise.resolve(success(buildTransaction(product, status))),
      ),
    };

    deliveryRepository = {
      save: vi.fn(
        (
          delivery: Delivery,
        ): Promise<Result<Delivery, DeliveryRepositoryError>> =>
          Promise.resolve(success(delivery)),
      ),
      updateStatus: vi.fn(
        (): Promise<Result<Delivery, DeliveryRepositoryError>> =>
          Promise.reject(new Error('not used in these tests')),
      ),
    };

    wompiGateway = {
      charge: vi.fn(
        (
          _request: WompiChargeRequest,
        ): Promise<Result<WompiChargeResponse, WompiPaymentError>> =>
          Promise.resolve(
            success({ wompiTransactionId: 'wompi-1', status: 'APPROVED' }),
          ),
      ),
    };

    let idCounter = 0;
    idGenerator = {
      generate: vi.fn((): string => `id-${++idCounter}`),
    };

    useCase = new ProcessTransactionUseCase(
      productRepository,
      customerRepository,
      transactionRepository,
      deliveryRepository,
      wompiGateway,
      idGenerator,
    );
  });

  it('processes the transaction successfully when the payment is approved', async () => {
    const result = await useCase.execute(input);

    expect(result.isSuccess).toBe(true);
    if (result.isSuccess) {
      expect(result.getValue().status).toBe('APPROVED');
    }
    expect(wompiGateway.charge).toHaveBeenCalledTimes(1);
    expect(transactionRepository.updateStatus).toHaveBeenCalledWith(
      expect.any(String),
      'APPROVED',
      'wompi-1',
    );
    // Stock is decremented as a best-effort side effect once the payment is approved.
    expect(productRepository.save).toHaveBeenCalledTimes(1);
  });

  it('creates and persists the delivery tied to the transaction before charging', async () => {
    await useCase.execute(input);

    expect(deliveryRepository.save).toHaveBeenCalledTimes(1);
    const savedTransaction = vi.mocked(transactionRepository.save).mock
      .calls[0]?.[0];
    const savedDelivery = vi.mocked(deliveryRepository.save).mock.calls[0]?.[0];
    expect(savedDelivery?.transactionId).toBe(savedTransaction?.id);
    expect(savedDelivery?.addressLine).toBe(input.delivery.addressLine);
    expect(savedDelivery?.city).toBe(input.delivery.city);
    expect(savedDelivery?.region).toBe(input.delivery.region);
  });

  it('returns a failure without charging when the delivery fails to save', async () => {
    vi.mocked(deliveryRepository.save).mockResolvedValueOnce(
      failure({ kind: 'REPOSITORY_ERROR', message: 'db unavailable' }),
    );

    const result = await useCase.execute(input);

    expect(result.isFailure).toBe(true);
    if (result.isFailure) {
      expect(result.getError().kind).toBe('REPOSITORY_ERROR');
    }
    expect(wompiGateway.charge).not.toHaveBeenCalled();
  });

  it('reserves stock when Wompi leaves the charge as PENDING (sandbox default)', async () => {
    vi.mocked(wompiGateway.charge).mockResolvedValueOnce(
      success({ wompiTransactionId: 'wompi-2', status: 'PENDING' }),
    );

    const result = await useCase.execute(input);

    expect(result.isSuccess).toBe(true);
    expect(productRepository.save).toHaveBeenCalledTimes(1);
  });

  it('does not touch stock when Wompi declines the charge', async () => {
    vi.mocked(wompiGateway.charge).mockResolvedValueOnce(
      success({ wompiTransactionId: 'wompi-3', status: 'DECLINED' }),
    );

    const result = await useCase.execute(input);

    expect(result.isSuccess).toBe(true);
    expect(productRepository.save).not.toHaveBeenCalled();
  });

  it('marks the transaction as ERROR and returns a failure when the payment gateway rejects the charge', async () => {
    vi.mocked(wompiGateway.charge).mockResolvedValueOnce(
      failure({ kind: 'WOMPI_PAYMENT_ERROR', message: 'Card declined' }),
    );

    const result = await useCase.execute(input);

    expect(result.isFailure).toBe(true);
    if (result.isFailure) {
      expect(result.getError().kind).toBe('WOMPI_PAYMENT_ERROR');
    }
    expect(transactionRepository.updateStatus).toHaveBeenCalledWith(
      expect.any(String),
      'ERROR',
    );
    expect(productRepository.save).not.toHaveBeenCalled();
  });

  it('returns a failure without charging when the product does not exist', async () => {
    vi.mocked(productRepository.findById).mockResolvedValueOnce(success(null));

    const result = await useCase.execute(input);

    expect(result.isFailure).toBe(true);
    if (result.isFailure) {
      expect(result.getError().kind).toBe('PRODUCT_NOT_FOUND');
    }
    expect(wompiGateway.charge).not.toHaveBeenCalled();
  });

  it('returns a failure without charging when the product has no stock', async () => {
    const outOfStockResult = Product.create({
      id: 'prod-1',
      title: 'Clean Code',
      priceCents: 10_000,
      stock: 0,
    });
    if (outOfStockResult.isFailure) {
      throw new Error('failed to build out-of-stock test product');
    }
    vi.mocked(productRepository.findById).mockResolvedValueOnce(
      success(outOfStockResult.getValue()),
    );

    const result = await useCase.execute(input);

    expect(result.isFailure).toBe(true);
    if (result.isFailure) {
      expect(result.getError().kind).toBe('OUT_OF_STOCK');
    }
    expect(wompiGateway.charge).not.toHaveBeenCalled();
  });
});
