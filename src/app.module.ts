import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './infrastructure/http/app.controller.js';
import { AppService } from './infrastructure/http/app.service.js';
import { AppConfigModule } from './infrastructure/config/app-config.module.js';
import { DatabaseModule } from './infrastructure/database/database.module.js';
import { ProductModule } from './infrastructure/modules/product.module.js';
import { TransactionModule } from './infrastructure/modules/transaction.module.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [AppConfigModule, DatabaseModule, ProductModule, TransactionModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
