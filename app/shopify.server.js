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

// Vérifs ENV minimales
const requiredEnv = ["SHOPIFY_API_KEY", "SHOPIFY_API_SECRET", "SHOPIFY_APP_URL", "SCOPES"];
for (const k of requiredEnv) {
  if (!process.env[k] || process.env[k].trim() === "") {
    throw new Error(`Missing env var: ${k}`);
  }
}

/** ===== Billing : 1 seul plan à 0.99 USD / 30 jours ===== **/
export const PLAN_HANDLE = "tls-premium-099";

const billing = {
  plans: [
    {
      id: PLAN_HANDLE,           // <= handle utilisé pour le guard
      amount: 0.99,
      currencyCode: "USD",
      interval: BillingInterval.Every30Days,
      trialDays: 0,              // mets 0 pour aucun essai
    },
  ],
};

export const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  apiVersion: ApiVersion.January25,

  appUrl: process.env.SHOPIFY_APP_URL,
  scopes: process.env.SCOPES.split(",").map((s) => s.trim()).filter(Boolean),
  authPathPrefix: "/auth",

  sessionStorage: new PrismaSessionStorage(prisma),
  distribution: AppDistribution.AppStore,

  billing, // <= important : injecte le plan

  // (optionnel) webhooks utiles
  webhooks: {
    APP_UNINSTALLED: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks/app/uninstalled",
    },
    APP_SCOPES_UPDATE: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks/app/scopes_update",
    },
    // GDPR obligatoires
    CUSTOMERS_DATA_REQUEST: { deliveryMethod: DeliveryMethod.Http, callbackUrl: "/webhooks/customers/data_request" },
    CUSTOMERS_REDACT:       { deliveryMethod: DeliveryMethod.Http, callbackUrl: "/webhooks/customers/redact" },
    SHOP_REDACT:            { deliveryMethod: DeliveryMethod.Http, callbackUrl: "/webhooks/shop/redact" },
  },

  future: {
    unstable_newEmbeddedAuthStrategy: true,
    removeRest: true,
  },
});

export default shopify;
export const authenticate = shopify.authenticate;
export const unauthenticated = shopify.unauthenticated;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
export const sessionStorage = shopify.sessionStorage;
export const apiVersion = ApiVersion.January25;
