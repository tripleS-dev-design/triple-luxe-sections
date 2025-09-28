// app/routes/app.jsx
import { json } from "@remix-run/node";
import { Outlet, useLoaderData, useRouteError } from "@remix-run/react";
import { boundary } from "@shopify/shopify-app-remix/server";
import { AppProvider as PolarisAppProvider } from "@shopify/polaris";
import fr from "@shopify/polaris/locales/fr.json";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";
import { AppProvider } from "@shopify/shopify-app-remix/react";
import { authenticate } from "../shopify.server";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request); // pas de try/catch
  const url = new URL(request.url);
  const host = url.searchParams.get("host") || "";
  const shopDomain = (session?.shop || "").toLowerCase();
  const shopSub = shopDomain.endsWith(".myshopify.com")
    ? shopDomain.slice(0, -".myshopify.com".length)
    : shopDomain;
  return json({ apiKey: process.env.SHOPIFY_API_KEY || "", host, shopSub });
};

export default function AppRoute() {
  const { apiKey, host } = useLoaderData();
  return (
    <PolarisAppProvider i18n={fr}>
      <AppProvider isEmbeddedApp apiKey={apiKey} host={host}>
        <Outlet />
      </AppProvider>
    </PolarisAppProvider>
  );
}

export function ErrorBoundary() {
  return boundary.error(useRouteError());
}
