// @ts-nocheck
import { getDemoDashboard, getDemoDetail, getDemoQuote, getMarketStatus } from "@/lib/demo-data";
import { loadDetail, loadQuote } from "@/lib/providers";
import { generateInsight } from "@/lib/providers/ai";
import { getStoredDashboard, getStoredDetail, persistDetail, persistQuote, removeStoredWatchlistItem } from "@/lib/repository";
import { getCurrentUserId } from "@/lib/current-user";
import type { DashboardPayload, Quote, SymbolDetail } from "@/lib/types";

const isDemoMode = () => process.env.PULSE_DEMO_MODE === "true";
const hasMarketProvider = () => Boolean(process.env.FINNHUB_API_KEY);

export function isLiveProviderAvailable() { return hasMarketProvider(); }
export function isPreviewDemoMode() { return isDemoMode(); }

export async function getDashboardData(): Promise<DashboardPayload> {
  if (isDemoMode()) return getDemoDashboard();
  const provider: DashboardPayload["provider"] = hasMarketProvider() ? "finnhub" : "unconfigured";
  try {
    const dashboard = await getStoredDashboard(getMarketStatus(), provider, await getCurrentUserId());

    // Refresh quotes and create snapshots
    if (hasMarketProvider() && dashboard.watchlist.length > 0) {
      const symbols = dashboard.watchlist.map(q => q.symbol);
      try {
        const freshQuotes = await getQuoteData(symbols);
        dashboard.watchlist = freshQuotes;
      } catch (error) {
        console.error("Quote refresh error:", error);
      }
    }

    return dashboard;
  }
  catch { return { watchlist: [], market: getMarketStatus(), provider }; }
}

export async function addToWatchlist(symbol: string): Promise<Quote> {
  if (isDemoMode()) return getDemoQuote(symbol);
  if (!hasMarketProvider()) throw new Error("FINNHUB_API_KEY is required before adding live symbols");
  const detail = await loadDetail(symbol.toUpperCase());
  const userId = await getCurrentUserId();
  await persistDetail(detail, true, userId);

  // Generate and persist insight immediately if Groq is available
  if (process.env.GROQ_API_KEY) {
    try {
      const insight = await Promise.race([
        generateInsight(detail.quote, detail.news, undefined),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Insight generation timeout")), 30000))
      ]);
      if (insight) {
        await persistDetail({ ...detail, insight }, false, userId);
      }
    } catch (error) {
      console.error("Insight generation error:", error instanceof Error ? error.message : String(error));
    }
  }

  return detail.quote;
}

export async function removeFromWatchlist(symbol: string) {
  if (isDemoMode()) return;
  await removeStoredWatchlistItem(symbol.toUpperCase(), await getCurrentUserId());
}

export async function getQuoteData(symbols: string[]) {
  if (isDemoMode()) return symbols.map(getDemoQuote);
  if (!hasMarketProvider()) return [];
  const quotes = await Promise.all(symbols.map((symbol) => loadQuote(symbol)));
  await Promise.all(quotes.map((quote) => persistQuote(quote)));
  return quotes;
}

export async function getSymbolData(symbol: string): Promise<SymbolDetail> {
  if (isDemoMode()) return getDemoDetail(symbol);
  const stored = await getStoredDetail(symbol.toUpperCase());

  // Auto-generate insight if missing and Groq is available
  if (stored && !stored.insight && process.env.GROQ_API_KEY) {
    try {
      const insight = await Promise.race([
        generateInsight(stored.quote, stored.news, undefined),
        new Promise<any>((_, reject) => setTimeout(() => reject(new Error("timeout")), 15000))
      ]);
      if (insight) {
        await persistDetail({ ...stored, insight }, false, await getCurrentUserId());
        return { ...stored, insight };
      }
    } catch (error) {
      console.error("Auto-insight generation failed:", error);
    }
  }

  if (stored) return stored;
  if (!hasMarketProvider()) throw new Error("FINNHUB_API_KEY is required before loading live symbol data");
  const detail = await loadDetail(symbol.toUpperCase());
  await persistDetail(detail);
  return detail;
}
