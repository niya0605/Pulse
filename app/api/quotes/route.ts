import { NextResponse } from "next/server";
import { getQuoteData } from "@/lib/server-state";

export async function GET(request: Request) {
  const symbols = new URL(request.url).searchParams.get("symbols")?.split(",").map((value) => value.trim().toUpperCase()).filter(Boolean) ?? [];
  try { return NextResponse.json({ quotes: await getQuoteData(symbols) }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Quote refresh failed" }, { status: 503 }); }
}
