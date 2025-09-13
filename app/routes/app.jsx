// app/routes/app.jsx
import { json, redirect } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { AppProvider as PolarisAppProvider } from "@shopify/polaris";
import fr from "@shopify/polaris/locales/fr.json";
import styles from "@shopify/polaris/build/esm/styles.css?url";

export const links = () => [{ rel: "stylesheet", href: styles }];

export const loader = async ({ request }) => {
  // IMPORTANT: on importe PLAN_HANDLES du server
  const { authenticate, PLAN_HANDLES } = await import("../shopify.server");

  // Auth + billing guard : si pas abonné à tls-premium-monthly,
  // le SDK redirige vers la page de confirmation d’abonnement,
  // puis revient sur /app/billing/confirm → /app
  const { session } = await authenticate.admin(request, {
    billing: { required: true, plans: [PLAN_HANDLES.monthly] },
  });

  // (optionnel) sécurité si la session n’a pas le même shop que la query
  const url = new URL(request.url);
  const shopQ = (url.searchParams.get("shop") || "").toLowerCase();
  if (session?.shop && shopQ && session.shop.toLowerCase() !== shopQ) {
    url.searchParams.set("shop", session.shop.toLowerCase());
    throw redirect(url.toString());
  }

  const shopSub = (session?.shop || shopQ || "").replace(".myshopify.com", "");
  return json({ shopSub, apiKey: process.env.SHOPIFY_API_KEY || "" });
};

export default function AppLayout() {
  const { shopSub, apiKey } = useLoaderData();
  return (
    <PolarisAppProvider i18n={fr}>
      <Outlet context={{ shopSub, apiKey }} />
    </PolarisAppProvider>
  );
}
