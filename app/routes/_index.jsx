import { redirect } from "@remix-run/node";

export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop") || process.env.SHOPIFY_DEV_SHOP;
  if (shop) return redirect(`/app?shop=${shop}`);
  return redirect("/auth/login"); // fallback si pas de shop connu
};
