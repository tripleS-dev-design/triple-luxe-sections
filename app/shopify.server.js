import "@shopify/shopify-app-remix/adapters/node";
import {
  ApiVersion,
  AppDistribution,
  BillingInterval,
} from "@shopify/shopify-api";
import { shopifyApp } from "@shopify/shopify-app-remix/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import prisma from "./db.server";

export const PLAN_HANDLES = {
  monthly: "tls-premium-monthly",
  annual: "tls-premium-annual",
};

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
  apiVersion: ApiVersion.January25,
  scopes: (process.env.SCOPES || "").split(","),
  appUrl: process.env.SHOPIFY_APP_URL || "",
  authPathPrefix: "/auth",
  sessionStorage: new PrismaSessionStorage(prisma),
  distribution: AppDistribution.AppStore,
  future: {
    unstable_newEmbeddedAuthStrategy: true,
    removeRest: true,
  },
  ...(process.env.SHOP_CUSTOM_DOMAIN
    ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] }
    : {}),

  // ✅ Plans avec essai 14 jours
  billing: {
    // on ne force pas ici; on le gère via /app/_index
    required: false,
    plans: [
      {
        plan: PLAN_HANDLES.monthly,
        price: { amount: 4.99, currencyCode: "EUR" },
        interval: BillingInterval.Every30Days,
        trialDays: 14,
        usageTerms: "Triple-Luxe-Sections monthly",
      },
      {
        plan: PLAN_HANDLES.annual,
        price: { amount: 39.99, currencyCode: "EUR" },
        interval: BillingInterval.Annual,
        trialDays: 14,
        usageTerms: "Triple-Luxe-Sections annual",
      },
    ],
  },
});

export default shopify;
export const apiVersion = ApiVersion.January25;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const authenticate = shopify.authenticate;
export const unauthenticated = shopify.unauthenticated;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
export const sessionStorage = shopify.sessionStorage;
export { PLAN_HANDLES as PLAN_IDS };
