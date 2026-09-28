import { Result, success, failure } from '../shared/result.js';

export type ProductCreationError =
  | { readonly kind: 'INVALID_TITLE'; readonly message: string }
  | { readonly kind: 'INVALID_PRICE'; readonly message: string }
  | { readonly kind: 'INVALID_STOCK'; readonly message: string };

export type ProductProps = {
  readonly id: string;
  readonly title: string;
  readonly description: string | null;
  readonly priceCents: number;
  readonly currency: string;
  readonly stock: number;
  readonly imageUrl: string | null;
  readonly isActive: boolean;
  readonly version: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
};

export type ProductCreationProps = {
  readonly id: string;
  readonly title: string;
  readonly description?: string | null;
  readonly priceCents: number;
  readonly currency?: string;
  readonly stock: number;
  readonly imageUrl?: string | null;
  readonly isActive?: boolean;
  readonly version?: number;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
};

const DEFAULT_CURRENCY = 'COP';
const DEFAULT_VERSION = 1;

export class Product {
  private constructor(private readonly props: ProductProps) {}

  static create(
    props: ProductCreationProps,
  ): Result<Product, ProductCreationError> {
    if (props.title.trim().length === 0) {
      return failure({
        kind: 'INVALID_TITLE',
        message: 'Product title must not be empty',
      });
    }

    if (!Number.isInteger(props.priceCents) || props.priceCents < 0) {
      return failure({
        kind: 'INVALID_PRICE',
        message: 'Product price in cents must be a non-negative integer',
      });
    }

    if (!Number.isInteger(props.stock) || props.stock < 0) {
      return failure({
        kind: 'INVALID_STOCK',
        message: 'Product stock must be a non-negative integer',
      });
    }

    const now = new Date();

    return success(
      new Product({
        id: props.id,
        title: props.title,
        description: props.description ?? null,
        priceCents: props.priceCents,
        currency: props.currency ?? DEFAULT_CURRENCY,
        stock: props.stock,
        imageUrl: props.imageUrl ?? null,
        isActive: props.isActive ?? true,
        version: props.version ?? DEFAULT_VERSION,
        createdAt: props.createdAt ?? now,
        updatedAt: props.updatedAt ?? now,
      }),
    );
  }

  get id(): string {
    return this.props.id;
  }

  get title(): string {
    return this.props.title;
  }

  get description(): string | null {
    return this.props.description;
  }

  get priceCents(): number {
    return this.props.priceCents;
  }

  get currency(): string {
    return this.props.currency;
  }

  get stock(): number {
    return this.props.stock;
  }

  get imageUrl(): string | null {
    return this.props.imageUrl;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get version(): number {
    return this.props.version;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }
}
