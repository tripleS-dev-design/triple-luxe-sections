// app/routes/billing.activate.jsx   →   /billing/activate
import { redirect } from "@remix-run/node";
import { authenticate, PLAN_HANDLES } from "../shopify.server";

// Helpers (même logique que l’app 1)
const truthy = (v) =>
  typeof v === "string" && ["true","1","yes","y","on"].includes(v.toLowerCase());

function computeIsTest(shop, nodeEnv) {
  if (truthy(process.env.BILLING_TEST || "")) return true;
  const devList = (process.env.DEV_STORES || "")
    .split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  if (devList.length && shop && devList.includes(shop.toLowerCase())) return true;
  if ((nodeEnv || "").toLowerCase() !== "production") return true;
  return false;
}

export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop") || "";
  const host = url.searchParams.get("host") || "";
  const plan = url.searchParams.get("plan") || PLAN_HANDLES.monthly;

  try {
    const { billing } = await authenticate.admin(request);

    const appUrl = process.env.SHOPIFY_APP_URL || url.origin;
    const returnUrl = new URL("/billing/confirm", appUrl);
    if (shop) returnUrl.searchParams.set("shop", shop);
    if (host) returnUrl.searchParams.set("host", host);

    await billing.request({
      plan,
      isTest: computeIsTest(shop, process.env.NODE_ENV),
      returnUrl: returnUrl.toString(), // <= 255 chars
    });

    // Si jamais on revient ici, fallback vers pricing
    const fallback = new URL("/app.additional", appUrl);
    if (shop) fallback.searchParams.set("shop", shop);
    if (host) fallback.searchParams.set("host", host);
    return redirect(fallback.toString());
  } catch (err) {
    if (err instanceof Response && err.status === 302) {
      const appOrigin = process.env.SHOPIFY_APP_URL || url.origin;
      const loc = err.headers.get("Location") || "/auth/login";
      const finalTarget = new URL(loc, appOrigin).toString();

      const exit = new URL("/auth/exit-iframe", appOrigin);
      if (shop) exit.searchParams.set("shop", shop);
      if (host) exit.searchParams.set("host", host);
      exit.searchParams.set("exitIframe", finalTarget);
      return redirect(exit.toString());
    }
    console.error("billing.activate error:", err);
    return new Response("Billing activation failed", { status: 500 });
  }
};
