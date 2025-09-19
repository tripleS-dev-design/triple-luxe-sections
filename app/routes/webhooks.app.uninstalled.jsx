import { authenticate } from "../shopify.server";
import db from "../db.server";

export function loader() {
  return new Response("Method Not Allowed", { status: 405 });
}

export async function action({ request }) {
  try {
    // Vérifie la signature HMAC automatiquement
    const { shop, topic, session } = await authenticate.webhook(request);

    console.log(`[WEBHOOK] ${topic} for ${shop}`);

    // L’app est désinstallée → supprime les sessions connues de ce shop
    await db.session.deleteMany({ where: { shop } });

    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("[WEBHOOK] uninstalled HMAC failed:", err?.message || err);
    return new Response("Unauthorized", { status: 401 });
  }
}
