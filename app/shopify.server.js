// app/shopify.server.js
import "@shopify/shopify-app-remix/adapters/node";
import {
  ApiVersion,
  AppDistribution,
  BillingInterval,
  shopifyApp,
} from "@shopify/shopify-app-remix/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import prisma from "./db.server";

/**
 * ✔️ Handles de plans — utilise-les dans /billing.activate?plan=<handle>
 *    et dans billing.require({ plans: [PLAN_HANDLES.monthly, PLAN_HANDLES.annual] })
 */
export const PLAN_HANDLES = {
  monthly: "tls-premium-monthly",
  annual:  "tls-premium-annual",
};


const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
  apiVersion: ApiVersion.January25,
  scopes: (process.env.SCOPES || "").split(",").filter(Boolean),
  appUrl: process.env.SHOPIFY_APP_URL || "",
  authPathPrefix: "/auth",
  sessionStorage: new PrismaSessionStorage(prisma),
  distribution: AppDistribution.AppStore,

  /**
   * 💳 Billing — 1 plan mensuel + 1 plan annuel
   * - Tu peux ajouter trialDays si tu veux un essai gratuit.
   * - Les handles doivent correspondre à ceux utilisés dans tes routes.
   */
  billing: {
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
  },

  future: {
    unstable_newEmbeddedAuthStrategy: true,
    removeRest: true,
  },

  // (optionnel) si tu utilises un domaine custom d'App Bridge
  ...(process.env.SHOP_CUSTOM_DOMAIN
    ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] }
    : {}),
});

export default shopify;
export const apiVersion = ApiVersion.January25;

// Exports utilitaires (comme dans ton fichier d’origine)
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const authenticate = shopify.authenticate;
export const unauthenticated = shopify.unauthenticated;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
export const sessionStorage = shopify.sessionStorage;
