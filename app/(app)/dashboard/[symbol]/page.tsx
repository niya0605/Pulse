import { notFound } from "next/navigation";
import { DetailView } from "@/components/detail-view";
import { getSymbolData } from "@/lib/server-state";

export default async function SymbolPage({ params }: { params: Promise<{ symbol: string }> }) {
  const { symbol } = await params;
  if (!symbol || symbol.length > 8) notFound();
  const initial = await getSymbolData(symbol.toUpperCase()).catch(() => notFound());
  return <DetailView initial={initial} />;
}
