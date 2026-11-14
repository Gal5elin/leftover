import { describe, expect, it } from 'vitest';
import { currentIsoDate, getExpirationStatus } from './expiration.js';

describe('expiration warnings', () => {
  it('leaves food without an expiration date unmarked', () => {
    expect(getExpirationStatus(null, '2026-11-14')).toBeNull();
  });

  it('marks yesterday as expired', () => {
    expect(getExpirationStatus('2026-11-13', '2026-11-14')).toBe('EXPIRED');
  });

  it.each(['2026-11-14', '2026-11-17'])(
    'warns about the inclusive three-day window: %s',
    (date) => {
      expect(getExpirationStatus(date, '2026-11-14')).toBe('EXPIRING_SOON');
    },
  );

  it('does not warn about food that expires in four days', () => {
    expect(getExpirationStatus('2026-11-18', '2026-11-14')).toBe('FRESH');
  });

  it('handles the warning window across a year boundary', () => {
    expect(getExpirationStatus('2027-01-02', '2026-12-30')).toBe('EXPIRING_SOON');
  });

  it('calculates today in the household application timezone', () => {
    expect(currentIsoDate(new Date('2026-11-14T23:30:00Z'))).toBe('2026-11-15');
  });
});
