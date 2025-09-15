// app/routes/app.jsx
import React from "react";
import { json } from "@remix-run/node";
import { Outlet, useLoaderData, useLocation } from "@remix-run/react";
import { ShopifyAppProvider } from "@shopify/shopify-app-remix/react";
import { AppProvider as PolarisAppProvider } from "@shopify/polaris";
import polarisTranslations from "@shopify/polaris/locales/en.json";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";
import { authenticate } from "../shopify.server";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop; // p.ex. "selya-store.myshopify.com"
  const shopSub = shop.replace(".myshopify.com", "");

  return json({
    shopSub,
    apiKey: process.env.SHOPIFY_API_KEY || "",
  });
};

export default function AppLayout() {
  const { apiKey } = useLoaderData();
  const location = useLocation();
  // ShopifyAppProvider lit host dans l’URL pour sortir de l’iframe
  const host = new URLSearchParams(location.search).get("host") || undefined;

  return (
    <ShopifyAppProvider isEmbeddedApp apiKey={apiKey} host={host}>
      <PolarisAppProvider i18n={polarisTranslations}>
        <Outlet />
      </PolarisAppProvider>
    </ShopifyAppProvider>
  );
}
