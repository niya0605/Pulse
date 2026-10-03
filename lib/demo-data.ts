import type {
  DashboardPayload,
  Insight,
  NewsItem,
  Profile,
  Quote,
  SearchResult,
  Snapshot,
  SymbolDetail,
} from "@/lib/types";

const now = () => new Date().toISOString();

const baseQuotes: Record<string, Omit<Quote, "fetchedAt" | "snapshots">> = {
  AAPL: {
    symbol: "AAPL",
    name: "Apple Inc.",
    exchange: "NASDAQ",
    price: 227.45,
    change: 2.84,
    pctChange: 1.26,
    high: 228.09,
    low: 224.71,
    open: 225.1,
    prevClose: 224.61,
  },
  NVDA: {
    symbol: "NVDA",
    name: "NVIDIA Corporation",
    exchange: "NASDAQ",
    price: 177.08,
    change: -1.47,
    pctChange: -0.82,
    high: 180.42,
    low: 175.66,
    open: 179.2,
    prevClose: 178.55,
  },
  MSFT: {
    symbol: "MSFT",
    name: "Microsoft Corporation",
    exchange: "NASDAQ",
    price: 512.64,
    change: 3.28,
    pctChange: 0.64,
    high: 514.22,
    low: 507.11,
    open: 509.36,
    prevClose: 509.36,
  },
  TSLA: {
    symbol: "TSLA",
    name: "Tesla, Inc.",
    exchange: "NASDAQ",
    price: 437.11,
    change: 8.77,
    pctChange: 2.05,
    high: 441.98,
    low: 427.03,
    open: 428.82,
    prevClose: 428.34,
  },
};

const profiles: Record<string, Profile> = {
  AAPL: {
    symbol: "AAPL",
    name: "Apple Inc.",
    exchange: "NASDAQ",
    industry: "Consumer Electronics",
    marketCap: "$3.42T",
    ipo: "1980",
    website: "apple.com",
    tagline: "Building the tools people use to make, connect, and create.",
    description:
      "Apple designs hardware, software, and services with an unusually integrated ecosystem. Services growth and premium device demand remain the central read-throughs for the name.",
  },
  NVDA: {
    symbol: "NVDA",
    name: "NVIDIA Corporation",
    exchange: "NASDAQ",
    industry: "Semiconductors",
    marketCap: "$4.31T",
    ipo: "1999",
    website: "nvidia.com",
    tagline: "Accelerating the next era of compute.",
    description:
      "NVIDIA builds accelerated computing platforms for AI, data centers, gaming, and visualization. The market is focused on the pace of AI infrastructure demand and supply execution.",
  },
  MSFT: {
    symbol: "MSFT",
    name: "Microsoft Corporation",
    exchange: "NASDAQ",
    industry: "Software — Infrastructure",
    marketCap: "$3.81T",
    ipo: "1986",
    website: "microsoft.com",
    tagline: "Cloud, software, and intelligence at enterprise scale.",
    description:
      "Microsoft operates across productivity software, cloud infrastructure, enterprise applications, and gaming. Azure growth and AI monetization are the key operating signals.",
  },
  TSLA: {
    symbol: "TSLA",
    name: "Tesla, Inc.",
    exchange: "NASDAQ",
    industry: "Auto Manufacturers",
    marketCap: "$1.45T",
    ipo: "2010",
    website: "tesla.com",
    tagline: "Electric mobility, energy, and autonomy in one story.",
    description:
      "Tesla designs electric vehicles, energy storage systems, and autonomy software. The stock carries more narrative sensitivity than most mega-caps, making catalyst and risk framing especially important.",
  },
};

const headlines: Record<string, NewsItem[]> = {
  AAPL: [
    ["Apple services momentum keeps the quality bid intact", "Market Ledger", "positive"],
    ["Analysts raise expectations for the next hardware cycle", "Signal Wire", "positive"],
    ["Regulatory scrutiny remains a watch item for the App Store", "The Brief", "caution"],
    ["Consumer demand reads steady heading into the holiday quarter", "Northstar", "neutral"],
    ["Apple expands on-device intelligence across more regions", "Product Desk", "positive"],
  ].map(([headline, source, tone], index) => ({ id: `aapl-${index}`, symbol: "AAPL", headline, source, url: "#", publishedAt: new Date(Date.now() - index * 43 * 60_000).toISOString(), tone: tone as NewsItem["tone"] })),
  NVDA: [
    ["Hyperscaler capex keeps AI compute demand in focus", "Market Ledger", "positive"],
    ["New accelerator roadmap points to faster inference economics", "Chip Notes", "positive"],
    ["Export restrictions add a policy variable to the outlook", "The Brief", "caution"],
    ["Supply chain checks show lead times normalizing", "Northstar", "neutral"],
    ["AI infrastructure basket sees renewed institutional flows", "Signal Wire", "positive"],
  ].map(([headline, source, tone], index) => ({ id: `nvda-${index}`, symbol: "NVDA", headline, source, url: "#", publishedAt: new Date(Date.now() - index * 51 * 60_000).toISOString(), tone: tone as NewsItem["tone"] })),
  MSFT: [
    ["Azure demand remains resilient across enterprise budgets", "Market Ledger", "positive"],
    ["Copilot adoption moves from pilots into recurring workflows", "Product Desk", "positive"],
    ["Microsoft adds new controls for governed AI deployments", "Signal Wire", "neutral"],
    ["Cloud margin debate cools as mix continues to improve", "The Brief", "neutral"],
    ["Teams and security momentum support the platform story", "Northstar", "positive"],
  ].map(([headline, source, tone], index) => ({ id: `msft-${index}`, symbol: "MSFT", headline, source, url: "#", publishedAt: new Date(Date.now() - index * 62 * 60_000).toISOString(), tone: tone as NewsItem["tone"] })),
  TSLA: [
    ["Tesla shares catch a momentum bid ahead of delivery data", "Market Ledger", "positive"],
    ["Autonomy event keeps optionality in the narrative", "Signal Wire", "positive"],
    ["Price cuts remain the key margin risk for the core auto business", "The Brief", "caution"],
    ["Energy storage backlog adds a second growth vector", "Northstar", "positive"],
    ["Options activity points to a wider near-term range", "Flow Desk", "caution"],
  ].map(([headline, source, tone], index) => ({ id: `tsla-${index}`, symbol: "TSLA", headline, source, url: "#", publishedAt: new Date(Date.now() - index * 35 * 60_000).toISOString(), tone: tone as NewsItem["tone"] })),
};

function makeSnapshots(symbol: string, base: number, bias: number): Snapshot[] {
  return Array.from({ length: 28 }, (_, index) => {
    const wave = Math.sin(index / 2.7 + symbol.length) * base * 0.004;
    const trend = ((index - 13) / 13) * base * bias * 0.01;
    const price = Number((base - trend - wave).toFixed(2));
    const ts = new Date(Date.now() - (27 - index) * 15 * 60_000).toISOString();
    return { ts, price };
  });
}

function quoteFor(symbol: string): Quote {
  const source = baseQuotes[symbol] ?? baseQuotes.AAPL;
  const snapshots = makeSnapshots(symbol, source.price, source.pctChange >= 0 ? 1 : -1);
  return { ...source, fetchedAt: now(), snapshots };
}

export const demoSymbols = Object.keys(baseQuotes);

export function getDemoDashboard(): DashboardPayload {
  return { watchlist: demoSymbols.map(quoteFor), market: getMarketStatus(), provider: "demo" };
}

export function getDemoQuote(symbol: string): Quote { return quoteFor(symbol.toUpperCase()); }

export function getDemoDetail(symbol: string): SymbolDetail {
  const upper = symbol.toUpperCase();
  const quote = getDemoQuote(upper);
  const profile = profiles[upper] ?? profiles.AAPL;
  const news = headlines[upper] ?? headlines.AAPL;
  const insight = getDemoInsight(upper, quote);
  return { quote, profile, news, insight };
}

export function getDemoInsight(symbol: string, quote = getDemoQuote(symbol)): Insight {
  const upper = symbol.toUpperCase();
  const stories = headlines[upper] ?? headlines.AAPL;
  const positive = quote.pctChange >= 0;
  const trend = upper === "TSLA" ? "bullish" : upper === "NVDA" ? "neutral" : positive ? "bullish" : "bearish";
  return { symbol: upper, summary: positive ? `${upper} is holding a constructive tape today, with price action leaning above the session midpoint while the news mix stays supportive. The move is real, but it is still early enough to watch follow-through rather than chase the first impulse.` : `${upper} is digesting recent strength with a softer tape today. The pullback is orderly so far, but the next read depends on whether buyers defend the session low as the current catalyst mix develops.`, trend, drivers: [stories[0]?.headline ?? "Fresh sector momentum is supporting attention.", positive ? "Price is trading above the opening print." : "Price is below the opening print and testing short-term support.", "Intraday volatility is elevated enough to keep the signal actionable."], risks: [stories.find((item) => item.tone === "caution")?.headline ?? "A reversal in the current catalyst mix could cool momentum.", "The snapshot history is short and should not be treated as a full cycle view."], confidence: upper === "TSLA" ? 68 : 76, priceAtGen: quote.price, createdAt: now() };
}

export function searchDemo(query: string): SearchResult[] {
  const needle = query.trim().toLowerCase();
  const catalog = demoSymbols.map((symbol) => ({ symbol, name: baseQuotes[symbol].name, exchange: baseQuotes[symbol].exchange, type: "Common Stock" }));
  if (!needle) return catalog;
  return catalog.filter((item) => `${item.symbol} ${item.name}`.toLowerCase().includes(needle));
}

export function getMarketStatus() {
  const nowDate = new Date();
  const nyTime = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", hour: "2-digit", minute: "2-digit", hour12: false, weekday: "short" }).formatToParts(nowDate);
  const parts = Object.fromEntries(nyTime.map((part) => [part.type, part.value]));
  const hour = Number(parts.hour);
  const minute = Number(parts.minute);
  const isWeekday = !["Sat", "Sun"].includes(parts.weekday);
  const isOpen = isWeekday && (hour > 9 || (hour === 9 && minute >= 30)) && hour < 16;
  return { isOpen, label: isOpen ? "Market open" : "Market closed", session: isOpen ? "NYSE core session" : "Next session · 09:30 ET", nextEvent: isOpen ? "Closes at 16:00 ET" : "Opens at 09:30 ET" };
}
