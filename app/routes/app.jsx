// app/routes/app.jsx
import { json, redirect } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { ensureSubscription } from "../utils/billing.server";

export async function loader({ request }) {
  // 1) Auth Shopify (si pas de session, le SDK redirige vers /auth/login)
  const { admin, session } = await authenticate.admin(request);

  // 2) S'assurer que l'abonnement de l'app est actif (0.99 USD / 30 jours)
  const returnUrl = `${process.env.SHOPIFY_APP_URL}/app.billing.confirm`;
  const testMode = process.env.SHOPIFY_BILLING_TEST === "true";

  const confirmationUrl = await ensureSubscription({
    admin,
    returnUrl,
    test: testMode,
    price: "0.99",
    currency: "USD",
  });

  // 2.a) S'il faut souscrire, on redirige vers la page de confirmation de paiement Shopify
  if (confirmationUrl) {
    return redirect(confirmationUrl);
  }

  // 3) Sinon on peut charger l'UI normalement
  return json({ shop: session.shop });
}

export default function AppRoute() {
  // ton UI embarquée (Polaris/React/etc.)
  return null;
}
