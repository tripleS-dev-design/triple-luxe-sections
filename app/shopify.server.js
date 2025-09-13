// app/shopify.server.js (extrait)
import "@shopify/shopify-app-remix/adapters/node";
import { shopifyApp, ApiVersion, AppDistribution } from "@shopify/shopify-app-remix/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import prisma from "./db.server";

export const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  apiVersion: ApiVersion.January25,
  appUrl: process.env.SHOPIFY_APP_URL, // ← DOIT être défini
  scopes: process.env.SCOPES.split(",").map(s => s.trim()).filter(Boolean),
  authPathPrefix: "/auth",
  sessionStorage: new PrismaSessionStorage(prisma),
  distribution: AppDistribution.AppStore,
  future: { unstable_newEmbeddedAuthStrategy: true, removeRest: true },
});

export const {
  authenticate,
  unauthenticated,
  addDocumentResponseHeaders,
  login,
  registerWebhooks,
  sessionStorage,
} = shopify;
