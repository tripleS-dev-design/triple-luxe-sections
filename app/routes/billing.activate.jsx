// app/routes/billing.activate.jsx
import { redirect } from "@remix-run/node";

export const loader = async ({ request }) => {
  const { authenticate, PLAN_HANDLES } = await import("../shopify.server");
  const { billing, session } = await authenticate.admin(request);

  const url = new URL(request.url);
  const plan = url.searchParams.get("plan");

  // ✅ garde exactement tes handles
  const ALLOWED = new Set([PLAN_HANDLES.monthly, PLAN_HANDLES.annual]);
  if (!plan || !ALLOWED.has(plan)) {
    return redirect("/app/additional");
  }

  // ✅ après paiement, rja3 l’UI principale dyalek (nta 3andek /app_index)
  const returnUrl = new URL("/app_index", url.origin);
  const host = url.searchParams.get("host");
  const shop = url.searchParams.get("shop");
  if (host) returnUrl.searchParams.set("host", host);
  if (shop) returnUrl.searchParams.set("shop", shop);

  // demande de paiement (test = true en dev)
  const isTest = process.env.NODE_ENV !== "production";
  const { confirmationUrl } = await billing.request({
    plan,                 // ex: "tls-premium-monthly"
    isTest,
    returnUrl: returnUrl.toString(),
  });

  if (confirmationUrl) {
    // sortir de l’iframe vers la page de paiement Shopify
    const exit = new URL("/auth/exit-iframe", url.origin);
    exit.searchParams.set("shop", session.shop);
    if (host) exit.searchParams.set("host", host);
    exit.searchParams.set("exitIframe", confirmationUrl);
    return redirect(exit.toString());
  }

  // fallback
  return redirect("/app/additional");
};

export default function BillingActivate() {
  return null;
}

