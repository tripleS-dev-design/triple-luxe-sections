// app/routes/app.jsx
import { json } from "@remix-run/node";
import { Outlet, useLoaderData, useRouteError } from "@remix-run/react";
import { boundary } from "@shopify/shopify-app-remix/server";

import { AppProvider as PolarisAppProvider } from "@shopify/polaris";
import fr from "@shopify/polaris/locales/fr.json";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";

import { AppProvider } from "@shopify/shopify-app-remix/react";
import { authenticate } from "../shopify.server";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request); // لا try/catch

  const url = new URL(request.url);
  let host = url.searchParams.get("host") || "";

  const shopDomain = (session?.shop || "").toLowerCase();
  let shopSub = shopDomain.replace(".myshopify.com", "");

  // fallback صغير إذا host ناقص (نادر)
  if (!host) {
    const ref = request.headers.get("referer") || "";
    const m = ref.match(/admin\.shopify\.com\/store\/([^/]+)/i);
    if (m?.[1]) {
      shopSub = m[1].toLowerCase();
      host = Buffer.from(`admin.shopify.com/store/${shopSub}`, "utf8").toString("base64");
    }
  }

  return json({
    apiKey: process.env.SHOPIFY_API_KEY || "",
    host,
    shopSub,
  });
};

export default function AppRoute() {
  const { apiKey, host } = useLoaderData();

  return (
    <PolarisAppProvider i18n={fr}>
      <AppProvider isEmbeddedApp apiKey={apiKey} host={host}>
        <Outlet />
      </AppProvider>
    </PolarisAppProvider>
  );
}

export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers = (args) => {
  const h = boundary.headers(args) || new Headers();
  h.set("Cache-Control", "no-store");
  return h;
};
