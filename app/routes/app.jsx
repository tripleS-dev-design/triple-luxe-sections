// app/routes/app.jsx
import { json, redirect } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { AppProvider as PolarisAppProvider } from "@shopify/polaris";
import fr from "@shopify/polaris/locales/fr.json";
import styles from "@shopify/polaris/build/esm/styles.css?url";

export const links = () => [{ rel: "stylesheet", href: styles }];

// ⚠️ Mets bien le handle EXACT de ton app (Partner Dashboard → Handle)
const APP_HANDLE = "triple-luxe-sections";

export const loader = async ({ request }) => {
  const { authenticate } = await import("../shopify.server");

  // Auth admin standard (pas de mutation billing ici)
  const { session, billing } = await authenticate.admin(request);

  // Shopify gère la tarification : on vérifie seulement s'il y a un paiement actif
  const { hasActivePayment } = await billing.check();

  if (!hasActivePayment) {
    // Redirection vers la page officielle des plans (gérée par Shopify)
    const storeHandle = session.shop.replace(".myshopify.com", "");
    const url = `https://admin.shopify.com/store/${storeHandle}/charges/${APP_HANDLE}/pricing_plans`;
    return redirect(url);
  }

  // Paiement OK → on charge l'app
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
