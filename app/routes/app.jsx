// app/routes/app.jsx
import { json } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { AppProvider as PolarisAppProvider } from "@shopify/polaris";
import fr from "@shopify/polaris/locales/fr.json";
import styles from "@shopify/polaris/build/esm/styles.css?url";

export const links = () => [{ rel: "stylesheet", href: styles }];

export const loader = async ({ request }) => {
  // Doit matcher le handle de shopify.app.toml
  const appHandle = "triple-luxe-sections";

  const { authenticate } = await import("../shopify.server");
  const { billing, redirect, session } = await authenticate.admin(request);

  // Vérifie s'il existe un abonnement actif (Managed Pricing)
  const { hasActivePayment } = await billing.check();

  // Ex: "my-store" à partir de "my-store.myshopify.com"
  const storeHandle = session.shop.replace(".myshopify.com", "");

  if (!hasActivePayment) {
    return redirect(
      `https://admin.shopify.com/store/${storeHandle}/charges/${appHandle}/pricing_plans`,
      { target: "_top" } // on sort de l’iframe
    );
  }

  return json({ apiKey: process.env.SHOPIFY_API_KEY || "" });
};

export default function AppLayout() {
  const { apiKey } = useLoaderData();
  return (
    <PolarisAppProvider i18n={fr}>
      <Outlet context={{ apiKey }} />
    </PolarisAppProvider>
  );
}
