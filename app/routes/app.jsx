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
  const shopQ = url.searchParams.get("shop") || undefined;

  // Laisse Shopify gérer OAuth + Managed Pricing.
  // Si pas d’abonnement actif sur le handle donné, Shopify montre la page de plan (0.99$) automatiquement.
  const { session } = await authenticate
    .admin(request, {
      billing: { required: true, plans: [PLAN_HANDLES.monthly] },
    })
    .catch(() => ({ session: null }));

  // Pas de session ? on lance le flow OAuth côté top-level via /auth/login
  if (!session) {
    const qs = shopQ ? `?shop=${shopQ}` : "";
    throw redirect(`/auth/login${qs}`);
  }

  // OK → expose data à l’UI
  const shopSub = session.shop.replace(".myshopify.com", "");
  const apiKey = process.env.SHOPIFY_API_KEY || "";
  return json({ shopSub, apiKey });
};

export default function AppLayout() {
  const { shopSub, apiKey } = useLoaderData();
  return (
    <PolarisAppProvider i18n={fr}>
      <Outlet context={{ shopSub, apiKey }} />
    </PolarisAppProvider>
  );
}
