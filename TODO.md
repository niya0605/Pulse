# Pulse delivery outcomes

## Foundation and design system
Create a Next.js 16 App Router TypeScript application with Tailwind v4, a persistent project structure, responsive layout, and clear loading, empty, and error states.

## Authentication and protected workspace
Provide email/password and Google authentication seams using Better Auth, protect `/dashboard` and symbol detail pages, keep session handling compatible with public HTTPS Preview (`SameSite=None; Secure`), and show an explicit configuration state when required auth provider credentials are not available.

## Watchlist search and dashboard
Provide debounced Finnhub symbol search and add-to-watchlist behavior with unique `(user_id, symbol)` entries; display quote price, change, percent change, high, low, sparkline, market open/closed state, updated-seconds freshness, live refetch behavior every 15 seconds, and a visible demo-data/provider disclosure when real credentials are absent.

## Market-data API and persistence
Implement typed provider boundaries and the requested route handlers: `GET /api/search?q=`, `GET/POST /api/watchlist`, `DELETE /api/watchlist/[symbol]`, `GET /api/quotes?symbols=`, and `GET /api/symbols/[s]`. Persist symbols, watchlist items, latest quotes, quote snapshots, news, and insights with the requested primary keys, indexes, unique constraints, and idempotent upsert behavior.

## Inngest ingestion and reliable retries
Implement `POST /api/inngest`, a market/poll cron every minute during NYSE hours (9:30–16:00 ET, Monday–Friday), distinct-symbol collection across watchlists, one `quote/fetch` event per symbol, a `news/poll` cron every 15 minutes, a `symbol/added` event that fetches quote/profile and generates the first insight, Finnhub calls wrapped in retryable steps, throttling below the free call limit, and event-safe idempotency.

## Metrics and AI insights
Compute 1-day, 5-day, and since-last-insight percent change, SMA, volatility, day high, and day low in application code; send those metrics and the top five headlines through AI SDK `generateObject` with a Zod schema for `{ summary, trend: bullish|bearish|neutral, drivers[], risks[], confidence }`; debounce generation per symbol for five minutes; trigger a refresh after a move greater than 2% since the last insight; provide `POST /api/symbols/[s]/insight` for manual refresh; and label every result `AI-generated, not financial advice`.

## Symbol detail research view
Provide `/dashboard/[symbol]` with an intraday line chart sourced from stored snapshots, company profile, latest news, latest structured insight, trend badge, drivers, risks, confidence, timestamps, refresh state, and responsive two-column research layout.

## Documentation and delivery readiness
Add `.env.example` for the required runtime variables, README architecture diagram and setup instructions, app metadata/logo config, reproducible dependency lockfile, deployment/startup configuration, and V2 extension notes for alerts, daily digest, indicators, SSE, sharing, and CSV export. Validate diagnostics, typecheck, lint, production build, route manifest, API demo mode, and Preview readiness before delivery.
