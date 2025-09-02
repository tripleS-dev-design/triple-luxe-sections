// app/routes/billing.confirm.jsx
import { redirect } from "@remix-run/node";

export async function loader({ request }) {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop") || "";
  const host = url.searchParams.get("host") || "";

  const appOrigin = process.env.SHOPIFY_APP_URL || url.origin;

  // ====== Option A (comme app 1) : retour dans l’onglet de l’app
  const store = shop.replace(".myshopify.com", "");
  const adminAppUrl =
    `https://admin.shopify.com/store/${store}/apps/${process.env.SHOPIFY_API_KEY}` +
    (shop || host ? `?${new URLSearchParams({ ...(shop && { shop }), ...(host && { host }) }).toString()}` : "");

  const exit = new URL("/auth/exit-iframe", appOrigin);
  if (shop) exit.searchParams.set("shop", shop);
  if (host) exit.searchParams.set("host", host);
  exit.searchParams.set("exitIframe", adminAppUrl);
  return redirect(exit.toString());

  /* ====== Option B (si tu préfères): ouvrir l’éditeur et pré-ajouter un block
  const store = shop.replace(".myshopify.com", "");
  const base = `https://admin.shopify.com/store/${store}/themes/current/editor`;
  const p = new URLSearchParams({
    context: "apps",
    template: "index",
    target: "newAppsSection",
    addAppBlockId: `${process.env.SHOPIFY_API_KEY}/tls-header`,
  });
  const editorUrl = `${base}?${p.toString()}`;
  const exit = new URL("/auth/exit-iframe", appOrigin);
  if (shop) exit.searchParams.set("shop", shop);
  if (host) exit.searchParams.set("host", host);
  exit.searchParams.set("exitIframe", editorUrl);
  return redirect(exit.toString());
  */
}
