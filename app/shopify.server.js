// app/shopify.server.js
import dotenv from "dotenv";
dotenv.config();

import "@shopify/shopify-app-remix/adapters/node";
import {
  ApiVersion,
  AppDistribution,
  BillingInterval,
  DeliveryMethod,
  shopifyApp,
} from "@shopify/shopify-app-remix/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import prisma from "./db.server";

// ENV minimales
for (const k of ["SHOPIFY_API_KEY", "SHOPIFY_API_SECRET", "SHOPIFY_APP_URL", "SCOPES"]) {
  if (!process.env[k] || process.env[k].trim() === "") {
    throw new Error(`Missing env var: ${k}`);
  }
}

// ---- Billing: 1 seul plan à 0.99 / 30 jours, sans essai
export const PLAN_HANDLE = "tls-premium-099";
const billing = {
  plans: [
    {
      id: PLAN_HANDLE,
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
  appUrl: process.env.SHOPIFY_APP_URL,
  scopes: process.env.SCOPES.split(",").map((s) => s.trim()).filter(Boolean),
  authPathPrefix: "/auth",
  sessionStorage: new PrismaSessionStorage(prisma),
  distribution: AppDistribution.AppStore,
  billing, // <— important
  webhooks: {
    APP_UNINSTALLED: { deliveryMethod: DeliveryMethod.Http, callbackUrl: "/webhooks/app/uninstalled" },
    APP_SCOPES_UPDATE: { deliveryMethod: DeliveryMethod.Http, callbackUrl: "/webhooks/app/scopes_update" },
    // GDPR (Shopify exige que tes endpoints valident l’HMAC et répondent 401 si invalide)
    CUSTOMERS_DATA_REQUEST: { deliveryMethod: DeliveryMethod.Http, callbackUrl: "/webhooks/compliance" },
    CUSTOMERS_REDACT:       { deliveryMethod: DeliveryMethod.Http, callbackUrl: "/webhooks/compliance" },
    SHOP_REDACT:            { deliveryMethod: DeliveryMethod.Http, callbackUrl: "/webhooks/compliance" },
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
