"use client";

import Link from "next/link";
import { ArrowUpRight, LoaderCircle, Trash2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { formatChange, formatPercent, formatPrice } from "@/lib/formatters";
import type { DashboardPayload, Quote } from "@/lib/types";
import { Sparkline } from "@/components/sparkline";

function ageLabel(value: string) {
  const seconds = Math.max(0, Math.round((Date.now() - new Date(value).getTime()) / 1000));
  return seconds < 5 ? "just now" : `${seconds}s ago`;
}

export function WatchlistTable({ initial, onChanged }: { initial: DashboardPayload; onChanged?: () => void }) {
  const [removing, setRemoving] = useState<string | null>(null);
  const { data, isFetching, refetch } = useQuery({
    queryKey: ["watchlist"],
    queryFn: async () => (await fetch("/api/watchlist")).json() as Promise<DashboardPayload>,
    initialData: initial,
    refetchInterval: 15_000,
  });
  const quotes = data.watchlist;

  async function remove(symbol: string) {
    setRemoving(symbol);
    await fetch(`/api/watchlist/${symbol}`, { method: "DELETE" });
    await refetch();
    setRemoving(null);
    onChanged?.();
  }

  return <div className="panel" style={{ overflow: "hidden" }}>
    <div className="panel-header"><div><div className="panel-title">Your watchlist <span style={{ color: "var(--ink-soft)", fontWeight: 500 }}>· {quotes.length} names</span></div><div className="panel-caption" style={{ marginTop: 5 }}>Sorted by today&apos;s move</div></div><div style={{ display: "flex", alignItems: "center", gap: 8 }}>{isFetching && <LoaderCircle size={13} className="animate-spin" style={{ color: "var(--ink-soft)" }} />}<span className="timestamp" style={{ color: "var(--ink-soft)", fontSize: 10 }}>auto-refresh 15s</span></div></div>
    {quotes.length === 0 ? <div className="empty-state"><strong>Your watchlist is clear.</strong>Search above to add a symbol and start tracking its signal.</div> : <div style={{ overflowX: "auto" }}><table className="watchlist-table"><thead><tr><th>Symbol</th><th>Last</th><th>Change</th><th>Today</th><th>Range</th><th>Trend</th><th aria-label="Actions" /></tr></thead><tbody>{quotes.map((quote: Quote) => {
      const positive = quote.pctChange >= 0;
      return <tr key={quote.symbol}>
        <td><Link href={`/dashboard/${quote.symbol}`} className="ticker-cell" style={{ textDecoration: "none", color: "inherit" }}><div className="ticker-badge">{quote.symbol.slice(0, 2)}</div><div className="ticker-name"><strong>{quote.symbol}</strong><span>{quote.name}</span></div></Link></td>
        <td><span className="data-value">{formatPrice(quote.price)}</span><span className="timestamp" style={{ display: "block", color: "var(--ink-soft)", fontSize: 9, marginTop: 4 }}>{ageLabel(quote.fetchedAt)}</span></td>
        <td><span className={`data-value ${positive ? "up" : "down"}`}>{formatChange(quote.change)}</span></td>
        <td><span className={`data-value ${positive ? "up" : "down"}`}>{formatPercent(quote.pctChange)}</span></td>
        <td><span className="timestamp" style={{ color: "var(--ink-soft)", fontSize: 10 }}>{formatPrice(quote.low)} — {formatPrice(quote.high)}</span></td>
        <td><Sparkline values={quote.snapshots.map((item) => item.price)} positive={positive} /></td>
        <td><button className="remove-button" aria-label={`Remove ${quote.symbol}`} disabled={removing === quote.symbol} onClick={() => remove(quote.symbol)}>{removing === quote.symbol ? <LoaderCircle size={14} className="animate-spin" /> : <Trash2 size={14} />}</button><Link href={`/dashboard/${quote.symbol}`} aria-label={`Open ${quote.symbol}`} style={{ color: "var(--ink-soft)", marginLeft: 4 }}><ArrowUpRight size={14} /></Link></td>
      </tr>;
    })}</tbody></table></div>}
  </div>;
}
