import { Customer } from '../../../domain/customer/customer.entity.js';
import type {
  CustomerCreationError,
  DocumentType,
} from '../../../domain/customer/customer.entity.js';
import { Product } from '../../../domain/product/product.entity.js';
import { Transaction } from '../../../domain/transaction/transaction.entity.js';
import type { TransactionCreationError } from '../../../domain/transaction/transaction.entity.js';
import { Result, failure, success } from '../../../domain/shared/result.js';
import {
  CustomerRepositoryError,
  CustomerRepositoryOutputPort,
} from '../../customer/ports/customer-repository.port.output.js';
import { IdGeneratorOutputPort } from '../../product/ports/id-generator.output-port.js';
import {
  ProductRepositoryError,
  ProductRepositoryOutputPort,
} from '../../product/ports/product-repository.output-port.js';
import {
  TransactionRepositoryError,
  TransactionRepositoryOutputPort,
} from '../ports/transaction-repository.output-port.js';
import {
  WompiPaymentError,
  WompiPaymentOutputPort,
} from '../ports/wompi-payment.output-port.js';

export type ProcessTransactionCustomerInput = {
  readonly email: string;
  readonly fullName: string;
  readonly phoneNumber: string;
  readonly documentType: DocumentType;
  readonly documentNumber: string;
};

export type ProcessTransactionInput = {
  readonly productId: string;
  readonly customer: ProcessTransactionCustomerInput;
  readonly baseFeeCents: number;
  readonly deliveryFeeCents: number;
  readonly paymentMethodType: string;
  readonly paymentMethodToken: string;
};

export type ProcessTransactionError =
  | ProductRepositoryError
  | CustomerRepositoryError
  | TransactionRepositoryError
  | WompiPaymentError
  | CustomerCreationError
  | TransactionCreationError
  | { readonly kind: 'PRODUCT_NOT_FOUND'; readonly message: string }
  | { readonly kind: 'OUT_OF_STOCK'; readonly message: string };

export class ProcessTransactionUseCase {
  constructor(
    private readonly productRepository: ProductRepositoryOutputPort,
    private readonly customerRepository: CustomerRepositoryOutputPort,
    private readonly transactionRepository: TransactionRepositoryOutputPort,
    private readonly wompiGateway: WompiPaymentOutputPort,
    private readonly idGenerator: IdGeneratorOutputPort,
  ) {}

  async execute(
    input: ProcessTransactionInput,
  ): Promise<Result<Transaction, ProcessTransactionError>> {
    const productResult = await this.productRepository.findById(
      input.productId,
    );
    if (productResult.isFailure) {
      return failure(productResult.error);
    }

    const product = productResult.value;
    if (product === null) {
      return failure({
        kind: 'PRODUCT_NOT_FOUND',
        message: `Product "${input.productId}" was not found`,
      });
    }

    if (product.stock < 1) {
      return failure({
        kind: 'OUT_OF_STOCK',
        message: `Product "${product.id}" has no stock available`,
      });
    }

    const customerResult = await this.resolveCustomer(input.customer);
    if (customerResult.isFailure) {
      return failure(customerResult.error);
    }

    const customer = customerResult.value;

    const newTransactionResult = Transaction.create({
      id: this.idGenerator.generate(),
      reference: `ORD-${this.idGenerator.generate()}`,
      productId: product.id,
      customerId: customer.id,
      productPriceCents: product.priceCents,
      baseFeeCents: input.baseFeeCents,
      deliveryFeeCents: input.deliveryFeeCents,
      paymentMethodType: input.paymentMethodType,
    });

    if (newTransactionResult.isFailure) {
      return failure(newTransactionResult.error);
    }

    const savedTransactionResult = await this.transactionRepository.save(
      newTransactionResult.value,
    );
    if (savedTransactionResult.isFailure) {
      return failure(savedTransactionResult.error);
    }

    const transaction = savedTransactionResult.value;

    const chargeResult = await this.wompiGateway.charge({
      reference: transaction.reference,
      amountInCents: transaction.totalAmountCents,
      currency: product.currency,
      customerEmail: customer.email,
      paymentMethodToken: input.paymentMethodToken,
    });

    if (chargeResult.isFailure) {
      await this.transactionRepository.updateStatus(transaction.id, 'ERROR');
      return failure(chargeResult.error);
    }

    const updatedTransactionResult =
      await this.transactionRepository.updateStatus(
        transaction.id,
        chargeResult.value.status,
      );

    if (updatedTransactionResult.isFailure) {
      return failure(updatedTransactionResult.error);
    }

    if (chargeResult.value.status === 'APPROVED') {
      await this.decreaseProductStock(product);
    }

    return success(updatedTransactionResult.value);
  }

  private async resolveCustomer(
    input: ProcessTransactionCustomerInput,
  ): Promise<Result<Customer, ProcessTransactionError>> {
    const existingResult = await this.customerRepository.findByEmail(
      input.email,
    );
    if (existingResult.isFailure) {
      return failure(existingResult.error);
    }

    if (existingResult.value !== null) {
      return success(existingResult.value);
    }

    const newCustomerResult = Customer.create({
      id: this.idGenerator.generate(),
      email: input.email,
      fullName: input.fullName,
      phoneNumber: input.phoneNumber,
      documentType: input.documentType,
      documentNumber: input.documentNumber,
    });

    if (newCustomerResult.isFailure) {
      return failure(newCustomerResult.error);
    }

    return this.customerRepository.save(newCustomerResult.value);
  }

  // Best-effort: a dedicated inventory use case should own retries/alerts if this fails.
  private async decreaseProductStock(product: Product): Promise<void> {
    const decreasedProductResult = Product.create({
      id: product.id,
      title: product.title,
      description: product.description,
      priceCents: product.priceCents,
      currency: product.currency,
      stock: product.stock - 1,
      imageUrl: product.imageUrl,
      isActive: product.isActive,
      version: product.version,
      createdAt: product.createdAt,
      updatedAt: new Date(),
    });

    if (decreasedProductResult.isSuccess) {
      await this.productRepository.save(decreasedProductResult.value);
    }
  }
}
