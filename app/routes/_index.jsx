import { redirect } from "@remix-run/node";

export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop") || process.env.SHOPIFY_DEV_STORE || "selyadev.myshopify.com";
  return redirect(`/app?shop=${shop}`);
};

export default function Index(){ return null; }
