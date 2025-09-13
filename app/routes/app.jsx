// app/routes/app.jsx
import { json, redirect } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { AppProvider as PolarisAppProvider } from "@shopify/polaris";
import fr from "@shopify/polaris/locales/fr.json";
import styles from "@shopify/polaris/build/esm/styles.css?url";

export const links = () => [{ rel: "stylesheet", href: styles }];

// Handle EXACT de ton app (Partner Dashboard → Handle)
const APP_HANDLE = "triple-luxe-sections";

export const loader = async ({ request }) => {
  const { authenticate } = await import("../shopify.server");
  const { session, billing } = await authenticate.admin(request);

  // Vérifie si le marchand a un paiement actif (Managed Pricing)
  const { hasActivePayment } = await billing.check();

  if (!hasActivePayment) {
    const store = session.shop.replace(".myshopify.com", "");
    return redirect(
      `https://admin.shopify.com/store/${store}/charges/${APP_HANDLE}/pricing_plans`
    );
  }

  return json({
    apiKey: process.env.SHOPIFY_API_KEY || "",
    shop: session.shop,
  });
};

export default function AppLayout() {
  const { apiKey } = useLoaderData();
  return (
    <PolarisAppProvider i18n={fr}>
      <Outlet context={{ apiKey }} />
    </PolarisAppProvider>
  );
}
