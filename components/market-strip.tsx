import { Activity, Clock3, Globe2 } from "lucide-react";
import type { DashboardPayload } from "@/lib/types";

export function MarketStrip({ market, provider, count }: Pick<DashboardPayload, "market" | "provider"> & { count: number }) {
  return <div className="market-strip">
    <div className="market-cell"><div className="data-label">Session status</div><div className="market-value"><span className={`status-dot ${market.isOpen ? "" : "closed"}`} />{market.label}<small>{market.nextEvent}</small></div></div>
    <div className="market-cell"><div className="data-label"><Activity size={11} style={{ display: "inline", verticalAlign: "-2px", marginRight: 5 }} />Coverage</div><div className="market-value">{String(count).padStart(2, "0")} <small>symbols tracked</small></div></div>
    <div className="market-cell"><div className="data-label"><Clock3 size={11} style={{ display: "inline", verticalAlign: "-2px", marginRight: 5 }} />Refresh</div><div className="market-value">15s <small>poll interval</small></div></div>
    <div className="market-cell"><div className="data-label"><Globe2 size={11} style={{ display: "inline", verticalAlign: "-2px", marginRight: 5 }} />Data source</div><div className="market-value" style={{ textTransform: "capitalize" }}>{provider} <small>adapter</small></div></div>
  </div>;
}
