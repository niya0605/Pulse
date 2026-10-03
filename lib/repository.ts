import { getDb } from "@/db/client";
import * as schema from "@/db/schema";
import { eq, and } from "drizzle-orm";
import type { DashboardPayload, Insight, NewsItem, Profile, Quote, Snapshot, SymbolDetail } from "@/lib/types";

function asIso(value: Date | string) {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function asSnapshots(value: unknown): Snapshot[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try { return JSON.parse(value) as Snapshot[]; } catch { return []; }
  }
  return [];
}

function asStringArray(value: unknown): string[] {
  if (typeof value === "string") {
    try { return JSON.parse(value) as string[]; } catch { return []; }
  }
  return [];
}

export async function persistDetail(detail: SymbolDetail, addToWatchlist = false, userId: string = "default-user") {
  const db = getDb() as any;
  if (!db) return;

  try {
    await db.insert(schema.symbols).values({
      symbol: detail.quote.symbol,
      name: detail.profile.name,
      exchange: detail.profile.exchange,
      industry: detail.profile.industry,
    }).onConflictDoUpdate({
      target: schema.symbols.symbol,
      set: {
        name: detail.profile.name,
        exchange: detail.profile.exchange,
        industry: detail.profile.industry,
      }
    });

    await db.insert(schema.quoteLatest).values({
      symbol: detail.quote.symbol,
      price: detail.quote.price,
      change: detail.quote.change,
      pctChange: detail.quote.pctChange,
      high: detail.quote.high,
      low: detail.quote.low,
      open: detail.quote.open,
      prevClose: detail.quote.prevClose,
      fetchedAt: new Date(detail.quote.fetchedAt),
    }).onConflictDoUpdate({
      target: schema.quoteLatest.symbol,
      set: {
        price: detail.quote.price,
        change: detail.quote.change,
        pctChange: detail.quote.pctChange,
        high: detail.quote.high,
        low: detail.quote.low,
        open: detail.quote.open,
        prevClose: detail.quote.prevClose,
        fetchedAt: new Date(detail.quote.fetchedAt),
      }
    });

    for (const news of detail.news) {
      await db.insert(schema.newsItems).values({
        symbol: news.symbol,
        headline: news.headline,
        source: news.source,
        url: news.url,
        publishedAt: new Date(news.publishedAt),
      }).onConflictDoNothing();
    }

    if (addToWatchlist) {
      await db.insert(schema.watchlistItems).values({
        userId,
        symbol: detail.quote.symbol,
      }).onConflictDoNothing();
    }
  } catch (error) {
    console.error("persistDetail error:", error);
  }
}

export async function persistQuote(quote: Quote) {
  const db = getDb() as any;
  if (!db) return;

  try {
    await db.insert(schema.quoteLatest).values({
      symbol: quote.symbol,
      price: quote.price,
      change: quote.change,
      pctChange: quote.pctChange,
      high: quote.high,
      low: quote.low,
      open: quote.open,
      prevClose: quote.prevClose,
      fetchedAt: new Date(quote.fetchedAt),
    }).onConflictDoUpdate({
      target: schema.quoteLatest.symbol,
      set: {
        price: quote.price,
        change: quote.change,
        pctChange: quote.pctChange,
        high: quote.high,
        low: quote.low,
        open: quote.open,
        prevClose: quote.prevClose,
        fetchedAt: new Date(quote.fetchedAt),
      }
    });

    if (quote.snapshots && quote.snapshots.length > 0) {
      for (const snapshot of quote.snapshots) {
        await db.insert(schema.quoteSnapshots).values({
          symbol: quote.symbol,
          price: snapshot.price,
          ts: new Date(snapshot.ts),
        }).onConflictDoNothing();
      }
    }
  } catch (error) {
    console.error("persistQuote error:", error);
  }
}

export async function getStoredDashboard(market: DashboardPayload["market"], provider: DashboardPayload["provider"], userId: string = "default-user"): Promise<DashboardPayload> {
  const db = getDb() as any;
  if (!db) return { watchlist: [], market, provider };

  try {
    const rows = await db.select({
      symbol: schema.quoteLatest.symbol,
      price: schema.quoteLatest.price,
      change: schema.quoteLatest.change,
      pctChange: schema.quoteLatest.pctChange,
      high: schema.quoteLatest.high,
      low: schema.quoteLatest.low,
      open: schema.quoteLatest.open,
      prevClose: schema.quoteLatest.prevClose,
      fetchedAt: schema.quoteLatest.fetchedAt,
      name: schema.symbols.name,
      exchange: schema.symbols.exchange,
      logo: schema.symbols.logo,
    })
    .from(schema.quoteLatest)
    .innerJoin(schema.symbols, eq(schema.quoteLatest.symbol, schema.symbols.symbol))
    .innerJoin(schema.watchlistItems, and(
      eq(schema.watchlistItems.symbol, schema.quoteLatest.symbol),
      eq(schema.watchlistItems.userId, userId)
    ))
    .orderBy(schema.watchlistItems.addedAt);

    const snapshots = await db.select({
      symbol: schema.quoteSnapshots.symbol,
      ts: schema.quoteSnapshots.ts,
      price: schema.quoteSnapshots.price,
    })
    .from(schema.quoteSnapshots);

    const snapshotsBySymbol = new Map<string, Array<{ ts: string; price: number }>>();
    snapshots.forEach(snap => {
      const key = snap.symbol;
      if (!snapshotsBySymbol.has(key)) snapshotsBySymbol.set(key, []);
      snapshotsBySymbol.get(key)!.push({ ts: asIso(snap.ts), price: snap.price });
    });

    return {
      watchlist: rows.map(row => ({
        symbol: row.symbol,
        name: row.name,
        exchange: row.exchange,
        logo: row.logo ?? undefined,
        price: row.price,
        change: row.change,
        pctChange: row.pctChange,
        high: row.high,
        low: row.low,
        open: row.open,
        prevClose: row.prevClose,
        fetchedAt: asIso(row.fetchedAt),
        snapshots: snapshotsBySymbol.get(row.symbol) ?? [],
      })),
      market,
      provider,
    };
  } catch (error) {
    console.error("getStoredDashboard error:", error);
    return { watchlist: [], market, provider };
  }
}

export async function getStoredDetail(symbol: string): Promise<SymbolDetail | null> {
  const db = getDb() as any;
  if (!db) return null;

  try {
    // @ts-ignore - schema types not available at build time
    const symbolRow = await db.query.symbols.findFirst({
      where: eq(schema.symbols.symbol, symbol),
    });

    // @ts-ignore
    const quoteRow = await db.query.quoteLatest.findFirst({
      where: eq(schema.quoteLatest.symbol, symbol),
    });

    if (!symbolRow || !quoteRow) return null;

    // @ts-ignore
    const newsRows = await db.query.newsItems.findMany({
      where: eq(schema.newsItems.symbol, symbol),
      limit: 5,
      orderBy: (table) => [table.publishedAt],
    });

    // @ts-ignore
    const snapshotRows = await db.query.quoteSnapshots.findMany({
      where: eq(schema.quoteSnapshots.symbol, symbol),
      orderBy: (table) => [table.ts],
    });

    return {
      quote: {
        symbol: quoteRow.symbol,
        name: symbolRow.name,
        exchange: symbolRow.exchange,
        logo: symbolRow.logo ?? undefined,
        price: quoteRow.price,
        change: quoteRow.change,
        pctChange: quoteRow.pctChange,
        high: quoteRow.high,
        low: quoteRow.low,
        open: quoteRow.open,
        prevClose: quoteRow.prevClose,
        fetchedAt: asIso(quoteRow.fetchedAt),
        snapshots: snapshotRows.map(row => ({ ts: asIso(row.ts), price: row.price })),
      },
      profile: {
        symbol,
        name: symbolRow.name,
        exchange: symbolRow.exchange,
        industry: symbolRow.industry ?? "Public company",
        marketCap: "—",
        ipo: "—",
        website: "—",
        tagline: "",
        description: "",
      },
      news: newsRows.map(item => ({
        id: item.id ?? `${item.symbol}-${item.url}`,
        symbol: item.symbol,
        headline: item.headline,
        source: item.source,
        url: item.url,
        publishedAt: asIso(item.publishedAt),
        tone: "neutral" as const,
      })),
      insight: null,
    };
  } catch (error) {
    console.error("getStoredDetail error:", error);
    return null;
  }
}

export async function removeStoredWatchlistItem(symbol: string, userId: string = "default-user") {
  const db = getDb() as any;
  if (!db) return;

  try {
    await db.delete(schema.watchlistItems).where(
      and(
        eq(schema.watchlistItems.userId, userId),
        eq(schema.watchlistItems.symbol, symbol)
      )
    );
  } catch (error) {
    console.error("removeStoredWatchlistItem error:", error);
  }
}

export async function getStoredQuotes(symbols: string[]): Promise<Quote[]> {
  if (!symbols.length) return [];
  const db = getDb() as any;
  if (!db) return [];

  try {
    const rows = await db.select({
      symbol: schema.quoteLatest.symbol,
      price: schema.quoteLatest.price,
      change: schema.quoteLatest.change,
      pctChange: schema.quoteLatest.pctChange,
      high: schema.quoteLatest.high,
      low: schema.quoteLatest.low,
      open: schema.quoteLatest.open,
      prevClose: schema.quoteLatest.prevClose,
      fetchedAt: schema.quoteLatest.fetchedAt,
      name: schema.symbols.name,
      exchange: schema.symbols.exchange,
      logo: schema.symbols.logo,
    })
    .from(schema.quoteLatest)
    .innerJoin(schema.symbols, eq(schema.quoteLatest.symbol, schema.symbols.symbol));

    return rows.map(row => ({
      symbol: row.symbol,
      name: row.name,
      exchange: row.exchange,
      logo: row.logo ?? undefined,
      price: row.price,
      change: row.change,
      pctChange: row.pctChange,
      high: row.high,
      low: row.low,
      open: row.open,
      prevClose: row.prevClose,
      fetchedAt: asIso(row.fetchedAt),
      snapshots: [],
    }));
  } catch (error) {
    console.error("getStoredQuotes error:", error);
    return [];
  }
}
