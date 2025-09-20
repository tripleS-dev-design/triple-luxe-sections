import { json } from "@remix-run/node";
import { shopify } from "../shopify.server";

export async function action({ request }) {
  try {
    const { topic, shop, payload } = await shopify.authenticate.webhook(request);
    console.log("[WEBHOOK][GDPR]", topic, "for", shop);
    // TODO: exécuter ta logique GDPR ici selon le topic
    return json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("[WEBHOOK][GDPR] invalid HMAC:", err?.message || err);
    return json({ error: "invalid hmac" }, { status: 401 });
  }
}
export const loader = () => new Response("Method Not Allowed", { status: 405 });
