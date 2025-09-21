// app.jsx
import { Link, Outlet, useLoaderData, useRouteError } from "@remix-run/react";
import { boundary } from "@shopify/shopify-app-remix/server";
import { AppProvider as PolarisAppProvider } from "@shopify/polaris";
import enTranslations from "@shopify/polaris/locales/en.json";
import { AppProvider } from "@shopify/shopify-app-remix/react";
import { NavMenu } from "@shopify/app-bridge-react";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";
import { json } from "@remix-run/node";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const loader = async ({ request }) => {
  const { authenticate } = await import("../shopify.server");
  const { billing, redirect, session } = await authenticate.admin(request);

  // Managed Pricing: vérifie si un abonnement actif existe
  const { hasActivePayment } = await billing.check();

  // Si pas d’abonnement → page Pricing Plans (admin)
  if (!hasActivePayment) {
    const appHandle = "triple-luxe-sections"; // = handle de ton shopify.app.toml
    const storeHandle = session.shop.replace(".myshopify.com", "");
    return redirect(
      `https://admin.shopify.com/store/${storeHandle}/charges/${appHandle}/pricing_plans`,
      { target: "_top" } // sortir de l’iframe
    );
  }

  return json({ apiKey: process.env.SHOPIFY_API_KEY || "" });
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

export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
