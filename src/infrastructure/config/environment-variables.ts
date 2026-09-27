import { IsEnum, IsInt, Max, Min } from 'class-validator';

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
}
