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
// Choisis ta langue : en/fr (ex. import fr from "@shopify/polaris/locales/fr.json")
import en from "@shopify/polaris/locales/en.json";


// Injecte les feuilles de style
export const links = () => [
  { rel: "preconnect", href: "https://cdn.shopify.com" },
  { rel: "stylesheet", href: "https://cdn.shopify.com/static/fonts/inter/v4/styles.css" },
  { rel: "stylesheet", href: polarisStyles },
];

export default function App() {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        {/* Polaris provider avec i18n obligatoire */}
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
