// app/routes/webhooks.compliance.jsx
import { json } from "@remix-run/node";
import { shopify } from "../shopify.server";

export function loader() {
  return new Response("Method Not Allowed", { status: 405 });
}

export async function action({ request }) {
  try {
    // Valide la signature HMAC + parse le webhook
    const { topic, shop, payload } = await shopify.webhooks.process(request);

    console.log("[WEBHOOK][GDPR]", topic, "| shop:", shop);
    // TODO: applique tes suppressions/export si nécessaire

    return json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("[WEBHOOK][GDPR] invalid HMAC:", err?.message);
    return new Response("Unauthorized", { status: 401 });
  }
}
