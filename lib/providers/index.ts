import { getFinnhubNews, getFinnhubProfile, getFinnhubQuote, searchFinnhub } from "@/lib/providers/finnhub";

const isLiveProviderAvailable = () => Boolean(process.env.FINNHUB_API_KEY);

export const providerName = () => (isLiveProviderAvailable() ? "finnhub" : "unconfigured");

export async function searchSymbols(query: string) {
  if (!isLiveProviderAvailable()) throw new Error("FINNHUB_API_KEY is required before searching live symbols");
  return searchFinnhub(query);
}

export async function loadQuote(symbol: string) {
  if (!isLiveProviderAvailable()) throw new Error("FINNHUB_API_KEY is required before loading live quotes");
  return getFinnhubQuote(symbol);
}

export async function loadDetail(symbol: string) {
  if (!isLiveProviderAvailable()) throw new Error("FINNHUB_API_KEY is required before loading live symbol data");
  try {
    const quote = await getFinnhubQuote(symbol);
    const profile = await getFinnhubProfile(symbol);
    const news = await getFinnhubNews(symbol);
    return { quote, profile, news, insight: null };
  } catch (error) {
    throw new Error(`Failed to load detail for ${symbol}: ${error instanceof Error ? error.message : String(error)}`);
  }
}
