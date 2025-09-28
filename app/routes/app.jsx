// app/routes/app.jsx
import { json, redirect } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { AppProvider as PolarisAppProvider } from "@shopify/polaris";
import fr from "@shopify/polaris/locales/fr.json";
import styles from "@shopify/polaris/build/esm/styles.css?url";

export const links = () => [{ rel: "stylesheet", href: styles }];

export const loader = async ({ request }) => {
  const { authenticate } = await import("../shopify.server");
  const DEV_SHOP = (process.env.SHOPIFY_DEV_SHOP || "selyadev.myshopify.com").toLowerCase();
  const DEV_SUB  = DEV_SHOP.replace(".myshopify.com", "");

  const url = new URL(request.url);
  const shopQ = (url.searchParams.get("shop") || "").toLowerCase();

  // 1) Si un shop query existe et n'est pas celui qu'on veut -> on le corrige
  if (shopQ && shopQ !== DEV_SHOP) {
    url.searchParams.set("shop", DEV_SHOP);
    throw redirect(url.toString());
  }

  // 2) Auth Admin (crée/valide la session)
  const { session } = await authenticate.admin(request).catch(() => ({ session: null }));

  // 3) Si la session existe mais n'est PAS sur le bon shop -> on renvoie l'install du bon shop
  if (session?.shop && session.shop.toLowerCase() !== DEV_SHOP) {
    throw redirect(
      `https://admin.shopify.com/store/${DEV_SUB}/oauth/install?client_id=${process.env.SHOPIFY_API_KEY}`
    );
  }

  // 4) Si pas de session ET pas de ?shop, on force le bon shop en query (pour App Bridge)
  if (!session && !shopQ) {
    url.searchParams.set("shop", DEV_SHOP);
    throw redirect(url.toString());
  }

  // Données pour les enfants (app._index)
  const shopSub = DEV_SUB; // on expose seulement le shop verrouillé
  const apiKey = process.env.SHOPIFY_API_KEY || "";
  return json({ shopSub, apiKey });
};

export default function AppLayout() {
  const { shopSub, apiKey } = useLoaderData();
  // Polaris seulement ici; App Bridge est géré par le proxy Shopify en dev
  return (
    <PolarisAppProvider i18n={fr}>
      <Outlet context={{ shopSub, apiKey }} />
    </PolarisAppProvider>
  );
}
