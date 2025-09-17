import "@shopify/shopify-app-remix/adapters/node";
import {
  shopifyApp,
  ApiVersion,
  AppDistribution,
} from "@shopify/shopify-app-remix/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import prisma from "./db.server";

/* -----------------------------
   1) Normalise l’URL publique
------------------------------*/
let PUBLIC_URL = process.env.SHOPIFY_APP_URL || "";
if (PUBLIC_URL && !/^https?:\/\//i.test(PUBLIC_URL)) {
  PUBLIC_URL = `https://${PUBLIC_URL}`;
}
try {
  PUBLIC_URL = new URL(PUBLIC_URL).origin;
} catch {
  console.warn(
    "[shopify.server] PUBLIC_URL invalide. Définis SHOPIFY_APP_URL en https."
  );
  PUBLIC_URL = "";
}

// Fournir HOST pour les helpers headers si absent
if (!process.env.HOST || !/^https?:\/\//i.test(process.env.HOST)) {
  process.env.HOST = PUBLIC_URL || process.env.HOST || "";
}

console.log("[shopify.server] Using PUBLIC_URL:", PUBLIC_URL || "(empty)");
console.log("[shopify.server] Effective HOST:", process.env.HOST || "(empty)");

/* -----------------------------
   2) Vérifs ENV minimales
------------------------------*/
const requiredEnv = ["SHOPIFY_API_KEY", "SHOPIFY_API_SECRET", "SCOPES"];
for (const k of requiredEnv) {
  if (!process.env[k] || String(process.env[k]).trim() === "") {
    throw new Error(`[shopify.server] Missing env var: ${k}`);
  }
}
if (!PUBLIC_URL) {
  throw new Error(
    "[shopify.server] SHOPIFY_APP_URL manquant ou invalide (https requis)."
  );
}

/* -----------------------------
   3) Initialisation Shopify
      - ApiVersion alignée 2025-07
      - Auth embarquée
      - Sessions Prisma (DB persistante)
------------------------------*/
export const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  apiVersion: ApiVersion.July25, // aligne avec ton dashboard 2025-07
  appUrl: PUBLIC_URL,
  scopes: String(process.env.SCOPES)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
  authPathPrefix: "/auth",
  sessionStorage: new PrismaSessionStorage(prisma),
  distribution: AppDistribution.AppStore,
  future: {
    unstable_newEmbeddedAuthStrategy: true,
    removeRest: true,
  },
});

/* -----------------------------
   4) Exports utilitaires
------------------------------*/
export const {
  authenticate,
  unauthenticated,
  addDocumentResponseHeaders,
  login,
  registerWebhooks,
  sessionStorage,
} = shopify;

export default shopify;
