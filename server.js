// server.js
import express from "express";
import { createRequestHandler } from "@remix-run/express";

// 0) Fixer HOST AVANT d'importer le build (utilisé par add-response-headers en interne)
(function normalizePublicUrl() {
  let url = process.env.SHOPIFY_APP_URL || process.env.HOST || "";
  if (url && !/^https?:\/\//i.test(url)) url = `https://${url}`;
  try {
    url = new URL(url).origin;
  } catch {
    console.warn("[server:init] SHOPIFY_APP_URL/HOST invalide.");
    url = "";
  }
  process.env.HOST = url;
  console.log("[server:init] HOST set to:", process.env.HOST || "(empty)");
})();

// 1) Import du build APRÈS la normalisation
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
