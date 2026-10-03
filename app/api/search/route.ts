import { NextResponse } from "next/server";
import { searchSymbols } from "@/lib/providers";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q") ?? "";
  if (!query.trim()) return NextResponse.json({ results: [] });
  try {
    return NextResponse.json({ results: await searchSymbols(query), cachedFor: "1h" });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Search failed" }, { status: 502 });
  }
}
