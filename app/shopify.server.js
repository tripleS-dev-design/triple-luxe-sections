// app/shopify.server.js
import "@shopify/shopify-app-remix/adapters/node";
import {
  shopifyApp,
  ApiVersion,
  AppDistribution,
  BillingInterval,   // <- prends-le d'ici, pas de @shopify/shopify-api
} from "@shopify/shopify-app-remix/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import prisma from "./db.server";

export const PLAN_HANDLES = {
  monthly: "tls-premium-monthly",
  annual: "tls-premium-annual",
};

export const billing = {
  [PLAN_HANDLES.monthly]: {
    amount: 4.99,
    currencyCode: "USD",
    interval: BillingInterval.Every30Days,
    trialDays: 14,
  },
  [PLAN_HANDLES.annual]: {
    amount: 39.99,
    currencyCode: "USD",
    interval: BillingInterval.Annual,
    trialDays: 14,
  },
};

export const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  apiVersion: ApiVersion.January25,
  appUrl: process.env.SHOPIFY_APP_URL,
  scopes: process.env.SCOPES.split(",").map(s => s.trim()).filter(Boolean),
  authPathPrefix: "/auth",
  sessionStorage: new PrismaSessionStorage(prisma),
  distribution: AppDistribution.AppStore,
  billing, // <-- objet mappé par handles
  future: { unstable_newEmbeddedAuthStrategy: true, removeRest: true },
});

export const authenticate = shopify.authenticate;

