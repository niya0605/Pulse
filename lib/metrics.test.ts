import { describe, it, expect } from 'vitest';
import {
  percentChange,
  simpleMovingAverage,
  volatility,
  buildInsightMetrics,
} from './metrics';
import type { Snapshot } from './types';

describe('metrics', () => {
  describe('percentChange', () => {
    it('calculates positive percentage change', () => {
      expect(percentChange(100, 50)).toBe(100);
      expect(percentChange(110, 100)).toBe(10);
    });

    it('calculates negative percentage change', () => {
      expect(percentChange(50, 100)).toBe(-50);
      expect(percentChange(90, 100)).toBe(-10);
    });

    it('returns 0 when no previous value', () => {
      expect(percentChange(100)).toBe(0);
      expect(percentChange(100, undefined)).toBe(0);
    });

    it('handles same values', () => {
      expect(percentChange(100, 100)).toBe(0);
    });
  });

  describe('simpleMovingAverage', () => {
    const snapshots: Snapshot[] = [
      { ts: '2024-01-01T00:00:00Z', price: 100 },
      { ts: '2024-01-02T00:00:00Z', price: 102 },
      { ts: '2024-01-03T00:00:00Z', price: 101 },
      { ts: '2024-01-04T00:00:00Z', price: 103 },
      { ts: '2024-01-05T00:00:00Z', price: 104 },
    ];

    it('calculates default 20-period SMA', () => {
      const result = simpleMovingAverage(snapshots);
      expect(result).toBe((100 + 102 + 101 + 103 + 104) / 5);
    });

    it('calculates custom window SMA', () => {
      const result = simpleMovingAverage(snapshots, 3);
      expect(result).toBe((101 + 103 + 104) / 3);
    });

    it('returns 0 for empty snapshots', () => {
      expect(simpleMovingAverage([])).toBe(0);
    });

    it('handles window larger than data', () => {
      const result = simpleMovingAverage(snapshots, 100);
      expect(result).toBe((100 + 102 + 101 + 103 + 104) / 5);
    });
  });

  describe('volatility', () => {
    const stableSnapshots: Snapshot[] = [
      { ts: '2024-01-01T00:00:00Z', price: 100 },
      { ts: '2024-01-02T00:00:00Z', price: 100 },
      { ts: '2024-01-03T00:00:00Z', price: 100 },
    ];

    const volatileSnapshots: Snapshot[] = [
      { ts: '2024-01-01T00:00:00Z', price: 100 },
      { ts: '2024-01-02T00:00:00Z', price: 110 },
      { ts: '2024-01-03T00:00:00Z', price: 90 },
      { ts: '2024-01-04T00:00:00Z', price: 120 },
      { ts: '2024-01-05T00:00:00Z', price: 95 },
    ];

    it('returns 0 for single snapshot', () => {
      expect(volatility([stableSnapshots[0]])).toBe(0);
    });

    it('returns low volatility for stable prices', () => {
      const result = volatility(stableSnapshots);
      expect(result).toBe(0);
    });

    it('returns higher volatility for volatile prices', () => {
      const result = volatility(volatileSnapshots);
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThan(100);
    });
  });

  describe('buildInsightMetrics', () => {
    const snapshots: Snapshot[] = Array.from({ length: 20 }, (_, i) => ({
      ts: `2024-01-${String(i + 1).padStart(2, '0')}T00:00:00Z`,
      price: 100 + i,
    }));

    it('builds metrics correctly', () => {
      const metrics = buildInsightMetrics(snapshots, 120, 100);

      expect(metrics).toHaveProperty('oneDayReturn');
      expect(metrics).toHaveProperty('fiveDayReturn');
      expect(metrics).toHaveProperty('sinceLastInsight');
      expect(metrics).toHaveProperty('sma');
      expect(metrics).toHaveProperty('volatility');
      expect(metrics).toHaveProperty('dayHigh');
      expect(metrics).toHaveProperty('dayLow');
    });

    it('calculates day high and low', () => {
      const metrics = buildInsightMetrics(snapshots, 120);
      expect(metrics.dayHigh).toBe(120);
      expect(metrics.dayLow).toBe(100);
    });

    it('handles optional lastInsightPrice', () => {
      const metricsWithoutLast = buildInsightMetrics(snapshots, 120);
      const metricsWithLast = buildInsightMetrics(snapshots, 120, 100);

      expect(metricsWithoutLast.sinceLastInsight).toBe(0);
      expect(metricsWithLast.sinceLastInsight).toBeGreaterThan(0);
    });

    it('calculates SMA', () => {
      const metrics = buildInsightMetrics(snapshots, 120);
      expect(metrics.sma).toBeGreaterThan(0);
      expect(metrics.sma).toBeLessThan(200);
    });
  });
});
