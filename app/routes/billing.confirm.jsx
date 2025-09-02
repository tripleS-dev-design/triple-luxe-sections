// app/routes/billing.confirm.jsx   →   /billing/confirm
import { redirect } from "@remix-run/node";

export async function loader({ request }) {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop") || "";
  const host = url.searchParams.get("host") || "";

  const appOrigin = process.env.SHOPIFY_APP_URL || url.origin;
  const store = shop.replace(".myshopify.com", "");

  // Retour dans l’onglet de l’app dans l’admin Shopify
  const adminAppUrl =
    `https://admin.shopify.com/store/${store}/apps/${process.env.SHOPIFY_API_KEY}` +
    (shop || host ? `?${new URLSearchParams({ ...(shop && { shop }), ...(host && { host }) }).toString()}` : "");

  const exit = new URL("/auth/exit-iframe", appOrigin);
  if (shop) exit.searchParams.set("shop", shop);
  if (host) exit.searchParams.set("host", host);
  exit.searchParams.set("exitIframe", adminAppUrl);
  return redirect(exit.toString());
}
