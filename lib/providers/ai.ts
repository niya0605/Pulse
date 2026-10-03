import { createGroq } from "@ai-sdk/groq";
import { generateObject } from "ai";
import { z } from "zod";
import { buildInsightMetrics } from "@/lib/metrics";
import type { Insight, NewsItem, Quote } from "@/lib/types";
import { getDemoInsight } from "@/lib/demo-data";

export const insightSchema = z.object({
  summary: z.string().min(20),
  trend: z.enum(["bullish", "bearish", "neutral"]),
  drivers: z.array(z.string()).min(2).max(5),
  risks: z.array(z.string()).min(1).max(4),
  confidence: z.number().min(0).max(100),
});

export async function generateInsight(quote: Quote, headlines: NewsItem[], lastInsightPrice?: number): Promise<Insight> {
  if (!process.env.GROQ_API_KEY) {
    if (process.env.PULSE_DEMO_MODE === "true") return getDemoInsight(quote.symbol, quote);
    throw new Error("GROQ_API_KEY is required before generating an AI insight");
  }
  const metrics = buildInsightMetrics(quote.snapshots, quote.price, lastInsightPrice);
  const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });
  const result = await generateObject({
    model: groq("openai/gpt-oss-120b"),
    schema: insightSchema,
    system: "You are a careful market research assistant. Be concise, distinguish facts from interpretation, and never give financial advice.",
    prompt: JSON.stringify({ symbol: quote.symbol, quote, metrics, headlines: headlines.slice(0, 5).map((item) => item.headline) }),
  });
  return { symbol: quote.symbol, ...result.object, priceAtGen: quote.price, createdAt: new Date().toISOString() };
}
