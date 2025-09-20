// app/routes/app.billing.confirm.jsx
import { redirect } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { hasActiveSubscription } from "../utils/billing.server";

export async function loader({ request }) {
  const { admin } = await authenticate.admin(request);
  try {
    // on tente juste une lecture pour "réveiller" la session côté API
    await hasActiveSubscription(admin);
  } catch (_) {}
  return redirect("/app");
}

export default function BillingConfirm() {
  return null;
}
