import { Type } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum DocumentTypeDto {
  CC = 'CC',
  CE = 'CE',
  NIT = 'NIT',
  PASSPORT = 'PASSPORT',
}

export class CustomerDto {
  @ApiProperty({ example: 'jane.doe@example.com' })
  @IsEmail({}, { message: 'email must be a valid email address' })
  readonly email!: string;

  @ApiProperty({ example: 'Jane Doe' })
  @IsString({ message: 'fullName must be a string' })
  @IsNotEmpty({ message: 'fullName must not be empty' })
  @MinLength(3, { message: 'fullName must be at least 3 characters long' })
  @MaxLength(120, { message: 'fullName must not exceed 120 characters' })
  readonly fullName!: string;

  @ApiProperty({ example: '+573001234567' })
  @IsString({ message: 'phoneNumber must be a string' })
  @Matches(/^\+?[0-9]{7,15}$/, {
    message:
      'phoneNumber must contain 7 to 15 digits, optionally prefixed with a "+"',
  })
  readonly phoneNumber!: string;

  @ApiProperty({ enum: DocumentTypeDto, example: DocumentTypeDto.CC })
  @IsEnum(DocumentTypeDto, {
    message: `documentType must be one of: ${Object.values(DocumentTypeDto).join(', ')}`,
  })
  readonly documentType!: DocumentTypeDto;

  @ApiProperty({ example: '1020304050' })
  @IsString({ message: 'documentNumber must be a string' })
  @Matches(/^[a-zA-Z0-9]{5,20}$/, {
    message: 'documentNumber must be alphanumeric and 5 to 20 characters long',
  })
  readonly documentNumber!: string;
}

export class DeliveryDto {
  @ApiProperty({ example: 'Cra. 59 # 27B-510' })
  @IsString({ message: 'addressLine must be a string' })
  @IsNotEmpty({ message: 'addressLine must not be empty' })
  readonly addressLine!: string;

  @ApiProperty({ example: 'Bello' })
  @IsString({ message: 'city must be a string' })
  @IsNotEmpty({ message: 'city must not be empty' })
  readonly city!: string;

  @ApiProperty({ example: 'Antioquia' })
  @IsString({ message: 'region must be a string' })
  @IsNotEmpty({ message: 'region must not be empty' })
  readonly region!: string;
}

export class CreateTransactionDto {
  @ApiProperty({ example: 'b3f1c9d2-4e3a-4c8b-9a1a-2f6d8e5c7a10' })
  @IsUUID('4', { message: 'productId must be a valid UUID' })
  readonly productId!: string;

  @ApiProperty({ type: CustomerDto })
  @ValidateNested({ message: 'customer must be a valid customer object' })
  @Type(() => CustomerDto)
  readonly customer!: CustomerDto;

  @ApiProperty({ example: 'tok_stagtest_dummy_1234567890abcdef' })
  @IsString({ message: 'paymentToken must be a string' })
  @IsNotEmpty({ message: 'paymentToken must not be empty' })
  readonly paymentToken!: string;

  @ApiProperty({ example: 5000 })
  @IsInt({ message: 'deliveryFeeCents must be an integer' })
  @Min(0, { message: 'deliveryFeeCents must not be negative' })
  readonly deliveryFeeCents!: number;

  @ApiProperty({ type: DeliveryDto })
  @ValidateNested({ message: 'delivery must be a valid delivery object' })
  @Type(() => DeliveryDto)
  readonly delivery!: DeliveryDto;
}
