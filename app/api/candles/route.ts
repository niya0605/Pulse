import { NextResponse } from "next/server";
import { getFinnhubCandles } from "@/lib/providers/finnhub";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol") ?? "";
  const days = parseInt(searchParams.get("days") ?? "5");

  if (!symbol) return NextResponse.json({ error: "symbol required" }, { status: 400 });

  try {
    const candles = await getFinnhubCandles(symbol, Math.min(days, 365));
    return NextResponse.json({ candles });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch candles", candles: [] }, { status: 503 });
  }
}
