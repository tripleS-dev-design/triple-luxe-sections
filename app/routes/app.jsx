// app/routes/app.jsx
import { json, redirect } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { AppProvider as PolarisAppProvider } from "@shopify/polaris";
import fr from "@shopify/polaris/locales/fr.json";
import styles from "@shopify/polaris/build/esm/styles.css?url";

export const links = () => [{ rel: "stylesheet", href: styles }];

/** Helper: استخرج shop من host (base64) أو من الـ path ديال admin.shopify.com */
function extractShopFromHostParam(hostB64) {
  try {
    const decoded = Buffer.from(hostB64, "base64").toString("utf8");
    // أمثلة decoded:
    // "admin.shopify.com/store/samifinal" أو "samifinal.myshopify.com/admin"
    const m1 = decoded.match(/\/store\/([^/]+)/); // admin.shopify.com/store/<sub>
    if (m1?.[1]) return `${m1[1].toLowerCase()}.myshopify.com`;
    const m2 = decoded.match(/([^./]+)\.myshopify\.com/i);
    if (m2?.[1]) return `${m2[1].toLowerCase()}.myshopify.com`;
  } catch {}
  return "";
}

export const loader = async ({ request }) => {
  // نجيب الـ SDK من shopify.server (فرضًا عندك default export سميتو shopify)
  const shopify = (await import("../shopify.server")).default;

  const url = new URL(request.url);
  let qsShop = (url.searchParams.get("shop") || "").toLowerCase();
  if (qsShop && !qsShop.endsWith(".myshopify.com")) {
    // لو جا غير sub (نادرًا)، كنكملو الدومين
    qsShop = `${qsShop}.myshopify.com`;
  }

  // جرّب نستخرج المتجر من host إذا ما عطاناش ?shop
  if (!qsShop) {
    const hostB64 = url.searchParams.get("host");
    const shopFromHost = hostB64 ? extractShopFromHostParam(hostB64) : "";
    if (shopFromHost) qsShop = shopFromHost;
  }

  // Auth (كترد session إلا كانت صالحة، ولا كتدي للـ OAuth إلا خاص)
  const { session } = await shopify.authenticate.admin(request).catch(() => ({ session: null }));

  const sessionShop = (session?.shop || "").toLowerCase();

  // CASE A: كاين ?shop (أو host) و مختلف على session → نبدّلو الكونتكست به
  if (qsShop && sessionShop && sessionShop !== qsShop) {
    const authUrl = await shopify.auth.begin({
      shop: qsShop,
      callbackPath: "/auth/callback",
      isOnline: false,
      request,
    });
    throw redirect(authUrl);
  }

  // CASE B: ما كايناش session و عندنا qsShop → نكمّلو OAuth لهاد المتجر
  if (!sessionShop && qsShop) {
    const authUrl = await shopify.auth.begin({
      shop: qsShop,
      callbackPath: "/auth/callback",
      isOnline: false,
      request,
    });
    throw redirect(authUrl);
  }

  // CASE C: ما عندنا لا session لا qsShop → خلّي Shopify يكمّل الإنستال
  if (!sessionShop && !qsShop) {
    // توجيه لصفحة لوجين/إنستال العامة ديالك (حسب إعداداتك)
    throw redirect("/auth/login");
  }

  // المتجر الفعّال
  const activeShop = (sessionShop || qsShop).toLowerCase();
  const shopSub = activeShop.replace(".myshopify.com", "");
  const apiKey = process.env.SHOPIFY_API_KEY || "";

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
