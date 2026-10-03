import type { NewsItem, Profile, Quote, SearchResult } from "@/lib/types";

const API_BASE = "https://finnhub.io/api/v1";

async function finnhub<T>(path: string): Promise<T> {
  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) throw new Error("FINNHUB_API_KEY is not configured");
  const url = `${API_BASE}${path}${path.includes("?") ? "&" : "?"}token=${apiKey}`;
  console.log(`[Finnhub] Fetching: ${path}`);
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      console.log(`[Finnhub] Timeout for: ${path}`);
      controller.abort();
    }, 30000);
    const response = await fetch(url, {
      next: { revalidate: 60 },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    console.log(`[Finnhub] Response ${response.status} for: ${path}`);
    if (!response.ok) throw new Error(`Finnhub request failed with ${response.status}`);
    return response.json() as Promise<T>;
  } catch (error) {
    console.error(`[Finnhub] Error for ${path}:`, error);
    throw new Error(`Finnhub API error: ${error instanceof Error ? error.message : String(error)}`);
  }
}

type FinnhubQuote = { c: number; d: number; dp: number; h: number; l: number; o: number; pc: number; t: number };
type FinnhubSearch = { result?: Array<{ description: string; displaySymbol: string; symbol: string; type: string }> };
type FinnhubProfile = { name: string; ticker: string; exchange: string; finnhubIndustry?: string; marketCapitalization?: number; ipo?: string; weburl?: string; logo?: string; country?: string };
type FinnhubNews = Array<{ id: number; headline: string; source: string; url: string; datetime: number; summary?: string }>;

export async function getFinnhubQuote(symbol: string): Promise<Quote> {
  const quote = await finnhub<FinnhubQuote>(`/quote?symbol=${encodeURIComponent(symbol)}`);
  const fetchedAt = new Date().toISOString();
  return {
    symbol,
    name: symbol,
    exchange: "NASDAQ",
    price: quote.c,
    change: quote.d,
    pctChange: quote.dp,
    high: quote.h,
    low: quote.l,
    open: quote.o,
    prevClose: quote.pc,
    fetchedAt,
    snapshots: [{ ts: fetchedAt, price: quote.c }],
  };
}

export async function searchFinnhub(query: string): Promise<SearchResult[]> {
  const result = await finnhub<FinnhubSearch>(`/search?q=${encodeURIComponent(query)}`);
  return (result.result ?? []).slice(0, 8).map((item) => ({
    symbol: item.displaySymbol || item.symbol,
    name: item.description,
    exchange: item.symbol.split(":")[0] || "US",
    type: item.type,
  }));
}

export async function getFinnhubProfile(symbol: string): Promise<Profile> {
  const profile = await finnhub<FinnhubProfile>(`/stock/profile2?symbol=${encodeURIComponent(symbol)}`);
  return {
    symbol,
    name: profile.name || symbol,
    exchange: profile.exchange || "NASDAQ",
    industry: profile.finnhubIndustry || "Public company",
    marketCap: profile.marketCapitalization ? `$${(profile.marketCapitalization / 1000).toFixed(2)}B` : "—",
    ipo: profile.ipo || "—",
    website: profile.weburl?.replace(/^https?:\/\//, "") || "—",
    tagline: "Company profile from Finnhub.",
    description: `Latest public profile data for ${profile.name || symbol}.`,
  };
}

export async function getFinnhubNews(symbol: string): Promise<NewsItem[]> {
  const today = new Date();
  const from = new Date(today.getTime() - 7 * 86_400_000).toISOString().slice(0, 10);
  const to = today.toISOString().slice(0, 10);
  const result = await finnhub<FinnhubNews>(`/company-news?symbol=${encodeURIComponent(symbol)}&from=${from}&to=${to}`);
  return result.slice(0, 5).map((item, index) => ({
    id: `${symbol}-${item.id || index}`,
    symbol,
    headline: item.headline,
    source: item.source,
    url: item.url,
    publishedAt: new Date(item.datetime * 1000).toISOString(),
    tone: index === 2 ? "caution" : "neutral",
  }));
}

type FinnhubCandle = { t: number[]; c: number[]; h: number[]; l: number[]; o: number[]; v: number[] };

export async function getFinnhubCandles(symbol: string, daysBack: number): Promise<Array<{ ts: string; price: number }>> {
  const to = Math.floor(Date.now() / 1000);
  const from = to - (daysBack * 86400);
  try {
    const result = await finnhub<FinnhubCandle>(`/stock/candle?symbol=${encodeURIComponent(symbol)}&resolution=60&from=${from}&to=${to}`);
    if (!result.t || !result.c) return [];
    return result.t.map((timestamp, index) => ({
      ts: new Date(timestamp * 1000).toISOString(),
      price: result.c[index]
    }));
  } catch {
    return [];
  }
}
