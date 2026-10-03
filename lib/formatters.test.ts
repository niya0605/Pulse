import { describe, it, expect } from 'vitest';
import {
  formatPrice,
  formatCompactNumber,
  formatPercent,
  formatChange,
  formatTime,
} from './formatters';

describe('formatters', () => {
  describe('formatPrice', () => {
    it('formats positive numbers as USD', () => {
      expect(formatPrice(100)).toBe('$100.00');
      expect(formatPrice(1234.567)).toBe('$1,234.57');
    });

    it('formats zero', () => {
      expect(formatPrice(0)).toBe('$0.00');
    });

    it('formats negative numbers', () => {
      expect(formatPrice(-50)).toBe('-$50.00');
    });

    it('handles small decimals', () => {
      expect(formatPrice(0.01)).toBe('$0.01');
    });
  });

  describe('formatCompactNumber', () => {
    it('formats large numbers compactly', () => {
      expect(formatCompactNumber(1000000)).toBe('1M');
      expect(formatCompactNumber(1500000)).toBe('1.5M');
      expect(formatCompactNumber(1000000000)).toBe('1B');
    });

    it('formats thousands', () => {
      expect(formatCompactNumber(1500)).toBe('1.5K');
      expect(formatCompactNumber(5000)).toBe('5K');
    });

    it('formats small numbers', () => {
      expect(formatCompactNumber(100)).toBe('100');
      expect(formatCompactNumber(999)).toBe('999');
    });
  });

  describe('formatPercent', () => {
    it('formats positive percentages with plus sign', () => {
      expect(formatPercent(5.123)).toBe('+5.12%');
      expect(formatPercent(0.5)).toBe('+0.50%');
    });

    it('formats zero', () => {
      expect(formatPercent(0)).toBe('+0.00%');
    });

    it('formats negative percentages with minus sign', () => {
      expect(formatPercent(-5.678)).toBe('-5.68%');
      expect(formatPercent(-0.01)).toBe('-0.01%');
    });

    it('rounds to 2 decimal places', () => {
      expect(formatPercent(5.126)).toBe('+5.13%');
      expect(formatPercent(5.124)).toBe('+5.12%');
    });
  });

  describe('formatChange', () => {
    it('formats positive changes with plus sign', () => {
      expect(formatChange(2.5)).toBe('+2.50');
      expect(formatChange(0.01)).toBe('+0.01');
    });

    it('formats zero', () => {
      expect(formatChange(0)).toBe('+0.00');
    });

    it('formats negative changes with minus sign', () => {
      expect(formatChange(-2.5)).toBe('−2.50');
      expect(formatChange(-0.01)).toBe('−0.01');
    });

    it('uses minus dash character for negatives', () => {
      const result = formatChange(-1);
      expect(result).toContain('−');
    });
  });

  describe('formatTime', () => {
    it('formats ISO datetime to US time', () => {
      const result = formatTime('2024-01-15T14:30:00Z');
      expect(result).toMatch(/\d{1,2}:\d{2}\s(?:AM|PM)/);
    });

    it('handles different times', () => {
      const morning = formatTime('2024-01-15T09:00:00Z');
      const afternoon = formatTime('2024-01-15T17:00:00Z');
      expect(morning).toMatch(/\d{1,2}:\d{2}\s(?:AM|PM)/);
      expect(afternoon).toMatch(/\d{1,2}:\d{2}\s(?:AM|PM)/);
    });
  });
});
