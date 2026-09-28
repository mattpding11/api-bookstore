import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  IsUrl,
  Max,
  Min,
} from 'class-validator';

export enum Environment {
  Development = 'DEV',
  Production = 'PRODUCTION',
  Test = 'TEST',
}

export class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment = Environment.Development;

  @IsInt()
  @Min(0)
  @Max(65535)
  PORT: number = 3000;

  @IsString()
  @IsUrl({ require_tld: false })
  FRONTEND_URL!: string;

  @IsString()
  @IsNotEmpty()
  DATABASE_URL!: string;

  @IsString()
  @IsNotEmpty()
  WOMPI_API_URL!: string;

  @IsString()
  @IsNotEmpty()
  WOMPI_PUBLIC_KEY!: string;

  @IsString()
  @IsNotEmpty()
  WOMPI_PRIVATE_KEY!: string;

  @IsString()
  @IsNotEmpty()
  WOMPI_INTEGRITY_KEY!: string;
}
