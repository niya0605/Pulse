import Link from "next/link";
import { ArrowUpRight, Radio } from "lucide-react";
import type { Quote } from "@/lib/types";
import { formatChange, formatPercent, formatPrice } from "@/lib/formatters";
import { Sparkline } from "@/components/sparkline";

export function LeadSymbol({ quote }: { quote: Quote }) {
  const positive = quote.pctChange >= 0;
  return <Link href={`/dashboard/${quote.symbol}`} className="lead-card" style={{ textDecoration: "none", display: "block" }}>
    <div className="lead-top"><div><div className="eyebrow"><Radio size={11} style={{ display: "inline", verticalAlign: "-2px", marginRight: 5, color: "var(--pulse)" }} />Lead signal · strongest move</div><div className="lead-symbol"><strong>{quote.symbol}</strong><span>{quote.name}</span></div></div><ArrowUpRight size={16} color="#aab6a9" /></div>
    <div className="lead-price">{formatPrice(quote.price)}</div>
    <div className="lead-meta"><span className={positive ? "up" : "down"}>{formatChange(quote.change)} · {formatPercent(quote.pctChange)}</span><span style={{ color: "#aab6a9" }}>today</span></div>
    <div className="lead-chart"><Sparkline values={quote.snapshots.map((item) => item.price)} positive={positive} large /></div>
    <div className="lead-footer"><span>High {formatPrice(quote.high)}</span><span>Low {formatPrice(quote.low)}</span><span>View signal →</span></div>
  </Link>;
}
