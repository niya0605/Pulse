import { NextResponse } from "next/server";
import { addToWatchlist, getDashboardData } from "@/lib/server-state";

export async function GET() { return NextResponse.json(await getDashboardData()); }

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const symbol = String(body.symbol ?? "").trim().toUpperCase();
  if (!symbol) return NextResponse.json({ error: "symbol is required" }, { status: 400 });
  try { return NextResponse.json({ ok: true, quote: await addToWatchlist(symbol), event: "symbol/added" }, { status: 201 }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Could not add symbol" }, { status: 503 }); }
}
