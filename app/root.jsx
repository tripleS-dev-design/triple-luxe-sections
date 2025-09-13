// app/root.jsx
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "@remix-run/react";
import { addDocumentResponseHeaders } from "./shopify.server";

// IMPORTANT : corrige l'erreur “Invalid URL” si SHOPIFY_APP_URL est bon
export const headers = addDocumentResponseHeaders;

export default function Root() {
  return (
    <html lang="fr">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta /><Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration /><Scripts />
      </body>
    </html>
  );
}
