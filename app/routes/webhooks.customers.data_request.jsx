import { json } from "@remix-run/node";
import { shopify } from "../shopify.server";

export function loader() {
  return new Response("Method Not Allowed", { status: 405 });
}

export async function action({ request }) {
  try {
    const { topic, shop, payload } = await shopify.webhooks.process(request); // vérifie HMAC
    console.log("[GDPR] DATA_REQUEST", shop, payload?.customer?.id);
    // TODO: si tu stockes des données client, prépare l’export (facultatif pour passer le check)
    return json({ ok: true });
  } catch (err) {
    console.error("Webhook customers/data_request error:", err);
    return new Response("Invalid webhook", { status: 401 });
  }
}
