// app/routes/_index.jsx
import { redirect } from "@remix-run/node";

export const loader = ({ request }) => {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop") || process.env.SHOPIFY_DEV_SHOP || "";
  const qs = shop ? `?shop=${encodeURIComponent(shop)}` : "";
  return redirect(`/app${qs}`);
};
// app/routes/_index.jsx
import { redirect } from "@remix-run/node";

export const loader = ({ request }) => {
  const url = new URL(request.url);
  const shop =
    url.searchParams.get("shop") || process.env.SHOPIFY_DEV_SHOP || "";
  return shop ? redirect(`/app?shop=${shop}`) : redirect("/auth/login");
};
