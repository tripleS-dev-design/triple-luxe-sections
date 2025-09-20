// app/routes/app.jsx
import { json, redirect } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { ensureSubscription } from "../utils/billing.server";

export async function loader({ request }) {
  // Si pas de session valide => le SDK déclenche la redirection vers /auth/login
  const { admin, session } = await authenticate.admin(request);

  // Abonnement requis (0.99 USD / 30 jours)
  const confirmationUrl = await ensureSubscription({
    admin,
    returnUrl: `${process.env.SHOPIFY_APP_URL}/app.billing.confirm`,
    test: process.env.SHOPIFY_BILLING_TEST === "true",
    price: "0.99",
    currency: "USD",
  });

  if (confirmationUrl) return redirect(confirmationUrl);
  return json({ shop: session.shop });
}

export default function App() {
  return null; // ton UI embarquée (ou mets ton composant React ici)
}
