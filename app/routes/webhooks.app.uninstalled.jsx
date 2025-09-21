// app/routes/webhooks.app.uninstalled.jsx
import { json } from "@remix-run/node";
import { shopify /*, sessionStorage*/ } from "../shopify.server";
import prisma from "../db.server";

export async function action({ request }) {
  const { topic, shop, payload } = await shopify.authenticate.webhook(request);
  console.log("[WEBHOOK] APP_UNINSTALLED for", shop, payload?.app_id);

  // Optionnel : marquer le shop comme désinstallé
  try {
    await prisma.shop.update({
      where: { domain: shop },
      data: { uninstalledAt: new Date() },
    });
  } catch (e) {
    // si pas de table shops, ignorer
  }

  // (facultatif) si tu as un mécanisme custom pour supprimer toutes les sessions de ce shop,
  // fais-le ici. L’API SessionStorage de Shopify ne fournit pas "deleteAllForShop" par défaut.

  return json({ ok: true });
}
