import { describe, expect, it } from 'vitest';
import { getFieldErrors, loginSchema, registerSchema } from './auth.js';

const user = {
  name: ' Ana ',
  email: 'ana@example.com',
  password: 'password123',
  confirmPassword: 'password123',
};

describe('authentication forms', () => {
  it('accepts a valid registration and trims the name', () => {
    expect(registerSchema.parse(user).name).toBe('Ana');
  });

  it('rejects an invalid email address', () => {
    expect(registerSchema.safeParse({ ...user, email: 'ana' }).success).toBe(false);
  });

  it('rejects short passwords', () => {
    expect(
      registerSchema.safeParse({ ...user, password: 'short', confirmPassword: 'short' }).success,
    ).toBe(false);
  });

  it('reports mismatched passwords on the confirmation field', () => {
    const result = registerSchema.safeParse({ ...user, confirmPassword: 'different' });
    expect(result.success).toBe(false);
    if (!result.success)
      expect(getFieldErrors(result.error).confirmPassword).toBe('Gesli se ne ujemata.');
  });

  it('rejects login without a password', () => {
    expect(loginSchema.safeParse({ email: user.email, password: '' }).success).toBe(false);
  });

  it('accepts valid login fields', () => {
    expect(loginSchema.safeParse({ email: user.email, password: user.password }).success).toBe(
      true,
    );
  });

  it('keeps the first validation error for each field', () => {
    const result = registerSchema.safeParse({ ...user, password: '', confirmPassword: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(getFieldErrors(result.error)).toMatchObject({
        password: 'Geslo mora imeti vsaj 8 znakov.',
        confirmPassword: 'Ponovi geslo.',
      });
    }
  });
});
