import { boolean, doublePrecision, integer, json, pgTable, text, timestamp, unique, varchar, index } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: varchar("id", { length: 255 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const session = pgTable("session", {
  id: varchar("id", { length: 255 }).primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  ipAddress: varchar("ip_address", { length: 255 }),
  userAgent: text("user_agent"),
  userId: varchar("user_id", { length: 255 }).notNull(),
}, (table) => ({ userIdx: index("session_user_id_idx").on(table.userId) }));

export const account = pgTable("account", {
  id: varchar("id", { length: 255 }).primaryKey(),
  accountId: varchar("account_id", { length: 255 }).notNull(),
  providerId: varchar("provider_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({ userIdx: index("account_user_id_idx").on(table.userId) }));

export const verification = pgTable("verification", {
  id: varchar("id", { length: 255 }).primaryKey(),
  identifier: varchar("identifier", { length: 255 }).notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({ identifierIdx: index("verification_identifier_idx").on(table.identifier) }));

export const symbols = pgTable("symbols", {
  symbol: varchar("symbol", { length: 16 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  exchange: varchar("exchange", { length: 64 }).notNull(),
  logo: varchar("logo", { length: 500 }),
  industry: varchar("industry", { length: 255 }),
});

export const watchlistItems = pgTable("watchlist_items", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  symbol: varchar("symbol", { length: 16 }).notNull(),
  addedAt: timestamp("added_at").notNull().defaultNow(),
}, (table) => ({ ownerSymbolUnique: unique("watchlist_owner_symbol_unique").on(table.userId, table.symbol) }));

export const quoteLatest = pgTable("quote_latest", {
  symbol: varchar("symbol", { length: 16 }).primaryKey(),
  price: doublePrecision("price").notNull(),
  change: doublePrecision("change").notNull(),
  pctChange: doublePrecision("pct_change").notNull(),
  high: doublePrecision("high").notNull(),
  low: doublePrecision("low").notNull(),
  open: doublePrecision("open").notNull(),
  prevClose: doublePrecision("prev_close").notNull(),
  fetchedAt: timestamp("fetched_at").notNull(),
});

export const quoteSnapshots = pgTable("quote_snapshots", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  symbol: varchar("symbol", { length: 16 }).notNull(),
  price: doublePrecision("price").notNull(),
  ts: timestamp("ts").notNull(),
}, (table) => ({ symbolTsIndex: index("quote_snapshots_symbol_ts_idx").on(table.symbol, table.ts) }));

export const newsItems = pgTable("news_items", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  symbol: varchar("symbol", { length: 16 }).notNull(),
  headline: text("headline").notNull(),
  source: varchar("source", { length: 255 }).notNull(),
  url: varchar("url", { length: 1000 }).notNull().unique(),
  publishedAt: timestamp("published_at").notNull(),
});

export const insights = pgTable("insights", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  symbol: varchar("symbol", { length: 16 }).notNull(),
  summary: text("summary").notNull(),
  trend: varchar("trend", { length: 16 }).notNull(),
  drivers: json("drivers").notNull(),
  risks: json("risks").notNull(),
  confidence: doublePrecision("confidence").notNull(),
  priceAtGen: doublePrecision("price_at_gen").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const alerts = pgTable("alerts", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  symbol: varchar("symbol", { length: 16 }).notNull(),
  type: varchar("type", { length: 16 }).notNull(),
  threshold: doublePrecision("threshold").notNull(),
  active: boolean("active").notNull().default(true),
  lastTriggeredAt: timestamp("last_triggered_at"),
});
