// app/routes/app.jsx
import { json, redirect } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { AppProvider as PolarisAppProvider } from "@shopify/polaris";
import fr from "@shopify/polaris/locales/fr.json";
import styles from "@shopify/polaris/build/esm/styles.css?url";

export const links = () => [{ rel: "stylesheet", href: styles }];

export const loader = async ({ request }) => {
  const { authenticate, PLAN_HANDLES } = await import("../shopify.server");
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop") || undefined;

  // Auth + paywall (Managed Pricing). Si pas payé → Shopify affiche la page de plan.
  const { session } = await authenticate
    .admin(request, { billing: { required: true, plans: [PLAN_HANDLES.monthly] } })
    .catch(() => ({ session: null }));

  // Pas de session -> on lance /auth/login (avec ?shop si dispo)
  if (!session) {
    const qs = shop ? `?shop=${shop}` : "";
    throw redirect(`/auth/login${qs}`);
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
