// app/routes/webhooks.app.scopes_update.jsx
import { json } from "@remix-run/node";
import { shopify } from "../shopify.server";
import db from "../db.server";

export function loader() {
  return new Response("Method Not Allowed", { status: 405 });
}

export async function action({ request }) {
  try {
    const { topic, shop, payload } = await shopify.webhooks.process(request);

    // Si tu stockes la portée dans la session DB, mets-la à jour.
    // Ici on l’enregistre en texte pour l’exemple.
    await db.session.updateMany({
      where: { shop },
      data: { scope: String(payload?.current ?? "") },
    });

    console.log("[WEBHOOK]", topic, "| shop:", shop, "| scope:", payload?.current);
    return json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("[WEBHOOK] scopes_update invalid HMAC:", err?.message);
    return new Response("Unauthorized", { status: 401 });
  }
}
