import { json } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { AppProvider as PolarisAppProvider } from "@shopify/polaris";
import fr from "@shopify/polaris/locales/fr.json";
import styles from "@shopify/polaris/build/esm/styles.css?url";

export const links = () => [{ rel: "stylesheet", href: styles }];

export const loader = async ({ request }) => {
  const { authenticate, PLAN_HANDLES } = await import("../shopify.server");

  // ⛔️ PAS de DEV_SHOP ni de réécriture de ?shop en prod
  // ✅ Paywall natif Shopify v11 : s’il n’y a pas d’abonnement actif au plan, Shopify ouvre la modale
  await authenticate.admin(request, {
    billing: { required: true, plans: [PLAN_HANDLES.monthly] },
  });

  return json({ apiKey: process.env.SHOPIFY_API_KEY || "" });
};

export default function AppLayout() {
  useLoaderData(); // (apiKey dispo si tu veux utiliser AppProvider côté client)
  return (
    <PolarisAppProvider i18n={fr}>
      <Outlet />
    </PolarisAppProvider>
  );
}
