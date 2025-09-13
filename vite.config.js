// vite.config.js
import { vitePlugin as remix } from "@remix-run/dev";
import { installGlobals } from "@remix-run/node";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

installGlobals({ nativeFetch: true });

// Remap HOST -> SHOPIFY_APP_URL (hack CLI)
if (
  process.env.HOST &&
  (!process.env.SHOPIFY_APP_URL || process.env.SHOPIFY_APP_URL === process.env.HOST)
) {
  process.env.SHOPIFY_APP_URL = process.env.HOST;
  delete process.env.HOST;
}

const appUrl = process.env.SHOPIFY_APP_URL || "http://localhost:3000";
const { hostname: host } = new URL(appUrl);

let hmrConfig;
if (host === "localhost") {
  hmrConfig = { protocol: "ws", host: "localhost", port: 64999, clientPort: 64999 };
} else {
  hmrConfig = { protocol: "wss", host, port: parseInt(process.env.FRONTEND_PORT) || 8002, clientPort: 443 };
}

export default defineConfig({
  server: {
    // ✅ autorise tous les hosts (utile avec *.trycloudflare.com)
    allowedHosts: true,
    cors: { origin: true, preflightContinue: true },
    port: Number(process.env.PORT || 3000),
    hmr: hmrConfig,
    // (optionnel) cache l’overlay rouge si Vite râle
    // hmr: { ...hmrConfig, overlay: false },
    fs: { allow: ["app", "node_modules"] },
  },
  plugins: [
    remix({
      ignoredRouteFiles: ["**/.*"],
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
        v3_lazyRouteDiscovery: true,
        v3_singleFetch: false,
        v3_routeConfig: true,
      },
    }),
    tsconfigPaths(),
  ],
  build: { assetsInlineLimit: 0 },
  optimizeDeps: {
    include: ["@shopify/app-bridge-react", "@shopify/polaris", "@shopify/polaris-icons"],
    // en cas d’erreur Vite “dep optimizer”, on peut exclure ici
    // exclude: [],
  },
});
