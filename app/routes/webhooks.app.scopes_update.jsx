import { authenticate } from "../shopify.server";
import db from "../db.server";

export function loader() {
  return new Response("Method Not Allowed", { status: 405 });
}

export async function action({ request }) {
  try {
    const { shop, topic, payload, session } = await authenticate.webhook(request);
    console.log(`[WEBHOOK] ${topic} for ${shop}`);

    // Exemple: persister les scopes actuels si tu veux
    const current = payload?.current?.toString?.() ?? null;
    if (session && current) {
      await db.session.update({
        where: { id: session.id },
        data: { scope: current },
      });
    }

    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("[WEBHOOK] scopes_update HMAC failed:", err?.message || err);
    return new Response("Unauthorized", { status: 401 });
  }
}
