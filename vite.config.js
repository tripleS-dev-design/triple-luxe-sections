import { vitePlugin as remix } from "@remix-run/dev";
import { installGlobals } from "@remix-run/node";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

installGlobals({ nativeFetch: true });

// Workaround SHOPIFY_APP_URL vs HOST (conserve tel quel)
if (
  process.env.HOST &&
  (!process.env.SHOPIFY_APP_URL ||
    process.env.SHOPIFY_APP_URL === process.env.HOST)
) {
  process.env.SHOPIFY_APP_URL = process.env.HOST;
  delete process.env.HOST;
}

const host = new URL(process.env.SHOPIFY_APP_URL || "http://localhost").hostname;

let hmrConfig;
if (host === "localhost") {
  hmrConfig = {
    protocol: "ws",
    host: "localhost",
    port: 64999,
    clientPort: 64999,
  };
} else {
  hmrConfig = {
    protocol: "wss",
    host,
    port: parseInt(process.env.FRONTEND_PORT || "8002", 10),
    clientPort: 443,
  };
}

export default defineConfig({
  server: {
    allowedHosts: [host],
    cors: { preflightContinue: true },
    port: Number(process.env.PORT || 3000),
    hmr: hmrConfig,
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
  build: {
    assetsInlineLimit: 0,
  },
  /**
   * IMPORTANT :
   * - Polaris & polaris-icons doivent être bundle côté SSR
   *   (sinon Node essaie de charger l’ESM brut et la build échoue).
   */
  ssr: {
    noExternal: ["@shopify/polaris", "@shopify/polaris-icons"],
  },
  /**
   * Évite les duplications de React (Invalid hook call).
   */
  resolve: {
    dedupe: ["react", "react-dom"],
  },
  /**
   * Optionnel : prébundle en dev App Bridge.
   * (Inutile d’inclure Polaris ici.)
   */
  optimizeDeps: {
    include: ["@shopify/app-bridge-react"],
  },
});
