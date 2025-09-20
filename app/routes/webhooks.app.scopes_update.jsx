import { json } from "@remix-run/node";
import { shopify } from "../shopify.server";

export async function action({ request }) {
  try {
    const { topic, shop, payload } = await shopify.authenticate.webhook(request);
    if (topic !== "APP_SCOPES_UPDATE") return json({ ok: true }, { status: 200 });
    console.log("[WEBHOOK] SCOPES_UPDATE", shop, payload?.grantedScopes);
    return json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("[WEBHOOK] scopes_update invalid HMAC:", err?.message || err);
    return json({ error: "invalid hmac" }, { status: 401 });
  }
}
export const loader = () => new Response("Method Not Allowed", { status: 405 });
