// Shopify HOST → SHOPIFY_APP_URL workaround (conseillé par Shopify)
if (
  process.env.HOST &&
  (!process.env.SHOPIFY_APP_URL ||
    process.env.SHOPIFY_APP_URL === process.env.HOST)
) {
  process.env.SHOPIFY_APP_URL = process.env.HOST;
  delete process.env.HOST; // évite les conflits côté runtime
}

import { flatRoutes } from "@remix-run/fs-routes";

/** @type {import('@remix-run/dev').AppConfig} */
export default {
  ignoredRouteFiles: ["**/.*"],
  appDirectory: "app",

  // Projet en ESM
  serverModuleFormat: "esm",

  // Vite HMR en dev (optionnel)
  dev: { port: Number(process.env.HMR_SERVER_PORT) || 8002 },

  // ✅ Routes via filesystem (pas besoin de app/routes.ts)
  routes(defineRoutes) {
    return flatRoutes("routes", defineRoutes); // mappe app/routes/*
  },

  future: {
    v3_fetcherPersist: true,
    v3_relativeSplatPath: true,
    v3_throwAbortReason: true,
    v3_singleFetch: true,
  },
};
