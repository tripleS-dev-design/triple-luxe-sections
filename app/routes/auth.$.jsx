// app/routes/auth.$.jsx
import { redirect } from "@remix-run/node";
import { shopify, registerWebhooks } from "../shopify.server";

/**
 * Callback OAuth (toutes les variantes /auth/callback, /auth?shop=...),
 * enregistre les webhooks configurés côté serveur, puis renvoie vers /app.
 */
export async function loader({ request }) {
  const { session } = await shopify.authenticate.admin(request);

  // Enregistrer (ou rafraîchir) toutes les subscriptions déclarées dans shopify.server.js
  await registerWebhooks({ session });

  return redirect("/app");
}
