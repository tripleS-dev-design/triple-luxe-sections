// app/routes/auth.$.jsx
import { redirect } from "@remix-run/node";
import { shopify, registerWebhooks } from "../shopify.server";

export async function loader({ request }) {
  const { session } = await shopify.authenticate.admin(request);
  try {
    await registerWebhooks({ session });
  } catch (e) {
    console.error("[auth.$] registerWebhooks error:", e);
  }
  console.log("[auth.$] OK for shop:", session.shop);
  return redirect("/app");
}
