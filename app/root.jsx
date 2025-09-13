import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "@remix-run/react";

// Autoriser l'embed dans l'Admin Shopify (et *.myshopify.com)
export const headers = () => {
  return {
    "Content-Security-Policy":
      "frame-ancestors https://admin.shopify.com https://*.myshopify.com;",
    "Referrer-Policy": "origin-when-cross-origin",
  };
};

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
