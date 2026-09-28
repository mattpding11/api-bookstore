import { Module } from '@nestjs/common';
import { ProcessTransactionUseCase } from '../../application/transaction/use-cases/process-transaction.use-case.js';
import {
  PRODUCT_REPOSITORY,
  ProductRepositoryOutputPort,
} from '../../application/product/ports/product-repository.output-port.js';
import {
  CUSTOMER_REPOSITORY,
  CustomerRepositoryOutputPort,
} from '../../application/customer/ports/customer-repository.port.output.js';
import {
  TRANSACTION_REPOSITORY,
  TransactionRepositoryOutputPort,
} from '../../application/transaction/ports/transaction-repository.output-port.js';
import {
  DELIVERY_REPOSITORY,
  DeliveryRepositoryOutputPort,
} from '../../application/delivery/ports/delivery-repository.output-port.js';
import {
  WOMPI_PAYMENT_GATEWAY,
  WompiPaymentOutputPort,
} from '../../application/transaction/ports/wompi-payment.output-port.js';
import {
  ID_GENERATOR,
  IdGeneratorOutputPort,
} from '../../application/product/ports/id-generator.output-port.js';
import { PrismaProductRepository } from '../adapters/database/repositories/prisma-product.repository.js';
import { PrismaCustomerRepository } from '../adapters/database/repositories/prisma-customer.repository.js';
import { PrismaTransactionRepository } from '../adapters/database/repositories/prisma-transaction.repository.js';
import { PrismaDeliveryRepository } from '../adapters/database/repositories/prisma-delivery.repository.js';
import { WompiHttpAdapter } from '../adapters/wompi/wompi-http.adapter.js';
import { UuidIdGeneratorAdapter } from '../adapters/shared/uuid-id-generator.adapter.js';
import { TransactionController } from '../http/controllers/transaction.controller.js';

@Module({
  controllers: [TransactionController],
  providers: [
    { provide: PRODUCT_REPOSITORY, useClass: PrismaProductRepository },
    { provide: CUSTOMER_REPOSITORY, useClass: PrismaCustomerRepository },
    { provide: TRANSACTION_REPOSITORY, useClass: PrismaTransactionRepository },
    { provide: DELIVERY_REPOSITORY, useClass: PrismaDeliveryRepository },
    { provide: WOMPI_PAYMENT_GATEWAY, useClass: WompiHttpAdapter },
    // Required by ProcessTransactionUseCase to mint Transaction/Customer ids; not one of the "four" ports but unavoidable.
    { provide: ID_GENERATOR, useClass: UuidIdGeneratorAdapter },
    {
      provide: ProcessTransactionUseCase,
      useFactory: (
        productRepository: ProductRepositoryOutputPort,
        customerRepository: CustomerRepositoryOutputPort,
        transactionRepository: TransactionRepositoryOutputPort,
        deliveryRepository: DeliveryRepositoryOutputPort,
        wompiGateway: WompiPaymentOutputPort,
        idGenerator: IdGeneratorOutputPort,
      ) =>
        new ProcessTransactionUseCase(
          productRepository,
          customerRepository,
          transactionRepository,
          deliveryRepository,
          wompiGateway,
          idGenerator,
        ),
      inject: [
        PRODUCT_REPOSITORY,
        CUSTOMER_REPOSITORY,
        TRANSACTION_REPOSITORY,
        DELIVERY_REPOSITORY,
        WOMPI_PAYMENT_GATEWAY,
        ID_GENERATOR,
      ],
    },
  ],
})
export class TransactionModule {}
