import { json } from "@remix-run/node";
import { shopify } from "../shopify.server";
import db from "../db.server";

export function loader() {
  return new Response("Method Not Allowed", { status: 405 });
}

export async function action({ request }) {
  try {
    // ✅ Vérifie la signature HMAC
    const { topic, shop, payload } = await shopify.webhooks.process(request);
    console.log(`[WEBHOOK] ${topic} from ${shop}`);

    // Si tu stockes le scope offline en DB, mets-le à jour ici (idempotent)
    if (payload?.current) {
      await db.session.updateMany({
        where: { shop },
        data: { scope: String(payload.current) },
      });
    }

    return new Response(null, { status: 200 });
  } catch (err) {
    console.error("Invalid webhook (app/scopes_update):", err);
    return new Response("Invalid webhook", { status: 401 });
  }
}
