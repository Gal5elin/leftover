import { describe, expect, it } from 'vitest';
import { createFoodItemSchema } from './food-item.js';

const food = {
  name: ' Mleko ',
  quantity: '1,5',
  unit: 'l',
  category: 'DAIRY',
  expirationDate: '2026-11-20',
};

describe('food input validation', () => {
  it('trims the name and accepts a decimal comma', () => {
    expect(createFoodItemSchema.parse(food)).toMatchObject({ name: 'Mleko', quantity: 1.5 });
  });

  it.each(['0', '-1'])('rejects a non-positive quantity: %s', (quantity) => {
    const result = createFoodItemSchema.safeParse({ ...food, quantity });
    expect(result.success).toBe(false);
    if (!result.success)
      expect(result.error.issues.map((issue) => issue.message)).toContain(
        'Količina mora biti večja od 0',
      );
  });

  it.each(['', 'abc', '1.1234', '10000000'])('rejects an invalid quantity: %s', (quantity) => {
    expect(createFoodItemSchema.safeParse({ ...food, quantity }).success).toBe(false);
  });

  it('rejects a whitespace-only name', () => {
    expect(createFoodItemSchema.safeParse({ ...food, name: '  ' }).success).toBe(false);
  });

  it('rejects unsupported measurement units', () => {
    expect(createFoodItemSchema.safeParse({ ...food, unit: 'bucket' }).success).toBe(false);
  });

  it('rejects unsupported categories', () => {
    expect(createFoodItemSchema.safeParse({ ...food, category: 'OTHER' }).success).toBe(false);
  });

  it('accepts food without an expiration date', () => {
    expect(createFoodItemSchema.safeParse({ ...food, expirationDate: null }).success).toBe(true);
  });
});
