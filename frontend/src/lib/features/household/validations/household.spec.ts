import { describe, expect, it } from 'vitest';
import { createHouseholdSchema } from './household.js';

describe('household input validation', () => {
  it('trims the household name', () => {
    expect(createHouseholdSchema.parse({ name: ' Doma ' })).toEqual({ name: 'Doma' });
  });

  it('rejects a blank name', () => {
    expect(createHouseholdSchema.safeParse({ name: '   ' }).success).toBe(false);
  });

  it('accepts a 50-character name', () => {
    expect(createHouseholdSchema.safeParse({ name: 'a'.repeat(50) }).success).toBe(true);
  });

  it('rejects names longer than 50 characters', () => {
    expect(createHouseholdSchema.safeParse({ name: 'a'.repeat(51) }).success).toBe(false);
  });
});
