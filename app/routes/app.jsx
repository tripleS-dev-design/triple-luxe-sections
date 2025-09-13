// app/routes/app.jsx
import { json } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { AppProvider as PolarisAppProvider } from "@shopify/polaris";
import fr from "@shopify/polaris/locales/fr.json";
import styles from "@shopify/polaris/build/esm/styles.css?url";
import { APP_HANDLE, authenticate } from "../shopify.server";

export const links = () => [{ rel: "stylesheet", href: styles }];

export const loader = async ({ request }) => {
  // 1) Auth admin (le SDK gère OAuth / session)
  const { session, billing, redirect } = await authenticate.admin(request);

  // 2) Managed pricing : vérifie si un paiement actif existe
  const { hasActivePayment } = await billing.check();

  if (!hasActivePayment) {
    // 3) Envoie le marchand vers la page Shopify des plans (gérée par Shopify)
    const storeHandle = session.shop.replace(".myshopify.com", "");
    const url = `https://admin.shopify.com/store/${storeHandle}/charges/${APP_HANDLE}/pricing_plans`;
    return redirect(url); // le helper met les bons headers pour naviguer en top-level
  }

  // 4) OK → charge l’interface
  return json({ ok: true });
};

export default function AppLayout() {
  return (
    <PolarisAppProvider i18n={fr}>
      <Outlet />
    </PolarisAppProvider>
  );
}
