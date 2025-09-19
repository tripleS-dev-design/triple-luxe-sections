// app/routes/webhooks.compliance.jsx
import { json } from "@remix-run/node";
import { shopify } from "../shopify.server";

export function loader() {
  return new Response("Method Not Allowed", { status: 405 });
}

export async function action({ request }) {
  try {
    // Vérifie et parse le webhook (HMAC inclus).
    // Si HMAC invalide: ça throw -> on renvoie 401.
    const { topic, shop, payload } = await shopify.webhooks.process(request);
    console.log("[COMPLIANCE]", topic, shop);
    // TODO: effectuer la suppression/retour GDPR si tu stockes des données.
    return json({ ok: true });
  } catch (err) {
    console.error("Invalid compliance webhook:", err);
    return new Response("Invalid webhook", { status: 401 });
  }
}
