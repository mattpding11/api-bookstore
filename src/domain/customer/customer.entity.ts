import { Result, success, failure } from '../shared/result.js';

export const DOCUMENT_TYPES = ['CC', 'CE', 'NIT', 'PASSPORT'] as const;
export type DocumentType = (typeof DOCUMENT_TYPES)[number];

export type CustomerCreationError =
  | { readonly kind: 'INVALID_EMAIL'; readonly message: string }
  | { readonly kind: 'INVALID_FULL_NAME'; readonly message: string }
  | { readonly kind: 'INVALID_PHONE_NUMBER'; readonly message: string }
  | { readonly kind: 'INVALID_DOCUMENT_TYPE'; readonly message: string }
  | { readonly kind: 'INVALID_DOCUMENT_NUMBER'; readonly message: string };

export type CustomerProps = {
  readonly id: string;
  readonly email: string;
  readonly fullName: string;
  readonly phoneNumber: string;
  readonly documentType: DocumentType;
  readonly documentNumber: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
};

export type CustomerCreationProps = {
  readonly id: string;
  readonly email: string;
  readonly fullName: string;
  readonly phoneNumber: string;
  readonly documentType: DocumentType;
  readonly documentNumber: string;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class Customer {
  private constructor(private readonly props: CustomerProps) {}

  static create(
    props: CustomerCreationProps,
  ): Result<Customer, CustomerCreationError> {
    if (!EMAIL_PATTERN.test(props.email)) {
      return failure({
        kind: 'INVALID_EMAIL',
        message: 'Customer email must be a valid email address',
      });
    }

    if (props.fullName.trim().length === 0) {
      return failure({
        kind: 'INVALID_FULL_NAME',
        message: 'Customer full name must not be empty',
      });
    }

    if (props.phoneNumber.trim().length === 0) {
      return failure({
        kind: 'INVALID_PHONE_NUMBER',
        message: 'Customer phone number must not be empty',
      });
    }

    if (!DOCUMENT_TYPES.includes(props.documentType)) {
      return failure({
        kind: 'INVALID_DOCUMENT_TYPE',
        message: `Customer document type must be one of: ${DOCUMENT_TYPES.join(', ')}`,
      });
    }

    if (props.documentNumber.trim().length === 0) {
      return failure({
        kind: 'INVALID_DOCUMENT_NUMBER',
        message: 'Customer document number must not be empty',
      });
    }

    const now = new Date();

    return success(
      new Customer({
        id: props.id,
        email: props.email,
        fullName: props.fullName,
        phoneNumber: props.phoneNumber,
        documentType: props.documentType,
        documentNumber: props.documentNumber,
        createdAt: props.createdAt ?? now,
        updatedAt: props.updatedAt ?? now,
      }),
    );
  }

  get id(): string {
    return this.props.id;
  }

  get email(): string {
    return this.props.email;
  }

  get fullName(): string {
    return this.props.fullName;
  }

  get phoneNumber(): string {
    return this.props.phoneNumber;
  }

  get documentType(): DocumentType {
    return this.props.documentType;
  }

  get documentNumber(): string {
    return this.props.documentNumber;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }
}
