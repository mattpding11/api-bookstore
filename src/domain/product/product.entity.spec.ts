import { describe, expect, it } from 'vitest';
import { Product, type ProductCreationProps } from './product.entity.js';

function buildValidProps(
  overrides: Partial<ProductCreationProps> = {},
): ProductCreationProps {
  return {
    id: 'prod-1',
    title: 'Clean Code',
    priceCents: 10_000,
    stock: 5,
    ...overrides,
  };
}

describe('Product', () => {
  it('creates a product successfully with sensible defaults and exposes every getter', () => {
    const result = Product.create(buildValidProps());

    expect(result.isSuccess).toBe(true);
    if (!result.isSuccess) {
      return;
    }

    const product = result.getValue();
    expect(product.id).toBe('prod-1');
    expect(product.title).toBe('Clean Code');
    expect(product.description).toBeNull();
    expect(product.priceCents).toBe(10_000);
    expect(product.currency).toBe('COP');
    expect(product.stock).toBe(5);
    expect(product.imageUrl).toBeNull();
    expect(product.isActive).toBe(true);
    expect(product.version).toBe(1);
    expect(product.createdAt).toBeInstanceOf(Date);
    expect(product.updatedAt).toBeInstanceOf(Date);
  });

  it('honors explicit optional overrides instead of the defaults', () => {
    const createdAt = new Date('2024-01-01T00:00:00.000Z');
    const updatedAt = new Date('2024-02-01T00:00:00.000Z');

    const result = Product.create(
      buildValidProps({
        description: 'A Handbook of Agile Software Craftsmanship',
        currency: 'USD',
        imageUrl: 'https://example.com/clean-code.jpg',
        isActive: false,
        version: 3,
        createdAt,
        updatedAt,
      }),
    );

    expect(result.isSuccess).toBe(true);
    if (!result.isSuccess) {
      return;
    }

    const product = result.getValue();
    expect(product.description).toBe(
      'A Handbook of Agile Software Craftsmanship',
    );
    expect(product.currency).toBe('USD');
    expect(product.imageUrl).toBe('https://example.com/clean-code.jpg');
    expect(product.isActive).toBe(false);
    expect(product.version).toBe(3);
    expect(product.createdAt).toBe(createdAt);
    expect(product.updatedAt).toBe(updatedAt);
  });

  it('rejects an empty title', () => {
    const result = Product.create(buildValidProps({ title: '   ' }));

    expect(result.isFailure).toBe(true);
    if (result.isFailure) {
      expect(result.getError().kind).toBe('INVALID_TITLE');
    }
  });

  it('rejects a negative price', () => {
    const result = Product.create(buildValidProps({ priceCents: -1 }));

    expect(result.isFailure).toBe(true);
    if (result.isFailure) {
      expect(result.getError().kind).toBe('INVALID_PRICE');
    }
  });

  it('rejects a non-integer price', () => {
    const result = Product.create(buildValidProps({ priceCents: 10.5 }));

    expect(result.isFailure).toBe(true);
    if (result.isFailure) {
      expect(result.getError().kind).toBe('INVALID_PRICE');
    }
  });

  it('rejects a negative stock', () => {
    const result = Product.create(buildValidProps({ stock: -1 }));

    expect(result.isFailure).toBe(true);
    if (result.isFailure) {
      expect(result.getError().kind).toBe('INVALID_STOCK');
    }
  });

  // Regression test: Product only had a private `props` field, so JSON.stringify
  // used to serialize `{ "props": {...} }` instead of the flat shape below.
  it('serializes to a flat JSON object via toJSON()', () => {
    const result = Product.create(buildValidProps());

    expect(result.isSuccess).toBe(true);
    if (!result.isSuccess) {
      return;
    }

    const parsed = JSON.parse(JSON.stringify(result.getValue())) as Record<
      string,
      unknown
    >;
    expect(parsed).not.toHaveProperty('props');
    expect(parsed.id).toBe('prod-1');
    expect(parsed.title).toBe('Clean Code');
    expect(parsed.priceCents).toBe(10_000);
    expect(parsed.stock).toBe(5);
  });
});
