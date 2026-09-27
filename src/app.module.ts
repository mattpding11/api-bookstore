import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './infrastructure/http/app.controller.js';
import { AppService } from './infrastructure/http/app.service.js';
import { AppConfigModule } from './infrastructure/config/app-config.module.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [AppConfigModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
