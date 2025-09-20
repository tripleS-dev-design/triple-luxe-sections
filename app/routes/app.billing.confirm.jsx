// app/routes/app.billing.confirm.jsx
import { redirect } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { hasActiveSubscription } from "../utils/billing.server";

export async function loader({ request }) {
  const { admin } = await authenticate.admin(request);
  try { await hasActiveSubscription(admin); } catch {}
  return redirect("/app");
}
export default function Confirm() { return null; }
