import { json } from "@remix-run/node";
import { shopify } from "../shopify.server";
import db from "../db.server";

export function loader() {
  return new Response("Method Not Allowed", { status: 405 });
}

export async function action({ request }) {
  try {
    // ✅ Vérifie la signature HMAC (401 si invalide via le catch)
    const { topic, shop, payload } = await shopify.webhooks.process(request);
    console.log(`[WEBHOOK] ${topic} from ${shop}`);

    // Idempotent: OK si déjà supprimé
    await db.session.deleteMany({ where: { shop } });

    return new Response(null, { status: 200 });
  } catch (err) {
    console.error("Invalid webhook (app/uninstalled):", err);
    return new Response("Invalid webhook", { status: 401 });
  }
}
