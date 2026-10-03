import { NextResponse } from "next/server";
import { generateInsight } from "@/lib/providers/ai";
import { getSymbolData } from "@/lib/server-state";
import { persistDetail } from "@/lib/repository";

export async function POST(_request: Request, context: { params: Promise<{ symbol: string }> }) {
  const { symbol } = await context.params;
  try {
    const detail = await getSymbolData(symbol.toUpperCase());
    const insight = await generateInsight(detail.quote, detail.news, detail.insight?.priceAtGen);
    await persistDetail({ ...detail, insight });
    return NextResponse.json({ insight, event: "insight/generate", debouncedFor: "5m" });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Insight generation failed" }, { status: 503 }); }
}
