// app/shopify.server.js
import dotenv from "dotenv";
dotenv.config();

import "@shopify/shopify-app-remix/adapters/node";
import {
  shopifyApp,
  ApiVersion,
  AppDistribution,
  BillingInterval,
  DeliveryMethod,
} from "@shopify/shopify-app-remix/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import prisma from "./db.server";

// ---- Plan unique (même handle que dans le Dashboard) ----
export const PLAN_HANDLES = {
  monthly: "tls-premium-monthly",
};

// ---- Billing: 0.99 USD / 30 jours, sans essai ----
const billing = {
  plans: [
    {
      id: PLAN_HANDLES.monthly,
      amount: 0.99,
      currencyCode: "USD",
      interval: BillingInterval.Every30Days,
      trialDays: 0,
    },
  ],
};

export const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  apiVersion: ApiVersion.January25,

  appUrl: process.env.SHOPIFY_APP_URL, // ex: https://triple-luxe-sections-1.onrender.com
  scopes: process.env.SCOPES.split(",").map((s) => s.trim()).filter(Boolean),
  authPathPrefix: "/auth",

  sessionStorage: new PrismaSessionStorage(prisma),
  distribution: AppDistribution.AppStore,

  billing, // ← important: enregistre le plan côté app

  // (facultatif mais recommandé) webhooks essentiels
  webhooks: {
    APP_UNINSTALLED: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks/app/uninstalled",
    },
    APP_SCOPES_UPDATE: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks/app/scopes_update",
    },
    CUSTOMERS_DATA_REQUEST: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks/customers/data_request",
    },
    CUSTOMERS_REDACT: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks/customers/redact",
    },
    SHOP_REDACT: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks/shop/redact",
    },
  },

  future: {
    unstable_newEmbeddedAuthStrategy: true,
    removeRest: true,
  },
});

export default shopify;
export const {
  authenticate,
  unauthenticated,
  addDocumentResponseHeaders,
  login,
  registerWebhooks,
  sessionStorage,
} = shopify;
export const apiVersion = ApiVersion.January25;
