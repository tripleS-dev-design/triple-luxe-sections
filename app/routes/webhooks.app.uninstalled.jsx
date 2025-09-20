// app/routes/webhooks.app.uninstalled.jsx
import { json } from "@remix-run/node";
import { shopify, sessionStorage } from "../shopify.server";

/**
 * Reçoit le webhook APP_UNINSTALLED.
 * - Valide la requête (HMAC)
 * - Supprime toutes les sessions du shop
 * - (Optionnel) marque le shop comme désinstallé en DB si tu as une table "Shop"
 */
export async function action({ request }) {
  try {
    const { topic, shop, payload } = await shopify.authenticate.webhook(request);

    if (topic !== "APP_UNINSTALLED") {
      // On retourne 200 pour ne pas que Shopify retente
      return json({ ok: true, ignored: true }, { status: 200 });
    }

    console.log("[WEBHOOK] APP_UNINSTALLED for", shop);

    // 1) Supprimer toutes les sessions de ce shop (PrismaSessionStorage)
    await sessionStorage.deleteSessions(shop);

    // 2) (Optionnel) si tu as une table Shop, marque "installed=false"
    // import prisma from "../../db.server";
    // await prisma.shop.upsert({
    //   where: { domain: shop },
    //   update: { installed: false, uninstalledAt: new Date() },
    //   create: { domain: shop, installed: false, uninstalledAt: new Date() },
    // });

    return json({ ok: true }, { status: 200 });
  } catch (err) {
    // HMAC invalide ⇒ 401 (exigence Shopify)
    console.error("[WEBHOOK] uninstalled invalid HMAC:", err?.message || err);
    return json({ error: "invalid webhook" }, { status: 401 });
  }
}

export const loader = () => new Response("Method Not Allowed", { status: 405 });
