// app/routes/app.jsx
import { json } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { AppProvider as PolarisAppProvider } from "@shopify/polaris";
import polarisTranslations from "@shopify/polaris/locales/en.json";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";
import { AppProvider as ShopifyAppProvider } from "@shopify/shopify-app-remix/react"; // 👈 important
import { authenticate } from "../shopify.server";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop; // "selya-store.myshopify.com"
  const shopSub = shop.replace(".myshopify.com", "");
  return json({
    shop,
    shopSub,
    apiKey: process.env.SHOPIFY_API_KEY || "",
  });
};

export default function AppLayout() {
  const { apiKey } = useLoaderData();
  return (
    <ShopifyAppProvider apiKey={apiKey} isEmbeddedApp> {/* 👈 gère les 410/reauth */}
      <PolarisAppProvider i18n={polarisTranslations}>
        <Outlet />
      </PolarisAppProvider>
    </ShopifyAppProvider>
  );
}
