// app/root.jsx
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  LiveReload,
} from "@remix-run/react";

import { AppProvider } from "@shopify/polaris";
import en from "@shopify/polaris/locales/en.json";

// 👉 Importe l'URL de la feuille de style Polaris pour Remix (Vite)
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";

export const links = () => [
  { rel: "preconnect", href: "https://cdn.shopify.com" },
  { rel: "stylesheet", href: "https://cdn.shopify.com/static/fonts/inter/v4/styles.css" },
  { rel: "stylesheet", href: polarisStyles }, // ✅ maintenant défini
];

export default function App() {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        {/* Un seul Polaris AppProvider global suffit */}
        <AppProvider i18n={en}>
          <Outlet />
        </AppProvider>

        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
