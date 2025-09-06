// app/root.jsx — version JS (sans TypeScript), compatible Vite/Remix
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  LiveReload,
} from "@remix-run/react";

// Polaris CSS (recommandé par Shopify)
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";

// Pas de type ici (JS pur)
export const links = () => [
  { rel: "stylesheet", href: polarisStyles },
];

export default function Root() {
  return (
    <html lang="fr">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {/* Tes routes rendues ici (app.jsx / app._index.jsx, etc.) */}
        <Outlet />

        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
