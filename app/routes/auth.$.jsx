// app/routes/auth.$.jsx
import { redirect } from "@remix-run/node";
import { shopify, registerWebhooks } from "../shopify.server";

export async function loader({ request }) {
  const { session } = await shopify.authenticate.admin(request);
  // Inscrire/mettre à jour toutes les subscriptions déclarées dans shopify.server.js
  await registerWebhooks({ session });
  // redirige vers ton UI embarquée
  return redirect("/app");
}
