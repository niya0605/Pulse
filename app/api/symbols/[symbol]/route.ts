import { NextResponse } from "next/server";
import { getSymbolData, getQuoteData } from "@/lib/server-state";

export async function GET(_request: Request, context: { params: Promise<{ symbol: string }> }) {
  const { symbol } = await context.params;
  try {
    const sym = symbol.toUpperCase();
    // Refresh quote to create new snapshots
    await getQuoteData([sym]);
    // Get full detail with updated snapshots
    return NextResponse.json(await getSymbolData(sym));
  }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Symbol detail failed" }, { status: 503 }); }
}
