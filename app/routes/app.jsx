import { json, redirect } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { ensureSubscription } from "../utils/billing.server";

export async function loader({ request }) {
  const { admin, shop } = await authenticate.admin(request);

  // après paiement Shopify revient ici :
  const returnUrl = `${process.env.SHOPIFY_APP_URL}/app.billing.confirm`;

  // en dev: charges de test ; en prod: false
  const testMode = process.env.SHOPIFY_BILLING_TEST === "true";

  const confirmationUrl = await ensureSubscription({
    admin,
    returnUrl,
    test: testMode,
    price: "0.99",
    currency: "USD",
  });

  if (confirmationUrl) return redirect(confirmationUrl);

  return json({ shop });
}

export default function AppRoute() {
  return null; // ... ton UI existant
}
