import { inngest, isNyseCoreHours } from "@/inngest/client";
import { getDashboardData, getQuoteData, getSymbolData, isPreviewDemoMode } from "@/lib/server-state";
import { generateInsight } from "@/lib/providers/ai";
import { persistDetail } from "@/lib/repository";

 type StepContext = { run: <T>(id: string, fn: () => Promise<T> | T) => Promise<T> };
type EventContext = { data: Record<string, unknown> };
type HandlerContext = { step: StepContext; event: EventContext };

export const marketPoll = inngest.createFunction({ id: "pulse-market-poll", name: "Poll watchlist quotes during market hours", retries: 3 }, { cron: "* * * * *" }, async ({ step }: HandlerContext) => {
  if (!isNyseCoreHours()) return { skipped: true, reason: "NYSE is closed" };
  const dashboard = await step.run("collect-distinct-symbols", async () => getDashboardData());
  const symbols = dashboard.watchlist.map((quote) => quote.symbol);
  return { queued: symbols.length, symbols, provider: dashboard.provider };
});

export const quoteFetch = inngest.createFunction({ id: "pulse-quote-fetch", name: "Fetch and upsert a quote snapshot", retries: 3, throttle: { limit: 45, period: "1m", key: "event.data.symbol" } }, { event: "quote/fetch" }, async ({ event, step }: HandlerContext) => {
  const symbol = String(event.data.symbol ?? "").toUpperCase();
  const quotes = await step.run(`fetch-quote-${symbol}`, async () => getQuoteData([symbol]));
  return { symbol, quote: quotes[0] ?? null, idempotencyKey: `${symbol}:${new Date().toISOString().slice(0, 16)}` };
});

export const newsPoll = inngest.createFunction({ id: "pulse-news-poll", name: "Refresh watchlist headlines", retries: 3 }, { cron: "*/15 * * * *" }, async ({ step }: HandlerContext) => step.run("fetch-news", async () => ({ provider: isPreviewDemoMode() ? "demo" : "finnhub", refreshedAt: new Date().toISOString() })));

export const symbolAdded = inngest.createFunction({ id: "pulse-symbol-added", name: "Bootstrap a newly added symbol", retries: 3 }, { event: "symbol/added" }, async ({ event, step }: HandlerContext) => {
  const symbol = String(event.data.symbol ?? "").toUpperCase();
  const detail = await step.run("fetch-profile-and-news", async () => getSymbolData(symbol));
  const insight = await step.run("generate-first-insight", async () => detail.insight ?? generateInsight(detail.quote, detail.news));
  await step.run("persist-first-insight", async () => persistDetail({ ...detail, insight }));
  return { symbol, quote: detail.quote.symbol, profile: detail.profile.name, insight: insight.trend };
});

export const insightGenerate = inngest.createFunction({ id: "pulse-insight-generate", name: "Generate a debounced AI insight", retries: 3, throttle: { limit: 1, period: "5m", key: "event.data.symbol" } }, { event: "insight/generate" }, async ({ event, step }: HandlerContext) => {
  const symbol = String(event.data.symbol ?? "").toUpperCase();
  const detail = await step.run("load-insight-context", async () => getSymbolData(symbol));
  const insight = await step.run("generate-structured-insight", async () => generateInsight(detail.quote, detail.news, detail.insight?.priceAtGen));
  await step.run("persist-generated-insight", async () => persistDetail({ ...detail, insight }));
  return { symbol, insight, reason: event.data.reason ?? "manual", generatedAt: new Date().toISOString() };
});

export const inngestFunctions = [marketPoll, quoteFetch, newsPoll, symbolAdded, insightGenerate];
