// app/routes/app.jsx
import { json } from "@remix-run/node";
import { Outlet, useLoaderData, useRouteError } from "@remix-run/react";
import { boundary } from "@shopify/shopify-app-remix/server";

import { AppProvider as PolarisAppProvider } from "@shopify/polaris";
import fr from "@shopify/polaris/locales/fr.json";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";

import { AppProvider } from "@shopify/shopify-app-remix/react";
import { authenticate } from "../shopify.server";
// (اختياري) فعل الفوترة إذا بغيتها فـلوودر
// import { requireBilling } from "../server/require-billing.server";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

/**
 * مهم:
 * - ما نديروش try/catch ل authenticate.admin(request)
 * - إلا ما كانتش session غادي يردّنا تلقائياً لـ /auth
 */
export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);

  // (اختياري) تحقق من الفوترة
  // await requireBilling({ request, admin, session });

  const url = new URL(request.url);
  const host = url.searchParams.get("host") || "";

  // shopSub كنستخرجوه من session.shop، والـHome عندك عندها fallback clientي iframed
  const shopDomain = (session?.shop || "").toLowerCase();       // ex: samifinal.myshopify.com
  const shopSub = shopDomain.replace(".myshopify.com", "");      // ex: samifinal

  return json({
    apiKey: process.env.SHOPIFY_API_KEY || "",
    host,
    shopSub, // باش app._index.jsx يلقاه بـ useRouteLoaderData("routes/app")
  });
};

export default function AppRoute() {
  const { apiKey, host } = useLoaderData();

  return (
    <PolarisAppProvider i18n={fr}>
      {/* App Bridge: ضروري host باش يبقى embedded ويدير redirects صحاح */}
      <AppProvider isEmbeddedApp apiKey={apiKey} host={host}>
        <Outlet />
      </AppProvider>
    </PolarisAppProvider>
  );
}

export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers = (args) => boundary.headers(args);
