// app/root.jsx
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "@remix-run/react";

// PAS d'import addDocumentResponseHeaders ici
export const headers = () => ({
  // Embedded autorisé dans admin + boutiques
  "Content-Security-Policy":
    "frame-ancestors https://admin.shopify.com https://*.myshopify.com;",
});

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
