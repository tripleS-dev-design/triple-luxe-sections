// app/routes/app.jsx
import { json, redirect } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { AppProvider as PolarisAppProvider } from "@shopify/polaris";
import fr from "@shopify/polaris/locales/fr.json";
import styles from "@shopify/polaris/build/esm/styles.css?url";

export const links = () => [{ rel: "stylesheet", href: styles }];

/** Retourne true si un abonnement actif est trouvé */
async function hasActiveSubscription(admin) {
  const QUERY = `#graphql
    query {
      appInstallation {
        activeSubscriptions { status }
      }
    }
  `;
  const res = await admin.graphql(QUERY);
  const json = await res.json();
  const list = json?.data?.appInstallation?.activeSubscriptions || [];
  return list.some((s) => s?.status === "ACTIVE");
}

export const loader = async ({ request }) => {
  const { authenticate } = await import("../shopify.server");

  const DEV_SHOP = (process.env.SHOPIFY_DEV_SHOP || "selyadev.myshopify.com").toLowerCase();
  const DEV_SUB  = DEV_SHOP.replace(".myshopify.com", "");
  const url = new URL(request.url);
  const shopQ = (url.searchParams.get("shop") || "").toLowerCase();

  // 1) verrouille ?shop sur le shop de dev
  if (shopQ && shopQ !== DEV_SHOP) {
    url.searchParams.set("shop", DEV_SHOP);
    throw redirect(url.toString());
  }

  // 2) Auth admin (pas de param billing ici)
  const { admin, session } = await authenticate.admin(request).catch(() => ({ admin: null, session: null }));

  // 3) si on a une session mais pour un autre shop -> forcer l'install sur le bon
  if (session?.shop && session.shop.toLowerCase() !== DEV_SHOP) {
    throw redirect(
      `https://admin.shopify.com/store/${DEV_SUB}/oauth/install?client_id=${process.env.SHOPIFY_API_KEY}`
    );
  }

  // 4) pas de session et pas de ?shop -> force la query (App Bridge)
  if (!session && !shopQ) {
    url.searchParams.set("shop", DEV_SHOP);
    throw redirect(url.toString());
  }

  // 5) Managed Pricing : si pas d'abonnement actif -> redirection vers la page des plans Shopify
  if (admin) {
    const isActive = await hasActiveSubscription(admin);
    if (!isActive) {
      const appHandle =
        process.env.SHOPIFY_APP_HANDLE /* à définir dans Render */ || "triple-luxe-sections";
      const pricingUrl = `https://admin.shopify.com/store/${DEV_SUB}/charges/${appHandle}/pricing_plans`;
      throw redirect(pricingUrl); // Shopify affiche la page de plan
    }
  }

  // 6) données pour l'UI
  return json({ shopSub: DEV_SUB, apiKey: process.env.SHOPIFY_API_KEY || "" });
};

export default function AppLayout() {
  const { shopSub, apiKey } = useLoaderData();
  return (
    <PolarisAppProvider i18n={fr}>
      <Outlet context={{ shopSub, apiKey }} />
    </PolarisAppProvider>
  );
}
