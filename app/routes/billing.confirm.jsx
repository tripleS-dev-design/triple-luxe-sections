// app/routes/billing.confirm.jsx
import { redirect } from "@remix-run/node";
import { shopify } from "../shopify.server";

export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const host = url.searchParams.get("host") || "";
  const shop = url.searchParams.get("shop") || "";
  await shopify.authenticate.admin(request);
  return redirect(`/app?host=${encodeURIComponent(host)}&shop=${encodeURIComponent(shop)}`);
};
