// app/routes/app.jsx
import { json } from "@remix-run/node";
import { Outlet, useLoaderData, redirect } from "@remix-run/react";
import { AppProvider as PolarisAppProvider } from "@shopify/polaris";
import fr from "@shopify/polaris/locales/fr.json";
import styles from "@shopify/polaris/build/esm/styles.css?url";
import { AppProvider } from "@shopify/shopify-app-remix/react";

export const links = () => [{ rel: "stylesheet", href: styles }];

export const loader = async ({ request }) => {
  const { authenticate } = await import("../shopify.server");

  // 1) Auth (si pas de session, on renvoie vers /auth/login)
  let session, billing;
  try {
    ({ session, billing } = await authenticate.admin(request));
  } catch {
    const url = new URL(request.url);
    const shop = url.searchParams.get("shop");
    throw redirect(`/auth/login${shop ? `?shop=${shop}` : ""}`);
  }

  // 2) Managed Pricing gate: si pas payé -> page de plans Shopify (top-level)
  try {
    if (billing?.check) {
      const { hasActivePayment } = await billing.check();
      if (!hasActivePayment) {
        const store = session.shop.replace(".myshopify.com", "");
        const appHandle = "triple-luxe-sections"; // doit matcher `handle` dans shopify.app.toml
        const pricingUrl = `https://admin.shopify.com/store/${store}/charges/${appHandle}/pricing_plans`;

        return new Response(
          `<!doctype html><html><body><script>
             window.top.location.href=${JSON.stringify(pricingUrl)};
           </script></body></html>`,
          { headers: { "Content-Type": "text/html; charset=utf-8" } }
        );
      }
    }
  } catch {
    // en cas d'erreur billing, on laisse passer l'accès (ou log si besoin)
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
      {/* Provider Remix officiel (tokens & embed) */}
      <AppProvider isEmbeddedApp apiKey={apiKey}>
        <Outlet context={{ shopSub, apiKey }} />
      </AppProvider>
    </PolarisAppProvider>
  );
}
