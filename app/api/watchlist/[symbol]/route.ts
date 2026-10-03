import { NextResponse } from "next/server";
import { removeFromWatchlist } from "@/lib/server-state";

export async function DELETE(_request: Request, context: { params: Promise<{ symbol: string }> }) {
  const { symbol } = await context.params;
  await removeFromWatchlist(symbol);
  return NextResponse.json({ ok: true, symbol: symbol.toUpperCase() });
}
