// app/routes/app.jsx
import { json } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { AppProvider as PolarisAppProvider } from "@shopify/polaris";
// 👇 aligne l’import JSON (même attribut que l’autre module)
import polarisTranslations from "@shopify/polaris/locales/en.json" with { type: "json" };
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";
import { authenticate } from "../shopify.server";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;
  const shopSub = shop.replace(".myshopify.com", "");
  return json({ shopSub, apiKey: process.env.SHOPIFY_API_KEY || "" });
};

export default function AppLayout() {
  useLoaderData();
  return (
    <PolarisAppProvider i18n={polarisTranslations}>
      <Outlet />
    </PolarisAppProvider>
  );
}
