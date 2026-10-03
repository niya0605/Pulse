"use client";

import { useState, useEffect } from "react";
import type { Snapshot } from "@/lib/types";
import { formatPrice } from "@/lib/formatters";

export function IntradayChart({ snapshots, positive, symbol }: { snapshots: Snapshot[]; positive: boolean; symbol: string }) {
  const [range, setRange] = useState("1D");
  const [historicalData, setHistoricalData] = useState<Array<{ ts: string; price: number }>>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (range === "1D") return;

    const daysBack = range === "5D" ? 5 : 30;
    setLoading(true);
    fetch(`/api/candles?symbol=${symbol}&days=${daysBack}`)
      .then(r => r.json())
      .then(data => setHistoricalData(data.candles || []))
      .catch(() => setHistoricalData([]))
      .finally(() => setLoading(false));
  }, [range, symbol]);

  const displayData = range === "1D" ? snapshots : historicalData;
  const values = displayData.map((point) => point.price);
  const formatChartTime = (iso: string) => new Date(iso).toISOString().slice(11, 16);
  const firstTime = formatChartTime(snapshots[0]?.ts ?? "2000-01-01T00:00:00.000Z");
  const lastTime = formatChartTime(snapshots.at(-1)?.ts ?? "2000-01-01T00:00:00.000Z");

  // Calculate chart dimensions
  const width = 800;
  const height = 300;
  const minPrice = Math.min(...values);
  const maxPrice = Math.max(...values);
  const priceRange = maxPrice - minPrice || 1;
  const padding = 40;

  // Generate SVG path
  const points = values.map((price, i) => ({
    x: padding + (i / Math.max(values.length - 1, 1)) * (width - 2 * padding),
    y: height - padding - ((price - minPrice) / priceRange) * (height - 2 * padding)
  }));

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaD = pathD + ` L ${points[points.length - 1]?.x} ${height - padding} L ${padding} ${height - padding} Z`;

  return <>
    <div className="chart-toolbar"><div><div className="eyebrow">Stored snapshots · intraday</div><div className="panel-caption" style={{ marginTop: 5 }}>Live price tracking ({snapshots.length} data points) — 5D/1M coming soon</div></div><div className="range-tabs">{["1D"].map((value) => <button key={value} className={`range-tab ${range === value ? "active" : ""}`} onClick={() => setRange(value)}>{value}</button>)}</div></div>
    <div className="chart-shell" style={{ position: "relative", padding: "20px", borderRadius: 8 }}>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", height: "auto", minHeight: "300px" }} preserveAspectRatio="xMidYMid meet">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct) => (
          <line key={`grid-${pct}`} x1={padding} y1={height - padding - pct * (height - 2 * padding)} x2={width - padding} y2={height - padding - pct * (height - 2 * padding)} stroke="#e5eae1" strokeWidth="1" />
        ))}

        {/* Area fill */}
        <path d={areaD} fill={positive ? "rgba(169, 220, 40, 0.1)" : "rgba(231, 128, 109, 0.1)"} />

        {/* Line */}
        <path d={pathD} stroke={positive ? "#a9dc28" : "#e7806d"} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />

        {/* Data points */}
        {points.map((p, i) => (
          <circle key={`dot-${i}`} cx={p.x} cy={p.y} r="3" fill={positive ? "#a9dc28" : "#e7806d"} />
        ))}

        {/* Y-axis labels */}
        <text x={padding - 10} y={height - padding + 5} textAnchor="end" fontSize="10" fill="var(--ink-soft)">{formatPrice(minPrice)}</text>
        <text x={padding - 10} y={padding + 5} textAnchor="end" fontSize="10" fill="var(--ink-soft)">{formatPrice(maxPrice)}</text>
      </svg>
      <div className="timestamp" style={{ display: "flex", justifyContent: "space-between", color: "var(--ink-soft)", fontSize: 9, marginTop: 10 }}><span>{firstTime}</span><span>now · {lastTime}</span></div>
    </div>
  </>;
}
