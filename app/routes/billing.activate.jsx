// app/routes/billing.activate.jsx  →  /billing/activate
import { redirect } from "@remix-run/node";
import { authenticate, PLAN_HANDLES } from "../shopify.server";

const truthy = (v) =>
  typeof v === "string" && ["true","1","yes","y","on"].includes(v.toLowerCase());

function computeIsTest(shop, nodeEnv) {
  if (truthy(process.env.BILLING_TEST || "")) return true;
  const dev = (process.env.DEV_STORES || "")
    .split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  if (dev.length && shop && dev.includes(shop.toLowerCase())) return true;
  if ((nodeEnv || "").toLowerCase() !== "production") return true;
  return false;
}

export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop") || "";
  const host = url.searchParams.get("host") || "";
  const plan = url.searchParams.get("plan") || PLAN_HANDLES.monthly;

  const appOrigin = process.env.SHOPIFY_APP_URL || url.origin;

  try {
    const { billing } = await authenticate.admin(request);

    // URL de retour courte
    const returnUrl = new URL("/billing/confirm", appOrigin);
    if (shop) returnUrl.searchParams.set("shop", shop);
    if (host) returnUrl.searchParams.set("host", host);

    await billing.request({
      plan,
      isTest: computeIsTest(shop, process.env.NODE_ENV),
      returnUrl: returnUrl.toString(),
    });

    // Normalement on ne passe pas ici (Shopify 302 → page d’approbation)
    const fb = new URL("/app/additional", appOrigin);
    if (shop) fb.searchParams.set("shop", shop);
    if (host) fb.searchParams.set("host", host);
    return redirect(fb.toString());

  } catch (err) {
    // IMPORTANT : on sort de l'iframe vers **la page d’approbation Shopify**
    if (err instanceof Response && err.status === 302) {
      const approvalUrl = err.headers.get("Location"); // <- Doit être une URL admin.shopify.com/charges/...
      const exit = new URL("/auth/exit-iframe", appOrigin);
      if (shop) exit.searchParams.set("shop", shop);
      if (host) exit.searchParams.set("host", host);
      exit.searchParams.set("exitIframe", approvalUrl || "/auth/login");
      return redirect(exit.toString());
    }

    console.error("billing.activate error:", err);
    return new Response("Billing activation failed", { status: 500 });
  }
};
