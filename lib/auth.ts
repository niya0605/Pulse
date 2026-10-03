import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getDb } from "@/db/client";
import * as schema from "@/db/schema";

const baseURL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const db = getDb();

export const auth = betterAuth({
  baseURL,
  secret: process.env.BETTER_AUTH_SECRET ?? "pY3K9mQ7vB2sJ4xN6cR8tW1zL5fH0dG3",
  ...(db ? { database: drizzleAdapter(db, { provider: "pg", schema }) } : {}),
  emailAndPassword: { enabled: true },
  socialProviders: process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? { google: { clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET } }
    : undefined,
  advanced: {
    cookies: {
      session_token: { attributes: { sameSite: "none", secure: true } },
    },
  },
});

export const sessionCookieName = "webdev_app_session";
