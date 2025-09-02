// app/routes/billing.confirm.jsx
import { redirect } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  const { billing } = await authenticate.admin(request);

  // 3) Très important: finaliser la confirmation du paiement
  //    Sans ça, billing.require(...) échoue et tu boucles vers Pricing.
  await billing.handleConfirmation(request);

  // 4) Puis retourne sur l’app (on garde les QS: shop/host…)
  const url = new URL(request.url);
  const qs = url.searchParams.toString();
  return redirect(`/app${qs ? `?${qs}` : ""}`);
};

export default function BillingConfirm() {
  return null;
}
