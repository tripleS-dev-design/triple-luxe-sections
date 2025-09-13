// app/shopify.server.js
import dotenv from "dotenv";
dotenv.config();

import "@shopify/shopify-app-remix/adapters/node";
import {
  shopifyApp,
  ApiVersion,
  AppDistribution,
  BillingInterval, // <- depuis @shopify/shopify-app-remix/server
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

// Handles EXACTS utilisés partout
export const PLAN_HANDLES = {
  monthly: "tls-premium-monthly",
};

// Config billing (format v11.x)
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

  appUrl: process.env.SHOPIFY_APP_URL,
  scopes: process.env.SCOPES.split(",").map((s) => s.trim()).filter(Boolean),
  authPathPrefix: "/auth",

  sessionStorage: new PrismaSessionStorage(prisma),
  distribution: AppDistribution.AppStore,

  billing, // <- important

  future: {
    unstable_newEmbeddedAuthStrategy: true,
    removeRest: true,
  },
});

export default shopify;
export const authenticate = shopify.authenticate;
export const unauthenticated = shopify.unauthenticated;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders; // <- corrige le build
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
export const sessionStorage = shopify.sessionStorage;
export const apiVersion = ApiVersion.January25;
