import { BrainCircuit } from "lucide-react";
import type { Insight } from "@/lib/types";

export function InsightCard({ insight, compact = false }: { insight: Insight | null; compact?: boolean }) {
  if (!insight) return <section className={`panel insight-card ${compact ? "compact" : ""}`}><div className="eyebrow"><BrainCircuit size={12} style={{ display: "inline", verticalAlign: "-2px", marginRight: 5 }} />AI read</div><div style={{ marginTop: 10, fontSize: 15, fontWeight: 760, letterSpacing: "-.04em" }}>Insight waiting on provider keys</div><p className="insight-summary">The quote and headlines are stored. Add `GROQ_API_KEY` to generate the structured summary, trend, drivers, risks, and confidence score.</p><p className="disclaimer">No AI result has been invented for this symbol. AI-generated, not financial advice.</p></section>;
  return <section className={`panel insight-card ${compact ? "compact" : ""}`}>
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}><div><div className="eyebrow"><BrainCircuit size={12} style={{ display: "inline", verticalAlign: "-2px", marginRight: 5 }} />AI read · {insight.symbol}</div><div style={{ marginTop: 8, fontSize: 15, fontWeight: 760, letterSpacing: "-.04em" }}>The signal, in plain English</div></div><span className={`insight-tag ${insight.trend}`}>{insight.trend}</span></div>
    <p className="insight-summary">{insight.summary}</p>
    <div className="insight-columns"><div><h4>Drivers</h4><ul>{insight.drivers.map((driver) => <li key={driver}>{driver}</li>)}</ul></div><div className="risks"><h4>Risks to watch</h4><ul>{insight.risks.map((risk) => <li key={risk}>{risk}</li>)}</ul></div></div>
    <div className="confidence"><div className="confidence-head"><span>Confidence</span><strong>{insight.confidence}%</strong></div><div className="progress"><span style={{ width: `${insight.confidence}%` }} /></div></div>
    <p className="disclaimer">AI-generated, not financial advice. Built from current snapshots and the latest available headlines.</p>
  </section>;
}
