import { Links, Meta, Outlet, Scripts, ScrollRestoration, useRouteError } from "@remix-run/react";
import { boundary } from "@shopify/shopify-app-remix/server";

export const headers = (h) => boundary.headers(h);

export default function Root() {
  return (
    <html lang="fr">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://cdn.shopify.com/" />
        <link rel="stylesheet" href="https://cdn.shopify.com/static/fonts/inter/v4/styles.css" />
        <Meta /><Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration /><Scripts />
      </body>
    </html>
  );
}
export function ErrorBoundary(){ return boundary.error(useRouteError()); }
