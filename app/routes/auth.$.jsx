// app/routes/auth.$.jsx
import { redirect } from "@remix-run/node";
import { shopify, registerWebhooks } from "../shopify.server";

export async function loader({ request }) {
  const { session } = await shopify.authenticate.admin(request);
  try { await registerWebhooks({ session }); } catch (_) {}
  return redirect("/app");
}

export default function Auth() { return null; }
