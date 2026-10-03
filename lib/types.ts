export type Trend = "bullish" | "bearish" | "neutral";

export type Snapshot = {
  ts: string;
  price: number;
};

export type Quote = {
  symbol: string;
  name: string;
  exchange: string;
  logo?: string;
  price: number;
  change: number;
  pctChange: number;
  high: number;
  low: number;
  open: number;
  prevClose: number;
  fetchedAt: string;
  snapshots: Snapshot[];
};

export type NewsItem = {
  id: string;
  symbol: string;
  headline: string;
  source: string;
  url: string;
  publishedAt: string;
  tone: "positive" | "neutral" | "caution";
};

export type Profile = {
  symbol: string;
  name: string;
  exchange: string;
  industry: string;
  marketCap: string;
  ipo: string;
  website: string;
  tagline: string;
  description: string;
};

export type Insight = {
  symbol: string;
  summary: string;
  trend: Trend;
  drivers: string[];
  risks: string[];
  confidence: number;
  priceAtGen: number;
  createdAt: string;
};

export type SymbolDetail = {
  quote: Quote;
  profile: Profile;
  news: NewsItem[];
  insight: Insight | null;
};

export type SearchResult = {
  symbol: string;
  name: string;
  exchange: string;
  type: string;
};

export type DashboardPayload = {
  watchlist: Quote[];
  market: {
    isOpen: boolean;
    label: string;
    session: string;
    nextEvent: string;
  };
  provider: "demo" | "finnhub" | "unconfigured";
};
