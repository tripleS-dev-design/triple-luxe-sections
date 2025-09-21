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

  // Vérifie l'abonnement (Managed Pricing)
  const { hasActivePayment } = await billing.check();

  // Handle d'app (doit == handle dans shopify.app.toml)
  const appHandle = "triple-luxe-sections";

  // storeHandle = "selyadev" à partir de "selyadev.myshopify.com"
  const storeHandle = session.shop.replace(".myshopify.com", "");

  if (!hasActivePayment) {
    return redirect(
      `https://admin.shopify.com/store/${storeHandle}/charges/${appHandle}/pricing_plans`,
      { target: "_top" }
    );
  }

  return json({
    apiKey: process.env.SHOPIFY_API_KEY || "",
    shopSub: storeHandle, // ← IMPORTANT pour app._index.jsx
  });
};

export default function App() {
  const { apiKey, shopSub } = useLoaderData();

  return (
    <PolarisAppProvider i18n={enTranslations}>
      <AppProvider isEmbeddedApp apiKey={apiKey}>
        <NavMenu>
          <Link to="/premium">Premium Interface</Link>
        </NavMenu>
        {/* Pas besoin de passer le contexte manuellement :
            app._index.jsx lit ces données via useRouteLoaderData("routes/app") */}
        <Outlet />
      </AppProvider>
    </PolarisAppProvider>
  );
}

export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers = (headersArgs) => boundary.headers(headersArgs);
