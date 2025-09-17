// app/routes/app.jsx
import { json } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { AppProvider as PolarisAppProvider } from "@shopify/polaris";
import polarisTranslations from "@shopify/polaris/locales/en.json" with { type: "json" };
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";
import { authenticate, addDocumentResponseHeaders } from "../shopify.server";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const loader = async ({ request }) => {
  // Déclenche l’OAuth automatiquement si la session manque
  const { session } = await authenticate.admin(request);
  const shop = session?.shop || "";
  const shopSub = shop.replace(".myshopify.com", "");

  // Propage les headers requis par Shopify (CSP/frame-ancestors, etc.)
  const headers = await addDocumentResponseHeaders(request);

  return json(
    { shopSub, apiKey: process.env.SHOPIFY_API_KEY || "" },
    { headers }
  );
};

// Important: renvoyer les headers du loader vers le document
export const headers = ({ loaderHeaders }) => loaderHeaders;

export default function AppLayout() {
  useLoaderData();
  return (
    <PolarisAppProvider i18n={polarisTranslations}>
      <Outlet />
    </PolarisAppProvider>
  );
}
