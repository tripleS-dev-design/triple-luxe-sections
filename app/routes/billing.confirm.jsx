// app/routes/billing.confirm.jsx
import { redirect } from "@remix-run/node";
import { shopify } from "../shopify.server";

export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const host = url.searchParams.get("host");
  const shop = url.searchParams.get("shop") || "";

  // Valide/rafraîchit la session
  await shopify.authenticate.admin(request);

  const to = host
    ? `/app?host=${encodeURIComponent(host)}&shop=${encodeURIComponent(shop)}`
    : "/app";
  return redirect(to);
};
