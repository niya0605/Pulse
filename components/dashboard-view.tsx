"use client";

import { Sparkles } from "lucide-react";
import { useState } from "react";
import type { DashboardPayload, Insight } from "@/lib/types";
import { formatTime } from "@/lib/formatters";
import { AppShell } from "@/components/app-shell";
import { InsightCard } from "@/components/insight-card";
import { LeadSymbol } from "@/components/lead-symbol";
import { MarketStrip } from "@/components/market-strip";
import { SearchCommand } from "@/components/search-command";
import { WatchlistTable } from "@/components/watchlist-table";

export function DashboardView({ initial, leadInsight }: { initial: DashboardPayload; leadInsight: Insight | null }) {
  const [refreshedAt, setRefreshedAt] = useState(() => new Date());
  const lead = initial.watchlist[0];
  return <AppShell provider={initial.provider}>
    <div className="page-intro"><div><div className="eyebrow">Thursday · October 2, 2026</div><h1>Stay close to the signal.</h1><p>Your watchlist, distilled. Quotes refresh every 15 seconds; meaningful moves earn a deeper read.</p></div><SearchCommand onAdded={() => { setRefreshedAt(new Date()); window.location.reload(); }} /></div>
    <MarketStrip market={initial.market} provider={initial.provider} count={initial.watchlist.length} />
    <div className="dashboard-layout"><div style={{ display: "grid", gap: 22 }}><WatchlistTable initial={initial} onChanged={() => setRefreshedAt(new Date())} /><div className="notice"><Sparkles size={13} style={{ display: "inline", verticalAlign: "-2px", marginRight: 6 }} /><strong>Signal layer active.</strong> A move larger than 2% since the last insight triggers a fresh read, with a five-minute debounce per symbol.</div></div><div className="side-stack">{lead ? <LeadSymbol quote={lead} /> : <div className="panel empty-state"><strong>No live symbols yet.</strong>{initial.provider === "unconfigured" ? "Configure FINNHUB_API_KEY, then search to add your first symbol." : "Search above to add a symbol and start tracking its signal."}</div>}<InsightCard insight={leadInsight} compact /><div className="signal-card panel"><div className="eyebrow">Last sync</div><div className="signal-line" /><div className="signal-row"><span>Quotes</span><strong className="timestamp">{formatTime(refreshedAt.toISOString())}</strong></div><div className="signal-row"><span>News scan</span><strong className="timestamp">15 min cadence</strong></div><div className="signal-row"><span>AI refresh</span><strong className="timestamp">5 min debounce</strong></div></div></div></div>
  </AppShell>;
}
