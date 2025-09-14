// server.js
import express from "express";
import { createRequestHandler } from "@remix-run/express";
import path from "node:path";
import { fileURLToPath } from "node:url";

// 0) Fixer HOST AVANT d'importer le build (Shopify headers)
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

// 1) Résolution des chemins du build client
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientBuildPath = path.resolve(__dirname, "build/client");

const app = express();
app.set("trust proxy", true);

// 2) Servir les assets de Remix (doivent matcher /assets/*)
app.use(
  "/assets",
  express.static(path.join(clientBuildPath, "assets"), {
    immutable: true,
    maxAge: "1y",
  })
);

// 3) (optionnel) Servir le reste du build client (manifest, entry, etc.)
app.use(express.static(clientBuildPath, { maxAge: "1h" }));

// 4) (optionnel) Dossier public si tu en as un
app.use(express.static("public", { maxAge: "1h" }));

// 5) Import du build APRÈS la normalisation
const build = await import("./build/server/index.js");

// 6) Toutes les autres routes → Remix
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
