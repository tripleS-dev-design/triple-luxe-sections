// app/routes/app.jsx
import { json, redirect } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { AppProvider as PolarisAppProvider } from "@shopify/polaris";
import fr from "@shopify/polaris/locales/fr.json";
import styles from "@shopify/polaris/build/esm/styles.css?url";

export const links = () => [{ rel: "stylesheet", href: styles }];

// Handle tel qu’au Partner
const APP_HANDLE = "triple-luxe-sections";

export const loader = async ({ request }) => {
  const { authenticate } = await import("../shopify.server");

  try {
    const { session, billing } = await authenticate.admin(request);

    const devBypass =
      process.env.NODE_ENV !== "production" ||
      process.env.SHOPIFY_DEV_SHOP === session.shop;

    if (!devBypass) {
      let hasActivePayment = false;
      if (billing?.check) {
        const res = await billing.check();
        hasActivePayment = !!res?.hasActivePayment;
      }
      if (!hasActivePayment) {
        const store = session.shop.replace(".myshopify.com", "");
        return redirect(
          `https://admin.shopify.com/store/${store}/charges/${APP_HANDLE}/pricing_plans`
        );
      }
    }

    return json({
      apiKey: process.env.SHOPIFY_API_KEY || "",
      shop: session.shop,
    });
  } catch (err) {
    if (err instanceof Response) throw err; // laisse passer les redirects OAuth
    console.error("APP_LOADER_ERR", err);
    return redirect("/auth/login");
  }
};

export default function AppLayout() {
  const { apiKey } = useLoaderData();
  return (
    <PolarisAppProvider i18n={fr}>
      <Outlet context={{ apiKey }} />
    </PolarisAppProvider>
  );
}
