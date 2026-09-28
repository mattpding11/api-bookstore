import { Global, Module } from '@nestjs/common';
import { PrismaService } from '../adapters/database/prisma.service.js';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class DatabaseModule {}
