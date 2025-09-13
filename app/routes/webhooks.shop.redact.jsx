import { json } from "@remix-run/node";
import { shopify } from "../shopify.server";

export function loader() {
  return new Response("Method Not Allowed", { status: 405 });
}

export async function action({ request }) {
  try {
    const { topic, shop, payload } = await shopify.webhooks.process(request); // vérifie HMAC
    console.log("[GDPR] SHOP_REDACT", shop);
    // TODO: supprimer toutes les données liées au shop si tu en stockes
    return json({ ok: true });
  } catch (err) {
    console.error("Webhook shop/redact error:", err);
    return new Response("Invalid webhook", { status: 401 });
  }
}
