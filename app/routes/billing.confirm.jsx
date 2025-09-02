// app/routes/billing.confirm.jsx
import { redirect } from "@remix-run/node";
import { shopify } from "../shopify.server";

export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const host = url.searchParams.get("host") || "";

  // Authentifie la session admin Shopify (crée ou rafraîchit la session si besoin)
  const { billing, session } = await shopify.authenticate.admin(request);

  // (Optionnel mais recommandé) : Vérifie que le marchand a bien un abonnement actif
  const { hasActivePayment } = await billing.check();
  if (!hasActivePayment) {
    // Redirige vers la page de pricing/plan si pas d'abonnement actif
    return redirect(`/pricing?host=${encodeURIComponent(host)}`);
  }

  // Redirige vers l'app principale (toujours passer host pour rester embedded)
  return redirect(`/app?host=${encodeURIComponent(host)}`);
};
