// webhooks.customers.redact.jsx (exemple GDPR)
import { json } from "@remix-run/node";
import { shopify } from "../shopify.server";

export function loader() {
  return new Response("Method Not Allowed", { status: 405 });
}

export async function action({ request }) {
  try {
    // Vérifie HMAC et parse le payload
    const { topic, shop, payload } = await shopify.webhooks.process(request);
    console.log("[GDPR] CUSTOMERS_REDACT", shop, payload?.customer?.id);
    // TODO: purger les données si tu en stockes
    return json({ ok: true }); // <= 200
  } catch (err) {
    console.error("Webhook customers/redact error:", err);
    return new Response("Invalid webhook", { status: 401 });
  }
}
