"use client";

import { Check, LoaderCircle, Plus, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { SearchResult } from "@/lib/types";

export function SearchCommand({ onAdded }: { onAdded?: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [added, setAdded] = useState<string[]>([]);
  const [addingSymbol, setAddingSymbol] = useState<string | null>(null);

  useEffect(() => {
    const handle = setTimeout(async () => {
      if (!query.trim()) { setResults([]); setError(""); return; }
      setLoading(true); setError("");
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? "Search unavailable");
        setResults(data.results ?? []);
      } catch (caught) { setResults([]); setError(caught instanceof Error ? caught.message : "Search unavailable"); }
      finally { setLoading(false); }
    }, 260);
    return () => clearTimeout(handle);
  }, [query]);

  async function add(symbol: string) {
    setAddingSymbol(symbol);
    try {
      const response = await fetch("/api/watchlist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ symbol }) });
      if (!response.ok) { const data = await response.json(); setError(data.error ?? "Could not add symbol"); return; }
      setAdded((current) => [...new Set([...current, symbol])]); onAdded?.();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Could not add symbol"); }
    finally { setAddingSymbol(null); }
  }

  const showResults = Boolean(query.trim()) && (loading || results.length > 0 || Boolean(error));
  return <div className="search-wrap"><Search size={14} className="search-icon" /><input className="search-input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search symbols to add…" aria-label="Search symbols" />{query && <button type="button" className="icon-button" onClick={() => setQuery("")} style={{ position: "absolute", right: 5, top: 5, width: 26, height: 26, border: 0, background: "transparent" }} aria-label="Clear search"><X size={13} /></button>}{showResults && <div className="search-results">{loading && <div style={{ padding: "14px", color: "var(--ink-soft)", fontSize: 11 }}><LoaderCircle size={13} className="animate-spin" style={{ display: "inline", verticalAlign: "-2px", marginRight: 6 }} />Scanning live symbols…</div>}{!loading && error && <div style={{ padding: "14px", color: "#9a4338", fontSize: 11, lineHeight: 1.45 }}>{error}</div>}{!loading && !error && results.map((result) => { const isAdded = added.includes(result.symbol); const isAdding = addingSymbol === result.symbol; return <button type="button" className="search-result" key={result.symbol} onClick={() => add(result.symbol)} disabled={isAdding} style={{ opacity: isAdding ? 0.6 : 1 }}><span><strong>{result.symbol}</strong><span>{result.name}</span></span><em>{isAdded ? <><Check size={13} style={{ verticalAlign: "-2px" }} /> Added</> : isAdding ? <><LoaderCircle size={13} className="animate-spin" style={{ verticalAlign: "-2px" }} /> Adding…</> : <><Plus size={13} style={{ verticalAlign: "-2px" }} /> Add</>}</em></button>; })}</div>}</div>;
}
