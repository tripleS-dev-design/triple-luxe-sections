// app/routes/webhooks.compliance.jsx
import { authenticate } from "../shopify.server";
import { json } from "@remix-run/node";

export function loader() {
  return new Response("Method Not Allowed", { status: 405 });
}

export async function action({ request }) {
  try {
    // Vérifie HMAC & parse le webhook (topic, shop, payload, session si présent)
    const { topic, shop, payload } = await authenticate.webhook(request);

    // On n’accepte que les 3 topics GDPR obligatoires
    if (
      topic !== "customers/data_request" &&
      topic !== "customers/redact" &&
      topic !== "shop/redact"
    ) {
      // Endpoint partagé : on ignore proprement le reste
      return new Response("Ignored", { status: 200 });
    }

    // === À faire selon ton stockage ===
    // if (topic === "customers/data_request") { ... }
    // if (topic === "customers/redact") { ... }
    // if (topic === "shop/redact") { ... }

    console.log(`[GDPR OK] ${topic} for ${shop}`);
    return json({ ok: true });
  } catch (err) {
    // HMAC invalide -> 401 attendu par Shopify
    console.error("[GDPR] invalid HMAC:", err?.message || err);
    return new Response("Unauthorized", { status: 401 });
  }
}
