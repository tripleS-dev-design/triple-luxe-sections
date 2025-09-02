// app/routes/billing.activate.jsx
import { redirect } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  const { billing, session } = await authenticate.admin(request);

  const url = new URL(request.url);
  const plan = url.searchParams.get("plan");
  if (!plan) {
    throw new Response("Missing 'plan' query param", { status: 400 });
  }

  // 1) Demander l’URL de confirmation
  //    (garde isTest:true en dev, false en prod)
  const confirmationUrl = await billing.request({
    plan,
    isTest: process.env.NODE_ENV !== "production",
  });

  // 2) Sortir de l’iframe pour ouvrir la page de paiement Shopify
  const params = new URLSearchParams({
    shop: session.shop,
    host: url.searchParams.get("host") || "",
    exitIframe: confirmationUrl,
  });

  return redirect(`/auth/exit-iframe?${params.toString()}`);
};

export default function ActivateBilling() {
  return null;
}
