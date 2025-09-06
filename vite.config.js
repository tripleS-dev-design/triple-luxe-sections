import { vitePlugin as remix } from "@remix-run/dev";
import { installGlobals } from "@remix-run/node";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

installGlobals({ nativeFetch: true });

// HOST → SHOPIFY_APP_URL (workaround Shopify CLI)
if (
  process.env.HOST &&
  (!process.env.SHOPIFY_APP_URL || process.env.SHOPIFY_APP_URL === process.env.HOST)
) {
  process.env.SHOPIFY_APP_URL = process.env.HOST;
  delete process.env.HOST;
}

const host = new URL(process.env.SHOPIFY_APP_URL || "http://localhost").hostname;
const isLocal = host === "localhost";
const hmrConfig = isLocal
  ? { protocol: "ws", host: "localhost", port: 64999, clientPort: 64999 }
  : { protocol: "wss", host, port: Number(process.env.FRONTEND_PORT) || 8002, clientPort: 443 };

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
    target: "es2020",
  },
  resolve: {
    // évite les doubles copies de React
    dedupe: ["react", "react-dom"],
  },
  ssr: {
    // ✅ clé : bundle Polaris côté SSR
    noExternal: ["@shopify/polaris", "@shopify/polaris-icons"],
  },
  optimizeDeps: {
    include: ["@shopify/app-bridge-react", "@shopify/polaris", "@shopify/polaris-icons"],
  },
});
