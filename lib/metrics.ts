import type { Snapshot } from "@/lib/types";

export function percentChange(current: number, previous?: number) {
  if (!previous) return 0;
  return ((current - previous) / previous) * 100;
}

export function simpleMovingAverage(snapshots: Snapshot[], window = 20) {
  const slice = snapshots.slice(-window);
  if (!slice.length) return 0;
  return slice.reduce((sum, point) => sum + point.price, 0) / slice.length;
}

export function volatility(snapshots: Snapshot[]) {
  if (snapshots.length < 2) return 0;
  const returns = snapshots.slice(1).map((point, index) => percentChange(point.price, snapshots[index].price));
  const average = returns.reduce((sum, value) => sum + value, 0) / returns.length;
  const variance = returns.reduce((sum, value) => sum + (value - average) ** 2, 0) / returns.length;
  return Math.sqrt(variance);
}

export function buildInsightMetrics(snapshots: Snapshot[], current: number, lastInsightPrice?: number) {
  const previousDay = snapshots.at(-5)?.price;
  const previousFiveDays = snapshots.at(-20)?.price;
  return {
    oneDayReturn: percentChange(current, previousDay),
    fiveDayReturn: percentChange(current, previousFiveDays),
    sinceLastInsight: percentChange(current, lastInsightPrice),
    sma: simpleMovingAverage(snapshots),
    volatility: volatility(snapshots),
    dayHigh: Math.max(...snapshots.map((point) => point.price), current),
    dayLow: Math.min(...snapshots.map((point) => point.price), current),
  };
}
