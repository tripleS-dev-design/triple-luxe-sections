import { json } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { AppProvider as PolarisAppProvider } from "@shopify/polaris";
import fr from "@shopify/polaris/locales/fr.json";
import styles from "@shopify/polaris/build/esm/styles.css?url";
export const links = () => [{ rel: "stylesheet", href: styles }];

export const loader = async ({ request }) => {
  const appHandle = "triple-luxe-sections";
  const { authenticate } = await import("../shopify.server");
  const { billing, redirect, session } = await authenticate.admin(request);

  const { hasActivePayment } = await billing.check();
  if (!hasActivePayment) {
    const storeHandle = session.shop.replace(".myshopify.com", "");
    return redirect(
      `https://admin.shopify.com/store/${storeHandle}/charges/${appHandle}/pricing_plans`,
      { target: "_top" }
    );
  }
  return json({ apiKey: process.env.SHOPIFY_API_KEY || "" });
};

export default function AppLayout() {
  const { apiKey } = useLoaderData();
  return (
    <PolarisAppProvider i18n={fr}>
      <Outlet context={{ apiKey }} />
    </PolarisAppProvider>
  );
}
