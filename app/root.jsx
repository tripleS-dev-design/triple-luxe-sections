// app/root.jsx
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "@remix-run/react";
import { addDocumentResponseHeaders } from "./shopify.server";

export function headers({ loaderHeaders }) {
  try {
    return addDocumentResponseHeaders(loaderHeaders ?? new Headers());
  } catch {
    // Fallback sûr en prod si addDocumentResponseHeaders lance
    const h = new Headers();
    h.set(
      "Content-Security-Policy",
      "frame-ancestors https://admin.shopify.com https://*.myshopify.com"
    );
    h.set("X-Frame-Options", "ALLOWALL");
    return h;
  }
}

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
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
