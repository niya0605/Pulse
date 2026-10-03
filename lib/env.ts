export const env = {
  databaseUrl: process.env.DATABASE_URL,
  finnhubApiKey: process.env.FINNHUB_API_KEY,
  groqApiKey: process.env.GROQ_API_KEY,
  inngestEventKey: process.env.INNGEST_EVENT_KEY,
  inngestSigningKey: process.env.INNGEST_SIGNING_KEY,
  betterAuthSecret: process.env.BETTER_AUTH_SECRET,
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
};

export function missingProviderKeys() {
  return [
    !env.finnhubApiKey && "FINNHUB_API_KEY",
    !env.groqApiKey && "GROQ_API_KEY",
    !env.databaseUrl && "DATABASE_URL",
  ].filter(Boolean) as string[];
}
