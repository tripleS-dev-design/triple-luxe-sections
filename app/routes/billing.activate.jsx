import { redirect } from "@remix-run/node";
import { authenticate } from "../shopify.server";

// helpers
const truthy = (v) =>
  typeof v === "string" &&
  ["true", "1", "yes", "y", "on"].includes(v.toLowerCase());

function computeIsTest(shop, nodeEnv) {
  if (truthy(process.env.BILLING_TEST || "")) return true;
  const devList = (process.env.DEV_STORES || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  if (devList.length && shop && devList.includes(shop.toLowerCase())) return true;
  if ((nodeEnv || "").toLowerCase() !== "production") return true;
  return false;
}

export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop") || "";
  const host = url.searchParams.get("host") || "";
  const plan = url.searchParams.get("plan") || "tls-premium-monthly";

  const appOrigin = process.env.SHOPIFY_APP_URL || url.origin;

  try {
    const { billing } = await authenticate.admin(request); // peut jeter un Response(302)
    const returnUrl = new URL("/billing/confirm", appOrigin);
    if (shop) returnUrl.searchParams.set("shop", shop);
    if (host) returnUrl.searchParams.set("host", host);

    const isTest = computeIsTest(shop, process.env.NODE_ENV);

    // Certains environnements renvoient un Response, d'autres le jettent.
    const maybeResp = await billing.request({
      plan,
      isTest,
      returnUrl: returnUrl.toString(),
    }).catch((e) => e);

    // ✅ Si on a un 302 (jeté ou retourné), on sort de l’iframe vers l’URL d’approbation Shopify
    if (maybeResp instanceof Response && maybeResp.status === 302) {
      const approvalUrl = maybeResp.headers.get("Location") || "/";
      const exit = new URL("/auth/exit-iframe", appOrigin);
      if (shop) exit.searchParams.set("shop", shop);
      if (host) exit.searchParams.set("host", host);
      exit.searchParams.set("exitIframe", approvalUrl);
      return redirect(exit.toString());
    }

    // Fallback de sécurité (au cas où).
    const fallback = new URL("/app/additional", appOrigin);
    if (shop) fallback.searchParams.set("shop", shop);
    if (host) fallback.searchParams.set("host", host);
    return redirect(fallback.toString());
  } catch (err) {
    // ✅ Même logique si c’est jeté sous forme d’exception Response(302)
    if (err instanceof Response && err.status === 302) {
      const approvalUrl = err.headers.get("Location") || "/";
      const exit = new URL("/auth/exit-iframe", appOrigin);
      if (shop) exit.searchParams.set("shop", shop);
      if (host) exit.searchParams.set("host", host);
      exit.searchParams.set("exitIframe", approvalUrl);
      return redirect(exit.toString());
    }
    console.error("billing.activate error:", err);
    return new Response("Billing activation failed", { status: 500 });
  }
};
