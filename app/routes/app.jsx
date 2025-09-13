import { json, redirect } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { AppProvider as PolarisAppProvider } from "@shopify/polaris";
import fr from "@shopify/polaris/locales/fr.json";
import styles from "@shopify/polaris/build/esm/styles.css?url";

export const links = () => [{ rel: "stylesheet", href: styles }];

// Fallback GraphQL si billing.check() n’est pas dispo
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

  // Auth session Admin (PAS de guard billing ici)
  const { admin, session, billing } = await authenticate.admin(request).catch(() => ({
    admin: null,
    session: null,
    billing: null,
  }));

  // Assure qu’on a un shop handle fiable pour la redirection
  const url = new URL(request.url);
  const shopQ = (url.searchParams.get("shop") || "").toLowerCase();
  const shopDomain = (session?.shop || shopQ || "").toLowerCase();
  const storeHandle = shopDomain.replace(".myshopify.com", "");

  if (!shopDomain) {
    // cas rare: pas encore de session et pas de ?shop
    throw redirect(url.toString());
  }

  // === PAYWALL MANAGED PRICING ===
  // 1) essaye l’utilitaire billing.check() (fourni par Remix SDK récent)
  let active = false;
  if (billing?.check) {
    try {
      const res = await billing.check();
      active = !!res?.hasActivePayment;
    } catch {
      active = false;
    }
  } else if (admin) {
    // 2) fallback GraphQL
    active = await hasActiveSubscription(admin);
  }

  if (!active) {
    const appHandle = process.env.SHOPIFY_APP_HANDLE || "triple-luxe-sections";
    const pricingUrl = `https://admin.shopify.com/store/${storeHandle}/charges/${appHandle}/pricing_plans`;
    throw redirect(pricingUrl, { headers: { "Cache-Control": "no-store" } });
  }

  return json({
    shopSub: storeHandle,
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
