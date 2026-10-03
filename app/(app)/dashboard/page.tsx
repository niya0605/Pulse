import { DashboardView } from "@/components/dashboard-view";
import { getDemoInsight } from "@/lib/demo-data";
import { getDashboardData, getSymbolData, isPreviewDemoMode } from "@/lib/server-state";
import type { Insight } from "@/lib/types";

export default async function DashboardPage() {
  const initial = await getDashboardData();
  let leadInsight: Insight | null = null;
  const leadSymbol = initial.watchlist[0]?.symbol;
  if (leadSymbol) {
    if (isPreviewDemoMode()) leadInsight = getDemoInsight(leadSymbol);
    else leadInsight = (await getSymbolData(leadSymbol).catch(() => null))?.insight ?? null;
  }
  return <DashboardView initial={initial} leadInsight={leadInsight} />;
}
