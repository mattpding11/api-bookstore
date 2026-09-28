import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { IdGeneratorOutputPort } from '../../../application/product/ports/id-generator.output-port.js';

@Injectable()
export class UuidIdGeneratorAdapter implements IdGeneratorOutputPort {
  generate(): string {
    return randomUUID();
  }
}
