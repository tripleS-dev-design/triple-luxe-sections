// app/routes/app.jsx
import { json } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { AppProvider as PolarisAppProvider } from "@shopify/polaris";
import polarisTranslations from "@shopify/polaris/locales/en.json" with { type: "json" };
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";
import { authenticate, addDocumentResponseHeaders } from "../shopify.server";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const loader = async ({ request }) => {
  // Va forcer l’OAuth si pas de session valide (pas besoin de le gérer à la main ici)
  const { session } = await authenticate.admin(request);
  const shop = session?.shop || "";
  const shopSub = shop.replace(".myshopify.com", "");
  const headers = await addDocumentResponseHeaders(request);
  return json(
    { shopSub, apiKey: process.env.SHOPIFY_API_KEY || "" },
    { headers }
  );
};

// Important: propage les headers générés par le loader (X-Frame-Options, etc.)
export const headers = ({ loaderHeaders }) => loaderHeaders;

export default function AppLayout() {
  useLoaderData(); // garde la pré-chargement pour les enfants
  return (
    <PolarisAppProvider i18n={polarisTranslations}>
      <Outlet />
    </PolarisAppProvider>
  );
}
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
