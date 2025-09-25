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

// Sanity ENV
const requiredEnv = ["SHOPIFY_API_KEY", "SHOPIFY_API_SECRET", "SHOPIFY_APP_URL", "SCOPES"];
for (const k of requiredEnv) {
  if (!process.env[k] || process.env[k].trim() === "") {
    throw new Error(`Missing env var: ${k}`);
  }
}

export const PLAN_HANDLE = "Free";
const billing = {
  plans: [
    { id: PLAN_HANDLE, amount: 0, currencyCode: "USD", interval: BillingInterval.Every30Days, trialDays: 0 },
  ],
};

export const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  apiVersion: ApiVersion.January25,
  appUrl: process.env.SHOPIFY_APP_URL,
  scopes: process.env.SCOPES.split(",").map((s) => s.trim()).filter(Boolean),

  isEmbeddedApp: true,
  authPathPrefix: "/auth",
  sessionStorage: new PrismaSessionStorage(prisma),
  distribution: AppDistribution.AppStore,
  billing,

  webhooks: {
    APP_UNINSTALLED:      { deliveryMethod: DeliveryMethod.Http, callbackUrl: "/webhooks/app/uninstalled" },
    APP_SCOPES_UPDATE:    { deliveryMethod: DeliveryMethod.Http, callbackUrl: "/webhooks/app/scopes_update" },
    CUSTOMERS_DATA_REQUEST:{ deliveryMethod: DeliveryMethod.Http, callbackUrl: "/webhooks/customers/data_request" },
    CUSTOMERS_REDACT:     { deliveryMethod: DeliveryMethod.Http, callbackUrl: "/webhooks/customers/redact" },
    SHOP_REDACT:          { deliveryMethod: DeliveryMethod.Http, callbackUrl: "/webhooks/shop/redact" },
  },

  future: {
    unstable_newEmbeddedAuthStrategy: true, // cookie-less
    removeRest: true,
  },
});

export const authenticate = shopify.authenticate;
export const registerWebhooks = shopify.registerWebhooks;
