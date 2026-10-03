import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { MarketStrip } from './market-strip';
import type { DashboardPayload } from '@/lib/types';

describe('MarketStrip', () => {
  const mockMarket: DashboardPayload['market'] = {
    isOpen: true,
    label: 'Regular trading',
    session: 'NYSE',
    nextEvent: 'closes 16:00 ET',
  };

  it('renders all market cells', () => {
    const { container } = render(
      <MarketStrip market={mockMarket} provider="finnhub" count={5} />
    );
    const cells = container.querySelectorAll('.market-cell');
    expect(cells).toHaveLength(4);
  });

  it('displays session status', () => {
    const { getByText } = render(
      <MarketStrip market={mockMarket} provider="finnhub" count={5} />
    );
    expect(getByText('Regular trading')).toBeTruthy();
  });

  it('displays symbol count with padding', () => {
    const { getByText } = render(
      <MarketStrip market={mockMarket} provider="finnhub" count={5} />
    );
    expect(getByText('05')).toBeTruthy();
  });

  it('shows open status dot when market is open', () => {
    const { container } = render(
      <MarketStrip market={mockMarket} provider="finnhub" count={5} />
    );
    const statusDot = container.querySelector('.status-dot');
    expect(statusDot?.className).not.toContain('closed');
  });

  it('shows closed status when market is closed', () => {
    const closedMarket: DashboardPayload['market'] = {
      ...mockMarket,
      isOpen: false,
      label: 'Pre-market',
    };
    const { container } = render(
      <MarketStrip market={closedMarket} provider="finnhub" count={5} />
    );
    const statusDot = container.querySelector('.status-dot');
    expect(statusDot?.className).toContain('closed');
  });

  it('displays refresh interval', () => {
    const { getByText } = render(
      <MarketStrip market={mockMarket} provider="finnhub" count={5} />
    );
    expect(getByText('15s')).toBeTruthy();
  });

  it('displays provider adapter name', () => {
    const { getByText } = render(
      <MarketStrip market={mockMarket} provider="demo" count={5} />
    );
    expect(getByText('demo')).toBeTruthy();
  });

  it('displays next event text', () => {
    const { getByText } = render(
      <MarketStrip market={mockMarket} provider="finnhub" count={5} />
    );
    expect(getByText('closes 16:00 ET')).toBeTruthy();
  });

  it('handles different provider types', () => {
    const { rerender, getByText } = render(
      <MarketStrip market={mockMarket} provider="finnhub" count={5} />
    );
    expect(getByText('finnhub')).toBeTruthy();

    rerender(
      <MarketStrip market={mockMarket} provider="demo" count={5} />
    );
    expect(getByText('demo')).toBeTruthy();
  });

  it('handles large symbol counts', () => {
    const { getByText } = render(
      <MarketStrip market={mockMarket} provider="finnhub" count={150} />
    );
    expect(getByText('150')).toBeTruthy();
  });
});
