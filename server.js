// server.js
import express from "express";
import { createRequestHandler } from "@remix-run/express";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Normaliser l'URL publique AVANT d'importer le build
(function normalizePublicUrl() {
  let url = process.env.SHOPIFY_APP_URL || process.env.HOST || process.env.PUBLIC_URL || "";
  if (url && !/^https?:\/\//i.test(url)) url = `https://${url}`;
  try {
    url = new URL(url).origin;
  } catch {
    console.warn("[server:init] SHOPIFY_APP_URL/HOST/PUBLIC_URL invalide.");
    url = "";
  }
  if (url) {
    process.env.HOST = url;
    if (!process.env.PUBLIC_URL) process.env.PUBLIC_URL = url; // 👈 utile pour @shopify/*
  }
  console.log("[server:init] HOST set to:", process.env.HOST || "(empty)");
})();

// chemins build client
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientBuildPath = path.resolve(__dirname, "build/client");

const app = express();

// Derrière Render/NGINX : indispensable pour que les cookies Secure/Proxy-IP soient corrects
app.set("trust proxy", 1);

// servir /assets/* depuis le build client (Vite)
app.use(
  "/assets",
  express.static(path.join(clientBuildPath, "assets"), {
    immutable: true,
    maxAge: "1y",
  })
);

// servir le reste du build client (manifest, entry, etc.)
app.use(express.static(clientBuildPath, { maxAge: "1h" }));

// (optionnel) dossier public
app.use(express.static("public", { maxAge: "1h" }));

// importer le build serveur APRÈS avoir fixé HOST/PUBLIC_URL
const build = await import("./build/server/index.js");

// passer les requêtes à Remix
app.all(
  "*",
  createRequestHandler({
    build,
    mode: process.env.NODE_ENV,
  })
);

const PORT = process.env.PORT || 10000; // Render fournit PORT
app.listen(PORT, "0.0.0.0", () => {
  console.log(`[server] listening on http://0.0.0.0:${PORT}`);
});
