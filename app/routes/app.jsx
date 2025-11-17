// app/routes/app.jsx
import React from "react";
import { json } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import {
  AppProvider as PolarisAppProvider,
  Frame,
} from "@shopify/polaris";
import enTranslations from "@shopify/polaris/locales/en.json";
import "@shopify/polaris/build/esm/styles.css";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);

  const shopDomain = session.shop || "";
  const shopSub = shopDomain.replace(".myshopify.com", "");
  const apiKey = process.env.SHOPIFY_API_KEY || "";

  return json({
    shopSub,
    apiKey,
  });
};

export default function AppLayout() {
  const data = useLoaderData();

  return (
    <PolarisAppProvider i18n={enTranslations}>
      <Frame>
        {/* Outlet = app._index.jsx */}
        <Outlet context={data} />
      </Frame>
    </PolarisAppProvider>
  );
}
