// app/shopify.server.js
import "@shopify/shopify-app-remix/adapters/node";
import { shopifyApp, ApiVersion, AppDistribution } from "@shopify/shopify-app-remix/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import prisma from "./db.server";

// ─────────────────────────────────────────────────────────────
// 1) Normalisation PUBLIC_URL/HOST pour éviter "Invalid URL"
//    (le helper addDocumentResponseHeaders lit process.env.HOST)
// ─────────────────────────────────────────────────────────────
let PUBLIC_URL =
  process.env.SHOPIFY_APP_URL ||
  process.env.HOST ||
  "";

if (PUBLIC_URL && !PUBLIC_URL.startsWith("http")) {
  PUBLIC_URL = `https://${PUBLIC_URL}`;
}
try {
  PUBLIC_URL = new URL(PUBLIC_URL).origin; // valide et garde l'origin propre
} catch {
  console.warn(
    "[shopify.server] PUBLIC_URL invalide. Définis SHOPIFY_APP_URL (ou HOST) avec une URL https valide."
  );
  PUBLIC_URL = "";
}

// Force HOST pour le helper des headers si absent/mal formé
if (!process.env.HOST || !process.env.HOST.startsWith("http")) {
  process.env.HOST = PUBLIC_URL; // évite le crash add-response-headers.ts
}

console.log("[shopify.server] Using PUBLIC_URL:", PUBLIC_URL);
console.log("[shopify.server] Effective HOST:", process.env.HOST);

// ─────────────────────────────────────────────────────────────
// 2) Vérifs ENV minimales (clé/secret/URL/scopes)
// ─────────────────────────────────────────────────────────────
const requiredEnv = ["SHOPIFY_API_KEY", "SHOPIFY_API_SECRET", "SCOPES"];
for (const k of requiredEnv) {
  if (!process.env[k] || process.env[k].trim() === "") {
    throw new Error(`[shopify.server] Missing env var: ${k}`);
  }
}

// ─────────────────────────────────────────────────────────────
// 3) Initialisation Shopify app
//    - Managed Pricing : pas d'objet "billing" ici
//    - Si un jour tu reviens à la facturation classique, tu
//      pourras réintroduire "billing" (plans) sans toucher au reste.
// ─────────────────────────────────────────────────────────────
export const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  apiVersion: ApiVersion.January25,

  // IMPORTANT : même si le SDK utilise PUBLIC_URL pour les headers,
  // on garde appUrl aligné (utile pour divers helpers/callbacks)
  appUrl: PUBLIC_URL,

  scopes: process.env.SCOPES.split(",").map((s) => s.trim()).filter(Boolean),
  authPathPrefix: "/auth",
  sessionStorage: new PrismaSessionStorage(prisma),
  distribution: AppDistribution.AppStore,

  // Pas d'objet "billing" ici → Managed Pricing (plans gérés depuis le Partner)
  // Si tu repasses en "classic billing", tu pourras ajouter :
  // billing: {
  //   "premium-monthly": { amount: 0.99, currencyCode: "USD", interval: BillingInterval.Every30Days },
  // },

  future: {
    unstable_newEmbeddedAuthStrategy: true,
    removeRest: true,
  },
});

// Exports habituels
export const {
  authenticate,
  unauthenticated,
  addDocumentResponseHeaders,
  login,
  registerWebhooks,
  sessionStorage,
} = shopify;

export default shopify;
