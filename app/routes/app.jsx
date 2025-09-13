// app/routes/app.jsx
import { json, redirect } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { AppProvider as PolarisAppProvider } from "@shopify/polaris";
import fr from "@shopify/polaris/locales/fr.json";
import styles from "@shopify/polaris/build/esm/styles.css?url";

export const links = () => [{ rel: "stylesheet", href: styles }];

export const loader = async ({ request }) => {
  const { authenticate, PLAN_HANDLES } = await import("../shopify.server");

  // --- ton verrouillage dev (tel quel) ---
  const DEV_SHOP = (process.env.SHOPIFY_DEV_SHOP || "selyadev.myshopify.com").toLowerCase();
  const DEV_SUB  = DEV_SHOP.replace(".myshopify.com", "");
  const url = new URL(request.url);
  const shopQ = (url.searchParams.get("shop") || "").toLowerCase();

  if (shopQ && shopQ !== DEV_SHOP) {
    url.searchParams.set("shop", DEV_SHOP);
    throw redirect(url.toString());
  }

  // 👉 Auth + vérification d’abonnement (exige le plan tls-premium-monthly)
  const { session } = await authenticate.admin(request, {
    billing: { required: true, plans: [PLAN_HANDLES.monthly] },
  }).catch(() => ({ session: null }));

  // Si la session est pour un autre shop, on force l’install sur le bon
  if (session?.shop && session.shop.toLowerCase() !== DEV_SHOP) {
    throw redirect(
      `https://admin.shopify.com/store/${DEV_SUB}/oauth/install?client_id=${process.env.SHOPIFY_API_KEY}`
    );
  }

  // Si pas de session et pas de ?shop => on rajoute le bon shop dans l’URL
  if (!session && !shopQ) {
    url.searchParams.set("shop", DEV_SHOP);
    throw redirect(url.toString());
  }

  return json({
    shopSub: DEV_SUB,
    apiKey: process.env.SHOPIFY_API_KEY || "",
  });
};

export default function AppLayout() {
  const { shopSub, apiKey } = useLoaderData();
  return (
    <PolarisAppProvider i18n={fr}>
      <Outlet context={{ shopSub, apiKey }} />
    </PolarisAppProvider>
  );
}
