// app/routes/webhooks.app.uninstalled.jsx
import { json } from "@remix-run/node";
import { shopify } from "../shopify.server";
import db from "../db.server";

export function loader() {
  return new Response("Method Not Allowed", { status: 405 });
}

export async function action({ request }) {
  try {
    const { topic, shop } = await shopify.webhooks.process(request);

    // Idempotent: supprime les sessions connues pour la boutique
    await db.session.deleteMany({ where: { shop } });

    console.log("[WEBHOOK]", topic, "| shop:", shop, "-> sessions supprimées");
    return json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("[WEBHOOK] uninstalled invalid HMAC:", err?.message);
    return new Response("Unauthorized", { status: 401 });
  }
}
