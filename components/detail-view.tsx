"use client";

import Link from "next/link";
import { ArrowLeft, BrainCircuit, ExternalLink, LoaderCircle, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import type { SymbolDetail } from "@/lib/types";
import { AppShell } from "@/components/app-shell";
import { InsightCard } from "@/components/insight-card";
import { IntradayChart } from "@/components/intraday-chart";
import { formatChange, formatPrice } from "@/lib/formatters";

export function DetailView({ initial }: { initial: SymbolDetail }) {
  const [detail, setDetail] = useState(initial);
  const [refreshing, setRefreshing] = useState(false);
  const positive = detail.quote.pctChange >= 0;

  // Auto-refresh snapshots every 15 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/symbols/${detail.quote.symbol}`);
        const data = await response.json();
        if (data.quote?.snapshots) {
          setDetail(current => ({ ...current, quote: { ...current.quote, snapshots: data.quote.snapshots } }));
        }
      } catch (error) {
        console.error("Failed to refresh snapshots:", error);
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [detail.quote.symbol]);

  async function refreshInsight() {
    setRefreshing(true);
    try {
      const response = await fetch(`/api/symbols/${detail.quote.symbol}/insight`, { method: "POST" });
      const data = await response.json();
      if (data.insight) setDetail((current) => ({ ...current, insight: data.insight }));
    } finally { setRefreshing(false); }
  }
  return <AppShell detail>
    <div className="detail-header"><div><Link href="/dashboard" className="eyebrow" style={{ textDecoration: "none", color: "var(--ink-soft)" }}><ArrowLeft size={12} style={{ display: "inline", verticalAlign: "-2px", marginRight: 5 }} />Back to watchlist</Link><div className="detail-title" style={{ marginTop: 12 }}><div className="ticker-badge" style={{ width: 42, height: 42, fontSize: 12 }}>{detail.quote.symbol.slice(0, 2)}</div><div><h1>{detail.quote.symbol}</h1><p>{detail.profile.name} · {detail.profile.exchange}</p></div></div></div><div className="detail-price"><strong>{formatPrice(detail.quote.price)}</strong><span className={positive ? "up" : "down"}>{formatChange(detail.quote.change)} · {detail.quote.pctChange >= 0 ? "+" : ""}{detail.quote.pctChange.toFixed(2)}% today</span></div></div>
    <div className="detail-grid">
      <div style={{ display: "grid", gap: 22 }}>
        <section className="panel chart-panel"><IntradayChart key={detail.quote.snapshots.length} snapshots={detail.quote.snapshots} positive={positive} symbol={detail.quote.symbol} /><div className="chart-stats"><div className="chart-stat"><div className="data-label">Open</div><strong>{formatPrice(detail.quote.open)}</strong></div><div className="chart-stat"><div className="data-label">High</div><strong>{formatPrice(detail.quote.high)}</strong></div><div className="chart-stat"><div className="data-label">Low</div><strong>{formatPrice(detail.quote.low)}</strong></div><div className="chart-stat"><div className="data-label">Prev close</div><strong>{formatPrice(detail.quote.prevClose)}</strong></div></div></section>
        <InsightCard insight={detail.insight} />
      </div>
      <div className="side-stack">
        <section className="panel profile-card"><div className="eyebrow">Company profile</div><h3>{detail.profile.name}</h3><p>{detail.profile.description}</p><div className="profile-tags"><span className="profile-tag">{detail.profile.industry}</span><span className="profile-tag">Mkt cap {detail.profile.marketCap}</span><span className="profile-tag">IPO {detail.profile.ipo}</span></div><p style={{ marginTop: 15, fontFamily: "monospace", fontSize: 10 }}>{detail.profile.website} ↗</p></section>
        <section className="panel" style={{ padding: 18 }}><div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 12 }}><div><div className="eyebrow">Latest news</div><div style={{ marginTop: 7, fontSize: 15, fontWeight: 760, letterSpacing: "-.04em" }}>What is moving the tape</div></div><ExternalLink size={14} color="var(--ink-soft)" /></div><div className="news-list">{detail.news.map((item) => <a className="news-item" key={item.id} href={item.url} target="_blank" rel="noopener noreferrer"><strong>{item.headline}</strong><div className="news-meta"><span className={`news-tone ${item.tone}`} /><span>{item.source}</span><span>·</span><span>{new Date(item.publishedAt).toISOString().split('T')[0]}</span></div></a>)}</div></section>
        <button className="primary-button" onClick={refreshInsight} disabled={refreshing} style={{ width: "100%" }}>{refreshing ? <><LoaderCircle size={14} className="animate-spin" style={{ display: "inline", verticalAlign: "-2px", marginRight: 6 }} />Refreshing signal…</> : <><RefreshCw size={14} style={{ display: "inline", verticalAlign: "-2px", marginRight: 6 }} />Refresh AI insight</>}</button>
        <div className="notice"><BrainCircuit size={13} style={{ display: "inline", verticalAlign: "-2px", marginRight: 6 }} />Insight refresh is debounced for five minutes per symbol to control LLM cost.</div>
      </div>
    </div>
  </AppShell>;
}
