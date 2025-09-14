// app/shopify.server.js
import "@shopify/shopify-app-remix/adapters/node";
import { shopifyApp, ApiVersion, AppDistribution } from "@shopify/shopify-app-remix/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import prisma from "./db.server";

// ──────────────────────────────────────────────
// 1) Normalisation de l’URL publique
//    (HOST est utilisé par addDocumentResponseHeaders)
// ──────────────────────────────────────────────
let PUBLIC_URL = process.env.SHOPIFY_APP_URL || "";

if (PUBLIC_URL && !PUBLIC_URL.startsWith("http")) {
  PUBLIC_URL = `https://${PUBLIC_URL}`;
}
try {
  PUBLIC_URL = new URL(PUBLIC_URL).origin;
} catch {
  console.warn(
    "[shopify.server] PUBLIC_URL invalide. Définis SHOPIFY_APP_URL avec une URL https valide."
  );
  PUBLIC_URL = "";
}

// Injecter un HOST correct dans le process si absent
if (!process.env.HOST || !process.env.HOST.startsWith("http")) {
  process.env.HOST = PUBLIC_URL;
}

console.log("[shopify.server] Using PUBLIC_URL:", PUBLIC_URL);
console.log("[shopify.server] Effective HOST:", process.env.HOST);

// ──────────────────────────────────────────────
// 2) Vérification des variables ENV minimales
// ──────────────────────────────────────────────
const requiredEnv = ["SHOPIFY_API_KEY", "SHOPIFY_API_SECRET", "SCOPES"];
for (const k of requiredEnv) {
  if (!process.env[k] || process.env[k].trim() === "") {
    throw new Error(`[shopify.server] Missing env var: ${k}`);
  }
}

// ──────────────────────────────────────────────
// 3) Initialisation de l’app Shopify
//    - Pas d’objet billing ici → Managed Pricing
// ──────────────────────────────────────────────
export const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  apiVersion: ApiVersion.January25,

  appUrl: PUBLIC_URL,
  scopes: process.env.SCOPES.split(",").map((s) => s.trim()).filter(Boolean),
  authPathPrefix: "/auth",
  sessionStorage: new PrismaSessionStorage(prisma),
  distribution: AppDistribution.AppStore,

  future: {
    unstable_newEmbeddedAuthStrategy: true,
    removeRest: true,
  },
});

// ──────────────────────────────────────────────
// 4) Exports habituels
// ──────────────────────────────────────────────
export const {
  authenticate,
  unauthenticated,
  addDocumentResponseHeaders,
  login,
  registerWebhooks,
  sessionStorage,
} = shopify;

export default shopify;
