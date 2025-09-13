// app/routes/app.jsx
import { json, redirect } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { AppProvider as PolarisAppProvider } from "@shopify/polaris";
import fr from "@shopify/polaris/locales/fr.json";
import styles from "@shopify/polaris/build/esm/styles.css?url";

export const links = () => [{ rel: "stylesheet", href: styles }];

export const loader = async ({ request }) => {
  const { authenticate } = await import("../shopify.server");

  // 1) Auth simple (pas de billing ici pour éviter boucles)
  const { session, billing } = await authenticate
    .admin(request)
    .catch(() => ({ session: null, billing: null }));

  // Pas de session -> on lance le login avec ?shop si dispo
  if (!session) {
    const url = new URL(request.url);
    const shop = url.searchParams.get("shop");
    throw redirect(`/auth/login${shop ? `?shop=${shop}` : ""}`);
  }

  // 2) Check Managed Pricing (Shopify gère l’affichage de la page de plan)
  //    Si pas d’abonnement actif => on envoie vers la page de plans Shopify
  if (billing?.check) {
    const { hasActivePayment } = await billing.check();
    if (!hasActivePayment) {
      const store = session.shop.replace(".myshopify.com", "");
      const appHandle = "triple-luxe-sections"; // DOIT matcher `handle` dans shopify.app.toml
      throw redirect(
        `https://admin.shopify.com/store/${store}/charges/${appHandle}/pricing_plans`
      );
    }
  }

  return json({
    shopSub: session.shop.replace(".myshopify.com", ""),
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
