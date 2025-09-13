// app/routes/app.billing.confirm.jsx
import { redirect } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { hasActiveSubscription } from "../services/billing.server";

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  try {
    await hasActiveSubscription(admin); // optionnel
  } catch (_) {}
  return redirect("/app");
};

export default function BillingConfirm() {
  return null;
}
