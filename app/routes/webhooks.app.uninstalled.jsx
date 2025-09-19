// webhooks.app.uninstalled.jsx
import { authenticate } from "../shopify.server";
import db from "../db.server";

export async function action({ request }) {
  const { shop, session, topic } = await authenticate.webhook(request);
  console.log(`Received ${topic} webhook for ${shop}`);

  // Nettoyer la session si elle existe
  if (session) {
    await db.session.deleteMany({ where: { shop } });
  }
  return new Response(); // <= 200
}
