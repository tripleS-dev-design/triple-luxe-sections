// app/routes/app.jsx
import { Link, Outlet, useLoaderData, useRouteError } from "@remix-run/react";
import { boundary } from "@shopify/shopify-app-remix/server";
import { AppProvider as PolarisAppProvider } from "@shopify/polaris";
// IMPORTANT: utilisez l'assert JSON (même style que le SDK)
import enTranslations from "@shopify/polaris/locales/en.json" assert { type: "json" };
import { AppProvider } from "@shopify/shopify-app-remix/react";
import { NavMenu } from "@shopify/app-bridge-react";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";
import { json } from "@remix-run/node";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const loader = async ({ request }) => {
  // Pas de billing, app 100% gratuite
  const { authenticate } = await import("../../shopify.server.js");
  const { session } = await authenticate.admin(request);

  return json({
    apiKey: process.env.SHOPIFY_API_KEY || "",
    shopSub: session.shop.replace(".myshopify.com", ""),
  });
};

export default function App() {
  const { apiKey } = useLoaderData();

  return (
    <PolarisAppProvider i18n={enTranslations}>
      <AppProvider isEmbeddedApp apiKey={apiKey}>
        <NavMenu>
          <Link to="/premium">Premium Interface</Link>
        </NavMenu>
        <Outlet />
      </AppProvider>
    </PolarisAppProvider>
  );
}

export function ErrorBoundary() { return boundary.error(useRouteError()); }
export const headers = (h) => boundary.headers(h);
