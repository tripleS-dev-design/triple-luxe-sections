import { json, redirect } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { AppProvider as PolarisAppProvider } from "@shopify/polaris";
import fr from "@shopify/polaris/locales/fr.json";
import styles from "@shopify/polaris/build/esm/styles.css?url";
import { AppProvider } from "@shopify/shopify-app-remix/react";

export const links = () => [{ rel: "stylesheet", href: styles }];

export const loader = async ({ request }) => {
  const { authenticate } = await import("../shopify.server");

  let session, billing;
  try {
    ({ session, billing } = await authenticate.admin(request));
  } catch {
    const url = new URL(request.url);
    const shop = url.searchParams.get("shop");
    throw redirect(`/auth/login${shop ? `?shop=${shop}` : ""}`);
  }

  try {
    if (billing?.check) {
      const { hasActivePayment } = await billing.check();
      if (!hasActivePayment) {
        const store = session.shop.replace(".myshopify.com", "");
        const appHandle = "triple-luxe-sections"; // <= DOIT matcher le handle
        const pricingUrl = `https://admin.shopify.com/store/${store}/charges/${appHandle}/pricing_plans`;

        return new Response(
          `<!doctype html><html><body><script>
             window.top.location.href=${JSON.stringify(pricingUrl)};
           </script></body></html>`,
          { headers: { "Content-Type": "text/html; charset=utf-8" } }
        );
      }
    }
  } catch {}

  return json({
    shopSub: session.shop.replace(".myshopify.com", ""),
    apiKey: process.env.SHOPIFY_API_KEY || "",
  });
};

export default function AppLayout() {
  const { shopSub, apiKey } = useLoaderData();
  return (
    <PolarisAppProvider i18n={fr}>
      <AppProvider isEmbeddedApp apiKey={apiKey}>
        <Outlet context={{ shopSub, apiKey }} />
      </AppProvider>
    </PolarisAppProvider>
  );
}
