// server.js
import express from "express";
import { createRequestHandler } from "@remix-run/express";

// 0) Définir HOST avant de charger le build Remix (ce que lit add-response-headers)
(function normalizePublicUrl() {
  let url = process.env.SHOPIFY_APP_URL || process.env.HOST || "";
  if (url && !/^https?:\/\//i.test(url)) url = `https://${url}`;
  try {
    url = new URL(url).origin; // garde seulement l'origin propre
  } catch {
    console.warn("[server:init] SHOPIFY_APP_URL/HOST invalide.");
    url = "";
  }
  process.env.HOST = url; // <- le helper @shopify lit ça
  console.log("[server:init] HOST set to:", process.env.HOST || "(empty)");
})();

// 1) Charger le build APRÈS avoir fixé HOST
const build = await import("./build/server/index.js");

const app = express();
app.set("trust proxy", true);
app.use(express.static("public"));

app.all(
  "*",
  createRequestHandler({
    build,
    mode: process.env.NODE_ENV,
  })
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`[server] listening on http://0.0.0.0:${PORT}`);
});
