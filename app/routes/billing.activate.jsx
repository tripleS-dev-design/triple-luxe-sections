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

  // URL de retour courte (<= 255 chars)
  const returnUrl = new URL("/billing/confirm", appOrigin);
  if (shop) returnUrl.searchParams.set("shop", shop);
  if (host) returnUrl.searchParams.set("host", host);

  try {
    const { billing } = await authenticate.admin(request);

    // ⬇️ Laisse la librairie gérer le 302 vers la page d’approbation
    const resp = await billing.request({
      plan,
      isTest: computeIsTest(shop, process.env.NODE_ENV),
      returnUrl: returnUrl.toString(),
    });

    // En pratique, billing.request renvoie (ou jette) un 302; au cas improbable où on “retombe” ici:
    const fb = new URL("/app/additional", appOrigin);
    if (shop) fb.searchParams.set("shop", shop);
    if (host) fb.searchParams.set("host", host);
    return redirect(fb.toString());
  } catch (err) {
    // ⬇️ Très important : si la librairie renvoie un Response (302),
    // on le renvoie tel quel. Ça contient l’URL Shopify "approval".
    if (err instanceof Response) return err;

    console.error("billing.activate error:", err);
    return new Response("Billing activation failed", { status: 500 });
  }
};
