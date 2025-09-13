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

  const { session } = await authenticate
    .admin(request, { billing: { required: true, plans: [PLAN_HANDLES.monthly] } })
    .catch(() => ({ session: null }));

  if (!session) {
    const qs = shopQ ? `?shop=${shopQ}` : "";
    throw redirect(`/auth/login${qs}`);
  }

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
