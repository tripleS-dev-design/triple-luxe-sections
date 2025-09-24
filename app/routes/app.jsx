// app/routes/app.jsx
import { json, redirect } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { AppProvider as PolarisAppProvider } from "@shopify/polaris";
import fr from "@shopify/polaris/locales/fr.json";
import styles from "@shopify/polaris/build/esm/styles.css?url";

export const links = () => [{ rel: "stylesheet", href: styles }];

/** استخرج shop من host (base64) أو من نص الدومين */
function extractShopFromHostParam(hostB64) {
  try {
    const decoded = Buffer.from(hostB64, "base64").toString("utf8");
    // أمثلة محتملة:
    // "admin.shopify.com/store/samifinal"
    // "samifinal.myshopify.com/admin"
    const m1 = decoded.match(/\/store\/([^/]+)/); // admin.shopify.com/store/<sub>
    if (m1?.[1]) return `${m1[1].toLowerCase()}.myshopify.com`;
    const m2 = decoded.match(/([^./]+)\.myshopify\.com/i);
    if (m2?.[1]) return `${m2[1].toLowerCase()}.myshopify.com`;
  } catch {}
  return "";
}

export const loader = async ({ request }) => {
  // Shopify Remix v3: كنستعمل authenticate فقط
  const { authenticate } = await import("../shopify.server");

  const url = new URL(request.url);
  let qsShop = (url.searchParams.get("shop") || "").toLowerCase();
  if (qsShop && !qsShop.endsWith(".myshopify.com")) {
    qsShop = `${qsShop}.myshopify.com`;
  }

  // جرّب host إلى ما كانش ?shop
  if (!qsShop) {
    const hostB64 = url.searchParams.get("host");
    const fromHost = hostB64 ? extractShopFromHostParam(hostB64) : "";
    if (fromHost) qsShop = fromHost;
  }

  // جرّب تصادق (غادي يرد session إلا كانت)
  const { session } = await authenticate
    .admin(request)
    .catch(() => ({ session: null }));

  const sessionShop = (session?.shop || "").toLowerCase();

  // A) عندي session و shop فالكواري ومختلفين → نكمّل OAuth للـ qsShop
  if (qsShop && sessionShop && sessionShop !== qsShop) {
    throw redirect(`/auth?shop=${encodeURIComponent(qsShop)}`);
  }

  // B) ما عنديش session ولكن عندي qsShop → بدا OAuth
  if (!sessionShop && qsShop) {
    throw redirect(`/auth?shop=${encodeURIComponent(qsShop)}`);
  }

  // C) لا session لا qsShop → رجّع للمسار العام ديال auth/login
  if (!sessionShop && !qsShop) {
    // هادي هي صفحة البدء اللي كتجي مع تيمبلايت Shopify
    throw redirect("/auth/login");
  }

  // دابا حددنا المتجر الفعّال:
  const activeShop = (sessionShop || qsShop).toLowerCase();
  const shopSub = activeShop.replace(".myshopify.com", "");
  const apiKey = process.env.SHOPIFY_API_KEY || "";

  // هاد القيم هما اللي كياخدهم app._index.jsx عبر useRouteLoaderData("routes/app")
  return json({ shopSub, apiKey });
};

export default function AppLayout() {
  const { shopSub, apiKey } = useLoaderData();
  return (
    <PolarisAppProvider i18n={fr}>
      <Outlet context={{ shopSub, apiKey }} />
    </PolarisAppProvider>
  );
}
