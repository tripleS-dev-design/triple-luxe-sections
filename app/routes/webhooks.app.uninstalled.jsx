import { json } from "@remix-run/node";
import { shopify, sessionStorage } from "../shopify.server";

export async function action({ request }) {
  try {
    const { topic, shop } = await shopify.authenticate.webhook(request);
    if (topic !== "APP_UNINSTALLED") return json({ ok: true }, { status: 200 });
    console.log("[WEBHOOK] APP_UNINSTALLED for", shop);
    await sessionStorage.deleteSessions(shop);
    return json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("[WEBHOOK] uninstalled invalid HMAC:", err?.message || err);
    return json({ error: "invalid hmac" }, { status: 401 });
  }
}
export const loader = () => new Response("Method Not Allowed", { status: 405 });
