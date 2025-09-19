// webhooks.app.scopes_update.jsx
import { authenticate } from "../shopify.server";
import db from "../db.server";

export async function action({ request }) {
  const { payload, session, topic, shop } = await authenticate.webhook(request);
  console.log(`Received ${topic} webhook for ${shop}`);

  const current = payload?.current;
  if (session && current) {
    await db.session.update({
      where: { id: session.id },
      data: { scope: current.toString() },
    });
  }
  return new Response(); // <= 200
}
