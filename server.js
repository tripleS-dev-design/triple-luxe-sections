// server.js
import express from "express";
import { createRequestHandler } from "@remix-run/express";
import path from "node:path";
import { fileURLToPath } from "node:url";

// ——— Normaliser l’URL publique AVANT d’importer le build ———
(function normalizePublicUrl() {
  let url =
    process.env.SHOPIFY_APP_URL ||
    process.env.HOST ||
    process.env.PUBLIC_URL ||
    "";

  if (url && !/^https?:\/\//i.test(url)) url = `https://${url}`;
  try {
    url = new URL(url).origin;
  } catch {
    console.warn("[server:init] SHOPIFY_APP_URL/HOST/PUBLIC_URL invalide.");
    url = "";
  }

  if (url) {
    process.env.HOST = url;
    if (!process.env.PUBLIC_URL) process.env.PUBLIC_URL = url;
  }
  console.log("[server:init] HOST set to:", process.env.HOST || "(empty)");
})();

// ——— Chemins build client ———
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientBuildPath = path.resolve(__dirname, "build/client");

const app = express();
app.set("trust proxy", 1); // derrière Render/NGINX

// ✅ Health check pour Render (configure Health Check Path = /healthz)
app.get("/healthz", (_req, res) => res.type("text").send("ok"));

// (optionnel) Page neutre sur "/" pour éviter un 410 hors iframe
app.get("/", (_req, res) => {
  res
    .type("html")
    .send(`<!doctype html>
<meta charset="utf-8" />
<title>Triple Luxe Sections</title>
<p>App is running.</p>
<p><a href="/auth/login">Open in Shopify</a></p>`);
});

// ——— Fichiers statiques du build client (Vite) ———
app.use(
  "/assets",
  express.static(path.join(clientBuildPath, "assets"), {
    immutable: true,
    maxAge: "1y",
  })
);
app.use(express.static(clientBuildPath, { maxAge: "1h" }));
app.use(express.static("public", { maxAge: "1h" }));

// ——— Importer le build serveur APRÈS avoir fixé HOST/PUBLIC_URL ———
const build = await import("./build/server/index.js");

// ——— Remix handler ———
app.all(
  "*",
  createRequestHandler({
    build,
    mode: process.env.NODE_ENV,
  })
);

// ——— Lancement ———
const PORT = process.env.PORT || 10000; // Render fournit PORT
app.listen(PORT, "0.0.0.0", () => {
  console.log(`[server] listening on http://0.0.0.0:${PORT}`);
});
