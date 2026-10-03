import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Sparkline } from './sparkline';

describe('Sparkline', () => {
  it('renders SVG element', () => {
    const { container } = render(<Sparkline values={[1, 2, 3, 4, 5]} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
  });

  it('renders with correct role and aria-label', () => {
    const { container } = render(<Sparkline values={[1, 2, 3]} />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('role')).toBe('img');
    expect(svg?.getAttribute('aria-label')).toBe('Price trend sparkline');
  });

  it('sets default small dimensions', () => {
    const { container } = render(<Sparkline values={[1, 2, 3]} />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('viewBox')).toBe('0 0 110 30');
  });

  it('sets large dimensions when large prop is true', () => {
    const { container } = render(<Sparkline values={[1, 2, 3]} large />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('viewBox')).toBe('0 0 420 70');
  });

  it('renders polyline for chart', () => {
    const { container } = render(<Sparkline values={[1, 2, 3, 4, 5]} />);
    const polyline = container.querySelector('polyline');
    expect(polyline).toBeTruthy();
  });

  it('uses green stroke for positive values', () => {
    const { container } = render(<Sparkline values={[1, 2, 3]} positive />);
    const polyline = container.querySelector('polyline');
    expect(polyline?.getAttribute('stroke')).toBe('#a9dc28');
  });

  it('uses red stroke for negative values', () => {
    const { container } = render(<Sparkline values={[1, 2, 3]} positive={false} />);
    const polyline = container.querySelector('polyline');
    expect(polyline?.getAttribute('stroke')).toBe('#e7806d');
  });

  it('renders polygon when large is true', () => {
    const { container } = render(<Sparkline values={[1, 2, 3]} large />);
    const polygon = container.querySelector('polygon');
    expect(polygon).toBeTruthy();
  });

  it('does not render polygon when large is false', () => {
    const { container } = render(<Sparkline values={[1, 2, 3]} />);
    const polygon = container.querySelector('polygon');
    expect(polygon).toBeFalsy();
  });

  it('handles constant values', () => {
    const { container } = render(<Sparkline values={[5, 5, 5, 5]} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
  });

  it('handles single value', () => {
    const { container } = render(<Sparkline values={[42]} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
  });
});
